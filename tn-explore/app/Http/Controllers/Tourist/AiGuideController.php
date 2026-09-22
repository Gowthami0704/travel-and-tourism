<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AiGuideController extends Controller
{
    /**
     * Cache for tourism data records
     */
    private static ?array $tourismData = null;

    /**
     * Display the full-page TN Mitra AI Guide
     */
    public function index(Request $request): Response
    {
        $districts = District::with(['places' => function ($q) {
            $q->select('id', 'district_id', 'name', 'category', 'is_hidden_gem');
        }])->orderBy('name')->get(['id', 'name', 'region', 'hero_image_url', 'best_season']);

        return Inertia::render('Tourist/AiGuide', [
            'districts' => $districts,
            'initialContext' => [
                'district' => $request->query('district', null),
                'prompt' => $request->query('q', null),
            ],
        ]);
    }

    /**
     * Proxy endpoint for TN Mitra AI Chat with RAG + Multi-Tier AI Provider
     */
    public function chat(Request $request): JsonResponse
    {
        $message = trim($request->input('message', ''));
        $history = $request->input('history', []); // Array of { role: 'user'|'assistant', content: string }
        $context = $request->input('context', []); // e.g. { district: 'Chennai' }

        if (empty($message)) {
            return response()->json([
                'reply' => 'Please provide a question about Tamil Nadu tourism! 🙏',
                'source' => 'offline',
                'rag_sources' => [],
            ]);
        }

        // 1. Perform RAG keyword retrieval from tourism dataset
        $ragRecords = $this->retrieveRelevantPlaces($message, $context);

        // 2. Build system prompt and full prompt
        $systemPrompt = $this->buildSystemPrompt($ragRecords, $context);
        $fullPrompt = $this->composeConversationPrompt($systemPrompt, $history, $message);

        // 3. Multi-tier execution:
        // Tier 1: Cloud Gemini API
        $geminiKey = env('GEMINI_API_KEY');
        if (!empty($geminiKey)) {
            try {
                $cloudResponse = $this->callGemini($geminiKey, $systemPrompt, $history, $message);
                if (!empty($cloudResponse)) {
                    return response()->json([
                        'reply' => $cloudResponse,
                        'source' => 'cloud',
                        'rag_sources' => $ragRecords,
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning("Gemini AI failed, attempting Ollama fallback: " . $e->getMessage());
            }
        }

        // Tier 2: Local / Remote Ollama (Mistral)
        $ollamaUrl = env('OLLAMA_URL', 'http://localhost:11434');
        $ollamaModel = env('OLLAMA_MODEL', 'mistral');
        if (!empty($ollamaUrl)) {
            try {
                $localResponse = $this->callOllama($ollamaUrl, $ollamaModel, $fullPrompt);
                if (!empty($localResponse)) {
                    return response()->json([
                        'reply' => $localResponse,
                        'source' => 'local',
                        'rag_sources' => $ragRecords,
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning("Ollama AI failed, switching to smart offline engine: " . $e->getMessage());
            }
        }

        // Tier 3: Smart Offline Knowledge Engine
        $offlineResponse = $this->generateOfflineKnowledgeReply($message, $ragRecords, $context);
        return response()->json([
            'reply' => $offlineResponse,
            'source' => 'offline',
            'rag_sources' => $ragRecords,
        ]);
    }

    /**
     * Retrieve top 5 matching places for RAG from JSON dataset or database
     */
    private function retrieveRelevantPlaces(string $query, array $context): array
    {
        $allData = $this->getTourismData();
        if (empty($allData)) {
            return [];
        }

        $queryLower = mb_strtolower($query);
        $contextDistrict = isset($context['district']) ? mb_strtolower($context['district']) : '';
        
        // Tokenize query words
        $stopWords = ['the', 'is', 'in', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'tell', 'me', 'about', 'what', 'where', 'how', 'can', 'you', 'plan', 'trip'];
        $words = preg_split('/[\s,\.!\?]+/', $queryLower, -1, PREG_SPLIT_NO_EMPTY);
        $keywords = array_values(array_filter($words, fn($w) => strlen($w) > 2 && !in_array($w, $stopWords)));

        $scored = [];

        foreach ($allData as $item) {
            $score = 0;
            $nameLower = mb_strtolower($item['name'] ?? '');
            $distLower = mb_strtolower($item['district'] ?? '');
            $catLower = mb_strtolower($item['category'] ?? '');
            $typeLower = mb_strtolower($item['type'] ?? '');
            $descLower = mb_strtolower($item['description'] ?? '');
            $tagsLower = mb_strtolower($item['tags'] ?? '');

            // District matching boost
            if (!empty($contextDistrict) && str_contains($distLower, $contextDistrict)) {
                $score += 5;
            }
            if (str_contains($queryLower, $distLower) && !empty($distLower)) {
                $score += 8;
            }

            // Exact place name match
            if (!empty($nameLower) && str_contains($queryLower, $nameLower)) {
                $score += 15;
            }

            // Keyword matches
            foreach ($keywords as $kw) {
                if (str_contains($nameLower, $kw)) $score += 6;
                if (str_contains($distLower, $kw)) $score += 4;
                if (str_contains($catLower, $kw)) $score += 3;
                if (str_contains($typeLower, $kw)) $score += 3;
                if (str_contains($tagsLower, $kw)) $score += 3;
                if (str_contains($descLower, $kw)) $score += 1;
            }

            if ($score > 0) {
                $scored[] = [
                    'score' => $score,
                    'record' => $item,
                ];
            }
        }

        // Sort by relevance score descending
        usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);

        $topRecords = array_slice($scored, 0, 5);
        return array_map(fn($item) => $item['record'], $topRecords);
    }

    /**
     * Load tourism_data.json into memory
     */
    private function getTourismData(): array
    {
        if (self::$tourismData !== null) {
            return self::$tourismData;
        }

        $jsonPath = base_path('data/tourism_data.json');
        if (File::exists($jsonPath)) {
            $content = File::get($jsonPath);
            self::$tourismData = json_decode($content, true) ?: [];
            return self::$tourismData;
        }

        // Fallback to SQLite DB places
        $places = Place::with('district')->limit(500)->get();
        self::$tourismData = $places->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'district' => $p->district->name ?? 'Tamil Nadu',
                'category' => $p->category,
                'type' => $p->is_hidden_gem ? 'Hidden Gem' : 'Attraction',
                'description' => $p->description,
                'maps_url' => $p->wiki_url,
                'tags' => $p->category . ', ' . ($p->is_hidden_gem ? 'hidden gem' : 'tourist place'),
            ];
        })->toArray();

        return self::$tourismData;
    }

    /**
     * Build the specialized System Prompt with RAG Context and Scope Guardrails
     */
    private function buildSystemPrompt(array $ragRecords, array $context): string
    {
        $contextText = "";
        if (!empty($ragRecords)) {
            $contextText = "VERIFIED TAMIL NADU TOURISM DATA:\n";
            foreach ($ragRecords as $idx => $r) {
                $num = $idx + 1;
                $name = $r['name'] ?? 'Unknown';
                $dist = $r['district'] ?? 'Tamil Nadu';
                $type = $r['type'] ?? $r['category'] ?? 'Attraction';
                $desc = $r['description'] ?? '';
                $tags = $r['tags'] ?? '';
                $maps = $r['maps_url'] ?? '';

                $contextText .= "{$num}. Place: {$name} | District: {$dist} | Type: {$type}\n";
                if (!empty($desc)) $contextText .= "   Details: {$desc}\n";
                if (!empty($tags)) $contextText .= "   Tags: {$tags}\n";
                if (!empty($maps)) $contextText .= "   Location Link: {$maps}\n";
            }
        }

        return <<<PROMPT
You are "TN Mitra", the official AI Smart Travel Companion for TN EXPLORE (Tamil Nadu Tourism).
You are a warm, welcoming, and deeply knowledgeable local travel expert across all 38 districts of Tamil Nadu.

STRICT SCOPE & GUARDRAILS:
1. SPECIALIZED SCOPE ONLY: You ONLY answer questions about Tamil Nadu tourism, including places, districts, heritage temples, hill stations, beaches, local authentic cuisine & food trails, hotel suggestions, itineraries, routes, and cultural traditions.
2. UNRELATED QUESTIONS: If the user asks about anything outside Tamil Nadu tourism (such as general coding, world politics, non-TN sports, math, etc.), you MUST politely decline with:
   "I'm TN Mitra, your Tamil Nadu tourism guide. I can only help with places, food, hotels, and travel in Tamil Nadu. Ask me about any of our 38 districts!"
3. MULTILINGUAL SUPPORT: You must detect and reply in the EXACT language the user used (Tamil தமிழ், Tanglish, English, or Hindi). If the user writes in Tamil, reply in friendly Tamil. If in English, reply in English.
4. FACTUAL GROUNDING: Rely on the verified tourism context provided below to give accurate place names, district locations, and tips.
5. ITINERARIES: When asked to "Plan a trip" or "Generate an itinerary", organize the response cleanly with:
   - Day-by-day breakdowns (Morning, Afternoon, Evening)
   - Real places from the dataset
   - Must-try local food & specialties (e.g. Madurai Jigarthanda, Chettinad Chicken, filter coffee)
   - Practical travel tips (best travel hours, attire for temples)
6. TRAVEL OPTIONS COMPARISON: When asked to "Compare travel options", "Bus vs Train vs Car", or how to travel between places:
   - Give a structured side-by-side comparison of all 4 modes:
     * 🚆 **Train (Express / Vande Bharat / Superfast):** Approximate ticket cost (₹), travel duration, comfort level, and scenic highlights (e.g. Pamban bridge, Western Ghats).
     * 🚌 **Bus (SETC AC Sleeper / Ultra Deluxe):** Frequency, budget cost (₹), overnight availability, ghat road suitability.
     * 🚗 **Self-Drive / Outstation Cab:** Cost estimate (~₹12-15/km), highway toll insights (NH44 / NH45), flexibility for family & stops.
     * 🛵 **Motorbike / Rental Scooter:** Fuel estimate, hair-pin bend scenic thrills, safety tips.
   - Provide a definitive **"💡 Best Choice Recommendation"** for solo travelers, couples, and families.
7. TONE: Welcoming ("Vanakkam! 🙏"), enthusiastic, respectful, and well-structured using markdown bullets, bold headings, and emojis.

{$contextText}
PROMPT;
    }

    /**
     * Compose multi-turn conversation prompt
     */
    private function composeConversationPrompt(string $systemPrompt, array $history, string $message): string
    {
        $prompt = $systemPrompt . "\n\nCONVERSATION HISTORY:\n";
        
        $recentHistory = array_slice($history, -10); // Keep last 10 messages
        foreach ($recentHistory as $turn) {
            $role = ($turn['role'] ?? 'user') === 'assistant' ? 'TN Mitra' : 'User';
            $content = $turn['content'] ?? '';
            $prompt .= "{$role}: {$content}\n";
        }

        $prompt .= "User: {$message}\nTN Mitra:";
        return $prompt;
    }

    /**
     * Call Google Gemini API
     */
    private function callGemini(string $apiKey, string $systemPrompt, array $history, string $message): ?string
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}";

        $contents = [];
        
        // System instruction representation
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => "SYSTEM INSTRUCTION:\n" . $systemPrompt]]
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => "Vanakkam! 🙏 I am TN Mitra, your Tamil Nadu Smart Tourism AI Guide. I will strictly follow all guidelines and assist travelers with authentic, verified information."]]
        ];

        // Multi-turn history
        $recentHistory = array_slice($history, -8);
        foreach ($recentHistory as $turn) {
            $role = ($turn['role'] ?? 'user') === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $turn['content'] ?? '']]
            ];
        }

        // Current message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $message]]
        ];

        $payload = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 1200,
                'topP' => 0.9,
            ],
        ];

        $response = Http::timeout(10)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, $payload);

        if ($response->successful()) {
            $data = $response->json();
            $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            return $reply ? trim($reply) : null;
        }

        Log::warning("Gemini API error code: " . $response->status() . " - " . $response->body());
        return null;
    }

    /**
     * Call Ollama local/remote instance
     */
    private function callOllama(string $baseUrl, string $model, string $prompt): ?string
    {
        $endpoint = rtrim($baseUrl, '/') . '/api/generate';

        $payload = [
            'model' => $model,
            'prompt' => $prompt,
            'stream' => false,
            'options' => [
                'temperature' => 0.7,
                'num_predict' => 800,
            ],
        ];

        $response = Http::timeout(8)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($endpoint, $payload);

        if ($response->successful()) {
            $data = $response->json();
            $reply = $data['response'] ?? null;
            return $reply ? trim($reply) : null;
        }

        return null;
    }

    /**
     * Intelligent Offline Smart Knowledge Engine (when cloud & Ollama are offline)
     */
    private function generateOfflineKnowledgeReply(string $query, array $ragRecords, array $context): string
    {
        $queryLower = mb_strtolower($query);

        // Check if query is unrelated to TN
        $tourismKeywords = ['district', 'temple', 'beach', 'hill', 'hotel', 'stay', 'food', 'dish', 'trip', 'plan', 'itinerary', 'travel', 'bus', 'train', 'budget', 'ooty', 'madurai', 'chennai', 'kodaikanal', 'thanjavur', 'rameshwaram', 'kanyakumari', 'coimbatore', 'salem', 'tirunelveli', 'dindigul', 'gem', 'waterfall', 'fort', 'heritage', 'compare', 'car', 'cab', 'bike', 'flight', 'mode', 'route'];
        
        $hasTourismKeyword = false;
        foreach ($tourismKeywords as $kw) {
            if (str_contains($queryLower, $kw)) {
                $hasTourismKeyword = true;
                break;
            }
        }

        if (!$hasTourismKeyword && empty($ragRecords)) {
            return "🙏 **Vanakkam!** I'm **TN Mitra**, your specialized Tamil Nadu tourism guide.\n\nI can only help with places, authentic cuisine, hotels, travel options comparison, and itinerary planning across the **38 districts of Tamil Nadu**.\n\n💡 *Try asking:*\n- *\"Compare Bus vs Train vs Cab to Madurai\"*\n- *\"Plan a 3-day trip to Kodaikanal\"*\n- *\"Top hidden gems in Nilgiris\"*";
        }

        // Travel Option Comparison Offline
        if (str_contains($queryLower, 'compare') || str_contains($queryLower, 'vs') || str_contains($queryLower, 'option') || str_contains($queryLower, 'mode') || (str_contains($queryLower, 'bus') && str_contains($queryLower, 'train'))) {
            $destName = !empty($ragRecords) ? ($ragRecords[0]['district'] ?? 'Tamil Nadu') : ($context['district'] ?? 'Tamil Nadu Destination');

            return "📊 **TN Mitra Travel Options Comparison for {$destName}**\n\n" .
                   "| Mode | Est. Cost / Person | Travel Time | Comfort & Scenic Score | Best Suited For |\n" .
                   "| :--- | :--- | :--- | :--- | :--- |\n" .
                   "| 🚆 **Train (Express/Vande Bharat)** | ₹180 - ₹850 | Fast & On-Time | ⭐⭐⭐⭐⭐ (Panoramic, AC) | Relaxed journeys, solo & seniors |\n" .
                   "| 🚌 **Bus (SETC AC Sleeper)** | ₹350 - ₹950 | Overnight Transit | ⭐⭐⭐⭐☆ (Direct drop) | Budget travelers & night travel |\n" .
                   "| 🚗 **Outstation Cab / Self-Drive** | ₹12 - ₹16 / km | Flexible stops | ⭐⭐⭐⭐⭐ (Full freedom) | Families & multi-spot sightseeing |\n" .
                   "| 🛵 **Motorbike / Rental Ride** | ₹600 - ₹1,200 / day | Highway cruising | ⭐⭐⭐⭐☆ (Thrilling hairpins) | Adventurers & mountain lovers |\n\n" .
                   "💡 **TN Mitra Recommendation:**\n" .
                   "- For hill journeys (Ooty, Kodaikanal), take a **Train to the foothills (Coimbatore/Mettupalayam or Dindigul)** and continue via **Cab / Toy Train** for stunning mountain vistas.\n" .
                   "- For temple circuits (Thanjavur, Madurai, Tirunelveli), **Express Trains & Vande Bharat** offer the best speed and punctuality.";
        }

        // Itinerary generation offline
        if (str_contains($queryLower, 'plan') || str_contains($queryLower, 'itinerary') || str_contains($queryLower, 'day')) {
            $districtName = !empty($ragRecords) ? ($ragRecords[0]['district'] ?? 'Tamil Nadu') : ($context['district'] ?? 'Tamil Nadu');
            
            $placesList = array_slice($ragRecords, 0, 4);
            $p1 = $placesList[0]['name'] ?? "Scenic Viewpoint & Heritage Monument";
            $p2 = $placesList[1]['name'] ?? "Historic Temple & Cultural Center";
            $p3 = $placesList[2]['name'] ?? "Nature Trail & Lakefront";
            $p4 = $placesList[3]['name'] ?? "Local Artisan Craft Market";

            return "🌟 **Suggested Itinerary for {$districtName} (Offline Knowledge Base)**\n\n" .
                   "### 🗓️ Day 1: Heritage & Highlights\n" .
                   "- **Morning (08:00 AM - 11:30 AM):** Visit **{$p1}**. Enjoy traditional Tamil breakfast (Idli, Vada, and Filter Coffee).\n" .
                   "- **Afternoon (01:00 PM - 03:30 PM):** Head to **{$p2}**. Relish authentic South Indian banana leaf lunch.\n" .
                   "- **Evening (05:00 PM - 07:30 PM):** Stroll around the vibrant market square and sample evening snacks.\n\n" .
                   "### 🗓️ Day 2: Nature & Local Treasures\n" .
                   "- **Morning:** Explore **{$p3}** for photography and scenic views.\n" .
                   "- **Afternoon:** Discover **{$p4}** and pick up authentic GI-tagged local souvenirs.\n\n" .
                   "💡 *Tip: For deeper AI answers, you can start Ollama locally (`ollama run mistral`) or add your Gemini API Key.*";
        }

        // Standard place / food response
        if (!empty($ragRecords)) {
            $top = $ragRecords[0];
            $name = $top['name'] ?? 'Tourist Attraction';
            $district = $top['district'] ?? 'Tamil Nadu';
            $desc = $top['description'] ?? "A captivating travel destination in {$district}.";
            $type = $top['type'] ?? $top['category'] ?? 'Heritage & Nature';

            $reply = "🙏 **Vanakkam! Here is what I found about {$name} in {$district}:**\n\n";
            $reply .= "📍 **Category:** {$type}\n";
            $reply .= "📖 **Highlights:** {$desc}\n\n";

            if (count($ragRecords) > 1) {
                $reply .= "✨ **Other nearby places you should visit in {$district}:**\n";
                foreach (array_slice($ragRecords, 1, 4) as $other) {
                    $otherName = $other['name'] ?? '';
                    $otherType = $other['category'] ?? $other['type'] ?? 'Spot';
                    $reply .= "- **{$otherName}** ({$otherType})\n";
                }
            }

            $reply .= "\n🍽️ **Culinary Tip:** Be sure to try the local regional delicacies in {$district}!";
            return $reply;
        }

        return "🙏 **Vanakkam!** Welcome to Tamil Nadu Smart Tourism.\n\nTamil Nadu is home to **38 breathtaking districts**, from the Nilgiri hills to the coastal shores of Kanyakumari. Tell me which district you'd like to explore, and I will tailor recommendations and itineraries for you!";
    }
}
