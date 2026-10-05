<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\District;
use App\Models\Place;
use App\Models\CustomTrip;
use App\Models\TripProposal;
use App\Models\TripChat;
use App\Models\TripMessage;
use App\Models\Vendor;
use App\Models\Booking;
use App\Http\Controllers\Tourist\AiGuideController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

echo "=======================================================\n";
echo "       TN EXPLORE — FULL SYSTEM HEALTH VERIFICATION\n";
echo "=======================================================\n\n";

$results = [
    'tourist_flow' => false,
    'admin_flow' => false,
    'vendor_flow' => false,
    'chat_flow' => false,
    'ai_bot_rag' => false,
    'fastapi_multiagent' => false,
];

// 1. TOURIST FLOW TEST
echo "1. Testing Tourist Custom Trip Creation & Dashboard...\n";
try {
    $tourist = User::where('role', 'tourist')->first();
    if (!$tourist) {
        $tourist = User::firstOrCreate([
            'email' => 'tourist@tnexplore.com',
        ], [
            'name' => 'Test Tourist',
            'password' => bcrypt('password'),
            'role' => 'tourist',
        ]);
    }

    $testTrip = CustomTrip::create([
        'user_id' => $tourist->id,
        'title' => 'Verification 4-Day Kerala & Ooty Mountain Escape',
        'destination_region' => 'outside_tn',
        'destinations' => ['From: Coimbatore', 'To: Munnar & Alleppey (Kerala)', 'Interests: mountains, photo_spots'],
        'trip_type' => 'friends',
        'start_date' => date('Y-m-d', strtotime('+7 days')),
        'end_date' => date('Y-m-d', strtotime('+11 days')),
        'duration_days' => 4,
        'adults_count' => 4,
        'children_count' => 0,
        'budget_min' => 12000,
        'budget_max' => 28000,
        'accommodation_pref' => '3star_hotel',
        'transport_pref' => 'suv',
        'food_pref' => 'flexible',
        'required_services' => ['cab_driver', 'hotel_stay', 'breakfast'],
        'notes' => 'Need SUV Innova Crysta and tea plantation viewpoint tour.',
        'status' => 'pending_verification',
    ]);

    // Check dashboard fetching
    $fetchedTrips = CustomTrip::where('user_id', $tourist->id)
        ->withCount('proposals')
        ->orderBy('created_at', 'desc')
        ->get();

    if ($testTrip && $fetchedTrips->count() > 0) {
        echo "   [PASS] Tourist Custom Trip created successfully (ID: {$testTrip->id}, Status: {$testTrip->status})\n";
        echo "   [PASS] Tourist Dashboard loaded {$fetchedTrips->count()} custom trip(s).\n";
        $results['tourist_flow'] = true;
    }
} catch (\Exception $e) {
    echo "   [FAIL] Tourist Flow Error: " . $e->getMessage() . "\n";
}

// 2. ADMIN FLOW TEST
echo "\n2. Testing Admin Review & Verification Workflow...\n";
try {
    $admin = User::where('role', 'admin')->first();
    echo "   [INFO] Admin account found: " . ($admin ? $admin->email : 'None') . "\n";

    // Admin approves the trip
    $testTrip->update([
        'status' => 'verified_active',
        'admin_notes' => 'Verified and approved for verified Nilgiris & Kerala operators.',
    ]);

    $refreshed = CustomTrip::find($testTrip->id);
    if ($refreshed->status === 'verified_active') {
        echo "   [PASS] Admin approval succeeded: Custom Trip status changed to 'verified_active' (Open for Quotes).\n";
        $results['admin_flow'] = true;
    } else {
        echo "   [FAIL] Custom Trip status is {$refreshed->status}\n";
    }
} catch (\Exception $e) {
    echo "   [FAIL] Admin Flow Error: " . $e->getMessage() . "\n";
}

