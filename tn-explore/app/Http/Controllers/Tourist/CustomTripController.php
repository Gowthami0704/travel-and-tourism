<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\CustomTrip;
use App\Models\District;
use App\Models\TripChat;
use App\Models\TripProposal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomTripController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $trips = CustomTrip::where('user_id', $user->id)
            ->withCount('proposals')
            ->with(['user', 'proposals.vendor.district'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Tourist/CustomTrips/Index', [
            'trips' => $trips,
        ]);
    }

    public function create(Request $request, \App\Services\TripPlannerService $plannerService)
    {
        // 1. Send only the minimal data this page needs (omit wiki markdown and user phone number)
        $districts = District::select('id', 'name', 'state_id')->orderBy('name')->get();
        $states = \App\Models\State::where('is_active', true)->select('id', 'name', 'code')->get();
        $places = \App\Models\Place::select('id', 'name', 'category', 'district_id', 'state_id', 'typical_visit_hours', 'entry_fee')->orderBy('name')->get();

        $popularCircuits = [
            [
                'id' => 'c1',
                'title' => 'Madurai – Rameswaram – Kanyakumari',
                'scope' => 'inside_tn',
                'days' => 4,
                'start_place' => 'Madurai',
                'end_place' => 'Kanyakumari',
                'destinations' => ['Madurai', 'Ramanathapuram', 'Kanniyakumari'],
                'theme' => 'Spiritual & Coastal Temples',
                'recommended_budget' => 24000,
                'highlights' => 'Meenakshi Amman Temple, Pamban Sea Bridge, Vivekananda Rock Memorial, Sunrise & Sunset Confluence.',
            ],
            [
                'id' => 'c2',
                'title' => 'Munnar & Alleppey Backwaters',
                'scope' => 'outside_tn',
                'days' => 3,
                'start_place' => 'Coimbatore',
                'end_place' => 'Kochi',
                'destinations' => ['Munnar Tea Gardens & Mattupetty Dam', 'Alleppey Backwaters & Houseboat Cruise'],
                'theme' => 'Misty Hills & Houseboat Cruise',
                'recommended_budget' => 22000,
                'highlights' => 'Tea plantation treks, Mattupetty Lake boating, tranquil palm-fringed Kerala backwater cruise.',
            ],
            [
                'id' => 'c3',
                'title' => 'Coorg & Mysore Royal Tour',
                'scope' => 'outside_tn',
                'days' => 3,
                'start_place' => 'Bangalore',
                'end_place' => 'Bangalore',
                'destinations' => ['Mysore Palace & Chamundi Hill', 'Coorg Abbey Falls & Coffee Plantations'],
                'theme' => 'Palaces & Coffee Hills',
                'recommended_budget' => 21000,
                'highlights' => 'Illuminated Mysore Palace, Chamundeshwari temple, aromatic coffee estate stay, and Abbey waterfalls.',
            ],
            [
                'id' => 'c4',
                'title' => 'Wayanad Eco Adventure Circuit',
                'scope' => 'outside_tn',
                'days' => 3,
                'start_place' => 'Kozhikode',
                'end_place' => 'Kozhikode',
                'destinations' => ['Wayanad Chembra Peak & Edakkal Caves'],
                'theme' => 'Trekking & Spice Hills',
                'recommended_budget' => 18000,
                'highlights' => 'Prehistoric Edakkal rock caves, Chembra heart lake hike, Bamboo raft rides, and spice gardens.',
            ],
            [
                'id' => 'c5',
                'title' => 'Tirupati & Srikalahasti Pilgrimage',
                'scope' => 'outside_tn',
                'days' => 2,
                'start_place' => 'Chennai',
                'end_place' => 'Chennai',
                'destinations' => ['Tirupati Sri Venkateswara Swamy Temple', 'Srikalahasti Vayu Lingam Temple'],
                'theme' => 'Sacred Darshan & Temple Architecture',
                'recommended_budget' => 14000,
                'highlights' => 'Tirumala Lord Balaji special Darshan, Srikalahasti Vayu Lingam Rahu-Ketu pariharam.',
            ],
            [
                'id' => 'c6',
                'title' => 'Chennai – Mahabalipuram – Puducherry Coastal Leg',
                'scope' => 'both',
                'days' => 3,
                'start_place' => 'Chennai',
                'end_place' => 'Puducherry',
                'destinations' => ['Chengalpattu', 'Promenade Beach & French Quarter (White Town)', 'Auroville Matrimandir & Golden Globe'],
                'theme' => 'UNESCO Heritage & French Riviera',
                'recommended_budget' => 19000,
                'highlights' => 'Shore Temple, Arjuna\'s Penance, French Colony boulevard walks, Auroville peace dome.',
            ],
            [
                'id' => 'c7',
                'title' => 'Hampi Virupaksha Heritage Ruins',
                'scope' => 'outside_tn',
                'days' => 3,
                'start_place' => 'Hubli / Bangalore',
                'end_place' => 'Hampi',
                'destinations' => ['Hampi Virupaksha Temple & Ruins'],
                'theme' => 'Vijayanagara Empire Monolithic Marvels',
                'recommended_budget' => 20000,
                'highlights' => 'Stone Chariot at Vittala Temple, Lotus Mahal, Tungabhadra sunset coracle boat ride.',
            ],
        ];

        // Initial default plan estimation
        $initialPlan = $plannerService->generatePlanOptions([
            'scope' => 'inside_tn',
            'start_place' => 'Chennai',
            'end_place' => 'Chennai',
            'route_type' => 'round',
            'destinations' => ['Madurai', 'Ramanathapuram', 'Kanniyakumari'],
            'days' => 3,
            'budget_total' => 20000,
            'budget_basis' => 'total',
            'travelers' => ['adults' => 2, 'children' => 0, 'seniors' => 0, 'accessibility' => false],
            'preferences' => ['pace' => 'moderate', 'interests' => ['heritage', 'nature'], 'stay_level' => 'balanced', 'transport' => 'suv', 'food_pref' => 'flexible', 'guide' => false],
        ]);

        // Initial trip ideas
        $initialIdeas = $plannerService->generateTripIdeas([
            'budget_total' => 25000,
            'budget_basis' => 'total',
            'adults_count' => 2,
            'children_count' => 0,
            'place_types' => ['heritage', 'beaches'],
            'region' => 'inside_tn',
        ]);

        // Sample ready packages for Q1 ready-made packages mode
        $readyPackages = \App\Models\Listing::where('type', 'package')
            ->where('status', 'active')
            ->with(['vendor', 'packageDepartures' => function($q) {
                $q->where('status', 'open')->where('date', '>=', now()->toDateString())->orderBy('date');
            }])
            ->latest('id')
            ->take(8)
            ->get();

        return Inertia::render('Tourist/CustomTrips/Create', [
            'districts' => $districts,
            'states' => $states,
            'places' => $places,
            'popularCircuits' => $popularCircuits,
            'initialPlan' => $initialPlan,
            'initialIdeas' => $initialIdeas,
            'readyPackages' => $readyPackages,
        ]);
    }

    /**
     * Live API Endpoint to generate 3-5 idea cards from budget and group size
     */
    public function generateIdeas(Request $request, \App\Services\TripPlannerService $plannerService)
    {
        $ideasData = $plannerService->generateTripIdeas($request->all());

        return response()->json([
            'success' => true,
            'data' => $ideasData,
        ]);
    }

    /**
     * Share idea set for Trip Mates collaboration
     */
    public function shareIdeas(Request $request)
    {
        $token = \Illuminate\Support\Str::random(12);
        $payload = [
            'token' => $token,
            'ideas' => $request->input('ideas', []),
            'pax' => $request->input('pax', 2),
            'budget' => $request->input('budget', 25000),
            'created_by' => $request->user()?->name ?? 'Traveler',
            'votes' => [],
            'created_at' => now()->toIso8601String(),
        ];

        \Illuminate\Support\Facades\Cache::put('shared_ideas_' . $token, $payload, now()->addDays(7));

        return response()->json([
            'success' => true,
            'share_url' => url('/custom-trips/ideas/shared/' . $token),
            'token' => $token,
        ]);
    }

    /**
     * View shared ideas page for Trip Mates voting
     */
    public function viewSharedIdeas($token)
    {
        $session = \Illuminate\Support\Facades\Cache::get('shared_ideas_' . $token);
        if (!$session) {
            return redirect()->route('custom-trips.create')->with('error', 'Shared trip idea link has expired or is invalid.');
        }

        return Inertia::render('Tourist/CustomTrips/SharedIdeas', [
            'session' => $session,
            'token' => $token,
        ]);
    }

    /**
     * Vote on an idea card
     */
    public function voteIdea(Request $request, $token)
    {
        $session = \Illuminate\Support\Facades\Cache::get('shared_ideas_' . $token);
        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Session expired'], 404);
        }

        $ideaId = $request->input('idea_id');
        $votes = $session['votes'] ?? [];
        $votes[$ideaId] = ($votes[$ideaId] ?? 0) + 1;
        $session['votes'] = $votes;

        \Illuminate\Support\Facades\Cache::put('shared_ideas_' . $token, $session, now()->addDays(7));

        return response()->json([
            'success' => true,
            'votes' => $votes,
        ]);
    }

    /**
     * Live API Endpoint to recompute the 3 plans and Feasibility Meter
     */
    public function generatePlanPreview(Request $request, \App\Services\TripPlannerService $plannerService)
    {
        $params = $request->all();
        $planData = $plannerService->generatePlanOptions($params);

        return response()->json([
            'success' => true,
            'data' => $planData,
        ]);
    }

    public function store(Request $request, \App\Services\TripPlannerService $plannerService)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'scope' => 'nullable|string|in:inside_tn,outside_tn,both',
            'destination_region' => 'nullable|string',
            'start_place' => 'nullable|string',
            'end_place' => 'nullable|string',
            'route_type' => 'nullable|string|in:round,one_way',
            'destinations' => 'required|array|min:1',
            'trip_type' => 'nullable|string',
            'date_mode' => 'nullable|string|in:exact,flexible',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'flexible_month' => 'nullable|string',
            'duration_days' => 'required|integer|min:1|max:30',
            'days' => 'nullable|integer|min:1|max:30',
            'adults_count' => 'nullable|integer|min:1|max:500',
            'children_count' => 'nullable|integer|min:0|max:100',
            'travelers' => 'nullable|array',
            'budget_total' => 'nullable|numeric|min:0',
            'budget_basis' => 'nullable|string|in:total,per_person',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'budget_split' => 'nullable|array',
            'accommodation_pref' => 'nullable|string',
            'stay_level' => 'nullable|string',
            'transport_pref' => 'nullable|string',
            'transport' => 'nullable|string',
            'food_pref' => 'nullable|string',
            'meals' => 'nullable|string',
            'guide' => 'nullable|boolean',
            'preferences' => 'nullable|array',
            'required_services' => 'nullable|array',
            'notes' => 'nullable|string|max:2000',
            'selected_plan' => 'nullable|string',
            'plan_options' => 'nullable|array',
        ]);

        $days = $validated['days'] ?? ($validated['duration_days'] ?? 3);
        $scope = $validated['scope'] ?? ($validated['destination_region'] ?? 'inside_tn');
        $adults = $validated['adults_count'] ?? ($validated['travelers']['adults'] ?? 2);
        $children = $validated['children_count'] ?? ($validated['travelers']['children'] ?? 0);
        $budgetTotal = $validated['budget_total'] ?? ($validated['budget_max'] ?? 20000);

        // Generate or retain deterministic plan payload
        $planOptions = $validated['plan_options'] ?? null;
        if (empty($planOptions)) {
            $computed = $plannerService->generatePlanOptions([
                'scope' => $scope,
                'start_place' => $validated['start_place'] ?? 'Chennai',
                'end_place' => $validated['end_place'] ?? ($validated['start_place'] ?? 'Chennai'),
                'route_type' => $validated['route_type'] ?? 'round',
                'destinations' => $validated['destinations'],
                'days' => $days,
                'budget_total' => $budgetTotal,
                'budget_basis' => $validated['budget_basis'] ?? 'total',
                'travelers' => ['adults' => $adults, 'children' => $children],
                'preferences' => $validated['preferences'] ?? [],
            ]);
            $planOptions = $computed;
        }

        $customTrip = CustomTrip::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'scope' => $scope,
            'destination_region' => $scope,
            'start_place' => $validated['start_place'] ?? 'Chennai',
            'end_place' => $validated['end_place'] ?? ($validated['start_place'] ?? 'Chennai'),
            'route_type' => $validated['route_type'] ?? 'round',
            'destinations' => $validated['destinations'],
            'trip_type' => $validated['trip_type'] ?? 'friends',
            'date_mode' => $validated['date_mode'] ?? 'exact',
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'flexible_month' => $validated['flexible_month'] ?? null,
            'duration_days' => $days,
            'adults_count' => $adults,
            'children_count' => $children,
            'travelers' => $validated['travelers'] ?? ['adults' => $adults, 'children' => $children],
            'budget_total' => $budgetTotal,
            'budget_basis' => $validated['budget_basis'] ?? 'total',
            'budget_min' => $validated['budget_min'] ?? round($budgetTotal * 0.75),
            'budget_max' => $budgetTotal,
            'budget_split' => $validated['budget_split'] ?? ($planOptions['plans'][$validated['selected_plan'] ?? 'balanced']['cost_breakdown'] ?? null),
            'accommodation_pref' => $validated['stay_level'] ?? ($validated['accommodation_pref'] ?? '3star_hotel'),
            'stay_level' => $validated['stay_level'] ?? 'balanced',
            'transport_pref' => $validated['transport'] ?? ($validated['transport_pref'] ?? 'suv'),
            'transport' => $validated['transport'] ?? 'suv',
            'food_pref' => $validated['food_pref'] ?? ($validated['meals'] ?? 'flexible'),
            'meals' => $validated['meals'] ?? 'mixed',
            'guide' => !empty($validated['guide']),
            'preferences' => $validated['preferences'] ?? [],
            'required_services' => $validated['required_services'] ?? [],
            'notes' => $validated['notes'] ?? null,
            'plan_options' => $planOptions,
            'selected_plan' => $validated['selected_plan'] ?? 'balanced',
            'status' => 'pending_verification',
        ]);

        // Generate Leg Bid Requests for matching vendors
        if (!empty($planOptions['legs'])) {
            foreach ($planOptions['legs'] as $idx => $leg) {
                \App\Models\CustomTripLeg::create([
                    'custom_trip_id' => $customTrip->id,
                    'leg_order' => $leg['leg_number'] ?? ($idx + 1),
                    'from_location' => $leg['region'] ?? 'Tamil Nadu',
                    'to_location' => $leg['primary_district'] ?? 'Tamil Nadu',
                    'status' => 'pending',
                ]);
            }
        }

        return redirect()->route('custom-trips.show', $customTrip->id)
            ->with('success', 'Your custom trip plan has been generated with verified database places and submitted for vendor bidding!');
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $trip = CustomTrip::where('id', $id)
            ->where('user_id', $user->id)
            ->with(['user', 'proposals.vendor.district', 'proposals.chat'])
            ->firstOrFail();

        return Inertia::render('Tourist/CustomTrips/Show', [
            'trip' => $trip,
        ]);
    }

    public function acceptProposal(Request $request, $id, $proposalId)
    {
        $user = $request->user();
        $trip = CustomTrip::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $proposal = TripProposal::where('id', $proposalId)->where('custom_trip_id', $trip->id)->firstOrFail();

        // 1. Mark this specific proposal as accepted
        $proposal->update(['status' => 'accepted']);
        $trip->update(['status' => 'booked']);

        // 2. Set all other proposals to declined (only 1 vendor accepted at a time)
        TripProposal::where('custom_trip_id', $trip->id)
            ->where('id', '!=', $proposal->id)
            ->update(['status' => 'declined']);

        // 3. Find or create chat
        $chat = TripChat::firstOrCreate(
            [
                'custom_trip_id' => $trip->id,
                'proposal_id' => $proposal->id,
                'tourist_id' => $user->id,
                'vendor_id' => $proposal->vendor_id,
            ],
            [
                'last_message_at' => now(),
            ]
        );

        return back()->with('success', "Proposal from {$proposal->vendor?->business_name} accepted! Booking finalized.");
    }

    public function dismissProposal(Request $request, $id, $proposalId)
    {
        $user = $request->user();
        $trip = CustomTrip::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $proposal = TripProposal::where('id', $proposalId)->where('custom_trip_id', $trip->id)->firstOrFail();

        if ($proposal->status === 'accepted') {
            // Dismissing the currently accepted proposal restores trip to active and re-opens all proposals
            $proposal->update(['status' => 'submitted']);
            TripProposal::where('custom_trip_id', $trip->id)->update(['status' => 'submitted']);
            $trip->update(['status' => 'verified_active']);

            return back()->with('success', "Selection for {$proposal->vendor?->business_name} has been dismissed. All vendor proposals are now re-opened for selection!");
        } else {
            // Dismissing a standard offer
            $proposal->update(['status' => 'declined']);
            return back()->with('success', "Proposal from {$proposal->vendor?->business_name} dismissed.");
        }
    }

    /**
     * AI-Powered Natural Language Prompt to Custom Trip Parser (TN Mitra)
     */
    public function aiParseTrip(Request $request): JsonResponse
    {
        $prompt = trim($request->input('prompt', ''));
        if (empty($prompt)) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a travel description (e.g., "3-day trip to Ooty from Chennai for 4 friends around 20k").'
            ], 422);
        }

        $parsedTrip = null;

        // Tier 1: DeepSeek AI (if DEEPSEEK_API_KEY is set)
        $deepseekKey = env('DEEPSEEK_API_KEY');
        if (!empty($deepseekKey)) {
            try {
                $parsedTrip = $this->callDeepseekTripParser($deepseekKey, $prompt);
            } catch (\Throwable $e) {
                Log::warning("DeepSeek Trip Parser failed: " . $e->getMessage());
            }
        }

        // Tier 2: Cloud Gemini AI (if valid key is set)
        if (!$parsedTrip) {
            $geminiKey = env('GEMINI_API_KEY');
            if (!empty($geminiKey) && !str_starts_with($geminiKey, 'AQ.') && strlen($geminiKey) >= 20) {
                try {
                    $parsedTrip = $this->callGeminiTripParser($geminiKey, $prompt);
                } catch (\Throwable $e) {
                    Log::warning("Gemini Trip Parser failed: " . $e->getMessage());
                }
            }
        }

        // Tier 3: Smart NLP Entity Extraction Engine (Guaranteed Instant Fallback)
        if (!$parsedTrip) {
            $parsedTrip = $this->fallbackSmartNlpParser($prompt);
        }

        return response()->json([
            'success' => true,
            'trip' => $parsedTrip,
        ]);
    }

    private function callDeepseekTripParser(string $apiKey, string $userPrompt): ?array
    {
        $systemInstruction = "You are TN Mitra, the AI travel planning assistant for Tamil Nadu & South India. "
            . "Extract structured trip parameters from the user's prompt and respond ONLY with a JSON object. "
            . "Fields required: title, fromLocation, toLocation, destination_region (inside_tn or outside_tn), "
            . "duration_days (integer), adults_count (integer), children_count (integer), trip_type (family, friends, solo, corporate), "
            . "budget_min (number), budget_max (number), accommodation_pref (budget_homestay, 3star_hotel, resort, villa), "
            . "transport_pref (sedan, suv, tempo_traveller), food_pref (veg, nonveg, flexible), "
            . "selectedInterests (array of strings from: temples, mountains, hidden_places, photo_spots, beaches, waterfalls_backwaters, adventure_camping, food_culinary), "
            . "itinerary_summary (brief day-by-day highlight), notes (special preferences extracted).";

        $url = "https://api.deepseek.com/chat/completions";
        $response = Http::timeout(6)->withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
        ])->post($url, [
            'model' => env('DEEPSEEK_MODEL', 'deepseek-chat'),
            'messages' => [
                ['role' => 'system', 'content' => $systemInstruction],
                ['role' => 'user', 'content' => "User Prompt: " . $userPrompt]
            ],
            'response_format' => ['type' => 'json_object'],
            'temperature' => 0.2,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $text = $data['choices'][0]['message']['content'] ?? null;
            if ($text) {
                $decoded = json_decode($text, true);
                if (is_array($decoded) && isset($decoded['toLocation'])) {
                    return $decoded;
                }
            }
        }

        return null;
    }

    private function callGeminiTripParser(string $apiKey, string $userPrompt): ?array
    {
        $systemInstruction = "You are TN Mitra, the AI travel planning assistant for Tamil Nadu & South India. "
            . "Extract structured trip parameters from the user's prompt and respond ONLY with a JSON object. "
            . "Fields required: title, fromLocation, toLocation, destination_region (inside_tn or outside_tn), "
            . "duration_days (integer), adults_count (integer), children_count (integer), trip_type (family, friends, solo, corporate), "
            . "budget_min (number), budget_max (number), accommodation_pref (budget_homestay, 3star_hotel, resort, villa), "
            . "transport_pref (sedan, suv, tempo_traveller), food_pref (veg, nonveg, flexible), "
            . "selectedInterests (array of strings from: temples, mountains, hidden_places, photo_spots, beaches, waterfalls_backwaters, adventure_camping, food_culinary), "
            . "itinerary_summary (brief day-by-day highlight), notes (special preferences extracted).";

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;
        $response = Http::timeout(4)->post($url, [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $systemInstruction . "\n\nUser Prompt: " . $userPrompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'response_mime_type' => 'application/json',
                'temperature' => 0.2,
            ]
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($text) {
                $decoded = json_decode($text, true);
                if (is_array($decoded) && isset($decoded['toLocation'])) {
                    return $decoded;
                }
            }
        }

        return null;
    }

    private function fallbackSmartNlpParser(string $prompt): array
    {
        $lower = strtolower($prompt);

        // 1. Duration Days
        $days = 3;
        if (preg_match('/(\d+)\s*(day|days|d\b)/i', $lower, $m)) {
            $days = max(1, min(30, (int)$m[1]));
        } elseif (preg_match('/(weekend|week end)/i', $lower)) {
            $days = 2;
        } elseif (preg_match('/(one week|1 week)/i', $lower)) {
            $days = 7;
        }

        // 2. Travelers count & Trip Type
        $adults = 2;
        $tripType = 'family';
        if (preg_match('/(\d+)\s*(people|adult|adults|friends|persons|pax|members)/i', $lower, $m)) {
            $adults = max(1, min(100, (int)$m[1]));
        }

        if (preg_match('/(friend|friends|buddies|gang|group)/i', $lower)) {
            $tripType = 'friends';
            if ($adults <= 2) $adults = 4;
        } elseif (preg_match('/(solo|alone|myself)/i', $lower)) {
            $tripType = 'solo';
            $adults = 1;
        } elseif (preg_match('/(couple|honeymoon|romantic)/i', $lower)) {
            $tripType = 'family';
            $adults = 2;
        } elseif (preg_match('/(corporate|office|colleagues|team)/i', $lower)) {
            $tripType = 'corporate';
            if ($adults <= 2) $adults = 10;
        }

        // 3. Origin & Destination Matching
        $from = 'Chennai';
        $commonOrigins = ['chennai', 'coimbatore', 'madurai', 'trichy', 'salem', 'tirunelveli', 'bangalore', 'kochi', 'cochin', 'vellore'];
        foreach ($commonOrigins as $orig) {
            if (preg_match('/from\s+' . $orig . '/i', $lower) || (str_contains($lower, $orig) && !preg_match('/to\s+' . $orig . '/i', $lower))) {
                $from = ucfirst($orig);
                if ($orig === 'trichy') $from = 'Tiruchirappalli (Trichy)';
                if ($orig === 'kochi' || $orig === 'cochin') $from = 'Kochi / Cochin';
                break;
            }
        }

        $to = 'Ooty & Nilgiris';
        $region = 'inside_tn';
        $destinationMap = [
            'ooty' => ['Ooty & Nilgiris', 'inside_tn'],
            'nilgiris' => ['Ooty & Nilgiris', 'inside_tn'],
            'kodaikanal' => ['Kodaikanal', 'inside_tn'],
            'kodai' => ['Kodaikanal', 'inside_tn'],
            'munnar' => ['Munnar & Alleppey (Kerala)', 'outside_tn'],
            'alleppey' => ['Munnar & Alleppey (Kerala)', 'outside_tn'],
            'alappuzha' => ['Munnar & Alleppey (Kerala)', 'outside_tn'],
            'kerala' => ['Munnar & Alleppey (Kerala)', 'outside_tn'],
            'wayanad' => ['Wayanad (Kerala)', 'outside_tn'],
            'varkala' => ['Varkala & Kovalam (Kerala)', 'outside_tn'],
            'kovalam' => ['Varkala & Kovalam (Kerala)', 'outside_tn'],
            'goa' => ['Goa', 'outside_tn'],
            'coorg' => ['Coorg & Chikmagalur (Karnataka)', 'outside_tn'],
            'chikmagalur' => ['Coorg & Chikmagalur (Karnataka)', 'outside_tn'],
            'hampi' => ['Hampi & Gokarna (Karnataka)', 'outside_tn'],
            'pondicherry' => ['Pondicherry', 'outside_tn'],
            'pondy' => ['Pondicherry', 'outside_tn'],
            'madurai' => ['Madurai & Rameswaram', 'inside_tn'],
            'rameswaram' => ['Madurai & Rameswaram', 'inside_tn'],
            'kanyakumari' => ['Kanyakumari', 'inside_tn'],
            'thanjavur' => ['Thanjavur Big Temple', 'inside_tn'],
            'mahabalipuram' => ['Mahabalipuram & ECR', 'inside_tn'],
            'yercaud' => ['Yercaud', 'inside_tn'],
            'courtallam' => ['Courtallam Waterfalls', 'inside_tn'],
            'valparai' => ['Valparai & Topslip', 'inside_tn'],
        ];

        foreach ($destinationMap as $keyword => $destMeta) {
            if (str_contains($lower, $keyword)) {
                $to = $destMeta[0];
                $region = $destMeta[1];
                break;
            }
        }

        // 4. Budget Calculation
        $budgetMin = $days * $adults * 1500;
        $budgetMax = $days * $adults * 3500;
        if (preg_match('/(\d+)\s*(k|thousand|000)/i', $lower, $m)) {
            $extracted = (int)$m[1];
            if ($extracted < 100) $extracted *= 1000;
            $budgetMax = $extracted;
            $budgetMin = max(2000, round($extracted * 0.6));
        }

        // 5. Interests & Vibes
        $interests = [];
        if (preg_match('/(temple|heritage|spiritual|puja|darshan|history)/i', $lower)) $interests[] = 'temples';
        if (preg_match('/(mountain|hill|tea|mist|peak|cold|fog)/i', $lower)) $interests[] = 'mountains';
        if (preg_match('/(beach|sea|coast|sand|ocean|surf)/i', $lower)) $interests[] = 'beaches';
        if (preg_match('/(photo|pic|drone|aesthetic|viewpoint|instagram)/i', $lower)) $interests[] = 'photo_spots';
        if (preg_match('/(waterfall|boat|houseboat|lake|backwater)/i', $lower)) $interests[] = 'waterfalls_backwaters';
        if (preg_match('/(camp|tent|trek|bbq|bonfire|safari|jeep)/i', $lower)) $interests[] = 'adventure_camping';
        if (preg_match('/(food|dosa|biryani|restaurant|cuisine|feast)/i', $lower)) $interests[] = 'food_culinary';
        if (preg_match('/(hidden|secret|offbeat|peaceful|quiet|isolated)/i', $lower)) $interests[] = 'hidden_places';

        if (empty($interests)) {
            $interests = ['mountains', 'photo_spots'];
        }

        // 6. Food & Stay preferences
        $foodPref = 'flexible';
        if (str_contains($lower, 'veg') && !str_contains($lower, 'nonveg') && !str_contains($lower, 'non-veg')) {
            $foodPref = 'veg';
        } elseif (str_contains($lower, 'non-veg') || str_contains($lower, 'nonveg') || str_contains($lower, 'seafood')) {
            $foodPref = 'nonveg';
        }

        $stayPref = '3star_hotel';
        if (str_contains($lower, 'budget') || str_contains($lower, 'hostel') || str_contains($lower, 'homestay')) {
            $stayPref = 'budget_homestay';
        } elseif (str_contains($lower, 'luxury') || str_contains($lower, 'resort') || str_contains($lower, '5-star') || str_contains($lower, '5 star')) {
            $stayPref = 'resort';
        }

        $transportPref = $adults <= 4 ? 'suv' : 'tempo_traveller';

        $title = "{$days}-Day {$to} " . ucfirst($tripType) . " Escape";

        return [
            'title' => $title,
            'fromLocation' => $from,
            'toLocation' => $to,
            'destination_region' => $region,
            'duration_days' => $days,
            'adults_count' => $adults,
            'children_count' => 0,
            'trip_type' => $tripType,
            'budget_min' => $budgetMin,
            'budget_max' => $budgetMax,
            'accommodation_pref' => $stayPref,
            'transport_pref' => $transportPref,
            'food_pref' => $foodPref,
            'selectedInterests' => $interests,
            'itinerary_summary' => "Day 1: Departure from {$from} -> Arrive at {$to} -> Check-in & evening sightseeing.\nDay 2: Full-day guided sightseeing & scenic attractions.\nDay 3: Scenic viewpoints, souvenir shopping & return journey.",
            'notes' => "AI-generated trip request based on traveler preferences for {$to}."
        ];
    }
}