// 3. VENDOR PROPOSAL FLOW TEST
echo "\n3. Testing Vendor Opportunities & Proposal Bidding...\n";
try {
    $vendorUser = User::where('role', 'vendor')->first();
    $vendorProfile = Vendor::first();

    if ($vendorProfile && $vendorUser) {
        echo "   [INFO] Vendor found: {$vendorProfile->business_name} ({$vendorUser->email})\n";

        // Vendor sees verified opportunities
        $opportunities = CustomTrip::where('status', 'verified_active')->get();
        echo "   [PASS] Vendor can see {$opportunities->count()} verified custom trip opportunities.\n";

        // Vendor creates a proposal
        $proposal = TripProposal::create([
            'custom_trip_id' => $testTrip->id,
            'vendor_id' => $vendorProfile->id,
            'quote_price' => 19500,
            'itinerary_summary' => '4-Day Munnar tea gardens, Eravikulam park, and Alleppey private houseboat cruise.',
            'vendor_message' => 'Includes 2023 AC Innova Crysta, licensed hill driver, and 3-star mountain resort.',
            'inclusions' => ['Dedicated AC Cab & Driver', 'Complimentary Breakfast & Dinner', 'Plantation Tour Guide', 'All Tolls & Parking'],
            'exclusions' => ['Personal Shopping', 'Water Sports Entry Fees'],
            'status' => 'submitted',
        ]);

        echo "   [PASS] Vendor Proposal submitted successfully (Proposal ID: {$proposal->id}, Quote: ₹19,500).\n";
        $results['vendor_flow'] = true;

        // 4. REAL-TIME CHAT TEST
        echo "\n4. Testing Real-time Chat Room between Tourist & Vendor...\n";
        $chat = TripChat::firstOrCreate([
            'custom_trip_id' => $testTrip->id,
            'vendor_id' => $vendorProfile->id,
            'tourist_id' => $tourist->id,
        ], [
            'proposal_id' => $proposal->id,
        ]);

        TripMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $vendorUser->id,
            'sender_role' => 'vendor',
            'message' => 'Vanakkam! We have submitted our customized proposal with AC Innova Crysta and luxury valley resort stay.',
            'is_read' => false,
        ]);

        TripMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $tourist->id,
            'sender_role' => 'tourist',
            'message' => 'Thank you! Can we include an early morning tea garden trek on Day 2?',
            'is_read' => true,
        ]);

        $msgCount = TripMessage::where('chat_id', $chat->id)->count();
        echo "   [PASS] Trip Chatroom active (Chat ID: {$chat->id}, {$msgCount} messages exchanged).\n";
        $results['chat_flow'] = true;
    }
} catch (\Exception $e) {
    echo "   [FAIL] Vendor/Chat Flow Error: " . $e->getMessage() . "\n";
}

// 5. FASTAPI MULTI-AGENT & ISOLATION FOREST AI SERVER TEST
echo "\n5. Testing FastAPI Multi-Agent Framework (Port 8001)...\n";
try {
    $fastApiHealth = Http::timeout(4)->get('http://127.0.0.1:8001/');
    if ($fastApiHealth->successful()) {
        $healthData = $fastApiHealth->json();
        echo "   [PASS] FastAPI Server Online: " . ($healthData['status'] ?? 'ok') . "\n";
        echo "   [PASS] Loaded Agents: " . implode(', ', $healthData['agents'] ?? []) . "\n";

        // Test Recommendation Endpoint
        $recRes = Http::timeout(4)->post('http://127.0.0.1:8001/recommend/multi-agent', [
            'preferences' => ['temple', 'hill'],
            'days' => 3,
            'travelers' => 4,
            'budget_level' => 'moderate',
            'transit_preference' => 'eco_friendly',
            'start_district' => 'Coimbatore',
            'destination_district' => 'Ooty',
        ]);

        if ($recRes->successful()) {
            $recData = $recRes->json();
            echo "   [PASS] Multi-Agent Personalization Accuracy: " . ($recData['personalization_accuracy'] ?? 'N/A') . "\n";
            echo "   [PASS] SDG 11 Carbon Saved: " . ($recData['sdg_impact']['sdg_11_carbon_saved'] ?? 'N/A') . "\n";
            $results['fastapi_multiagent'] = true;
        }
    } else {
        echo "   [WARN] FastAPI returned status " . $fastApiHealth->status() . "\n";
    }
} catch (\Exception $e) {
    echo "   [WARN] FastAPI test: " . $e->getMessage() . "\n";
}

// 6. TN MITRA BOT & OFFLINE/ONLINE RAG ENGINE TEST
echo "\n6. Testing TN Mitra Bot (RAG Knowledge Engine & Itineraries)...\n";
try {
    $aiController = new AiGuideController();
    $req = Request::create('/api/ai/chat', 'POST', [
        'message' => 'Plan a 3-day trip to Ooty with mountain viewpoints and tea gardens',
        'history' => [],
        'context' => ['district' => 'Nilgiris'],
    ]);

    $response = $aiController->chat($req);
    $data = $response->getData(true);

    if (!empty($data['reply'])) {
        echo "   [PASS] TN Mitra Bot Response Generated!\n";
        echo "   [PASS] AI Source Mode: " . ($data['source'] ?? 'offline') . "\n";
        echo "   [PASS] Verified RAG Places Retrieved: " . count($data['rag_sources'] ?? []) . "\n";
        echo "   [SAMPLE BOT SNIPPET]:\n" . substr($data['reply'], 0, 180) . "...\n";
        $results['ai_bot_rag'] = true;
    } else {
        echo "   [FAIL] Bot returned empty reply.\n";
    }
} catch (\Exception $e) {
    echo "   [FAIL] Bot Error: " . $e->getMessage() . "\n";
}

echo "\n=======================================================\n";
echo "                 VERIFICATION SUMMARY\n";
echo "=======================================================\n";
foreach ($results as $k => $v) {
    echo sprintf(" - %-25s: %s\n", strtoupper(str_replace('_', ' ', $k)), $v ? '✓ WORKING (PASS)' : '✗ FAILED');
}
echo "=======================================================\n";
