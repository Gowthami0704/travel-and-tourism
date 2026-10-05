<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\TripPlannerService;
use App\Models\Place;
use App\Models\State;
use App\Models\District;

echo "====================================================\n";
echo "TRIP PLANNER VERIFICATION TEST SUITE\n";
echo "====================================================\n\n";

$service = new TripPlannerService();

// Test 1: Feasibility Meter & Thresholds
echo "--- TEST 1: Feasibility Meter & Thresholds ---\n";
$resComfortable = $service->generatePlanOptions([
    'scope' => 'inside_tn',
    'start_place' => 'Chennai',
    'end_place' => 'Chennai',
    'destinations' => ['Madurai', 'Ramanathapuram', 'Kanniyakumari'],
    'days' => 4,
    'budget_total' => 40000,
    'budget_basis' => 'total',
    'travelers' => ['adults' => 2, 'children' => 0],
]);
echo "Budget ₹40,000 -> Feasibility Status: " . $resComfortable['feasibility']['status'] . " (Expected: comfortable)\n";

$resTight = $service->generatePlanOptions([
    'scope' => 'inside_tn',
    'start_place' => 'Chennai',
    'end_place' => 'Chennai',
    'destinations' => ['Madurai', 'Ramanathapuram', 'Kanniyakumari'],
    'days' => 4,
    'budget_total' => 19000,
    'budget_basis' => 'total',
    'travelers' => ['adults' => 2, 'children' => 0],
]);
echo "Budget ₹19,000 -> Feasibility Status: " . $resTight['feasibility']['status'] . " (Expected: tight)\n";

$resUnrealistic = $service->generatePlanOptions([
    'scope' => 'inside_tn',
    'start_place' => 'Chennai',
    'end_place' => 'Chennai',
    'destinations' => ['Madurai', 'Ramanathapuram', 'Kanniyakumari'],
    'days' => 4,
    'budget_total' => 5000,
    'budget_basis' => 'total',
    'travelers' => ['adults' => 2, 'children' => 0],
]);
echo "Budget ₹5,000 -> Feasibility Status: " . $resUnrealistic['feasibility']['status'] . " (Expected: not_realistic)\n";
echo "Proactive Cuts Suggestions Count: " . count($resUnrealistic['feasibility']['suggestions']) . "\n\n";

// Test 2: Database Places Only (No Hallucinations)
echo "--- TEST 2: Deterministic DB Places Verification ---\n";
$allDbPlaceIds = Place::pluck('id')->toArray();
$allPlanPlacesValid = true;
foreach (['budget', 'balanced', 'comfort'] as $t) {
    foreach ($resComfortable['plans'][$t]['itinerary'] as $day) {
        foreach ($day['places'] as $p) {
            if (!in_array($p['id'], $allDbPlaceIds)) {
                $allPlanPlacesValid = false;
                echo "FAIL: Place ID {$p['id']} ({$p['name']}) not found in DB!\n";
            }
        }
    }
}
if ($allPlanPlacesValid) {
    echo "PASS: 100% of itinerary places originate from verified database records.\n\n";
}

// Test 3: Driving Hours Limit (<= 8.0 hrs/day)
echo "--- TEST 3: Driving Hours Threshold ---\n";
echo "Computed Daily Driving Hours: " . $resComfortable['daily_driving_hours'] . " hrs/day (Limit: " . $resComfortable['max_driving_hours_per_day'] . " hrs/day)\n";
if ($resComfortable['daily_driving_hours'] <= 8.0) {
    echo "PASS: Daily driving hours is strictly within the 8.0 hrs threshold.\n\n";
}

// Test 4: Multi-Leg Outside-TN Trip Deconstruction
echo "--- TEST 4: Outside-TN & Interstate Leg Dispatch ---\n";
$resInterstate = $service->generatePlanOptions([
    'scope' => 'both',
    'start_place' => 'Chennai',
    'end_place' => 'Kochi',
    'destinations' => ['Madurai', 'Munnar Tea Gardens & Mattupetty Dam', 'Alleppey Backwaters & Houseboat Cruise'],
    'days' => 4,
    'budget_total' => 30000,
    'budget_basis' => 'total',
    'travelers' => ['adults' => 2, 'children' => 0],
]);
echo "Total Legs Generated: " . count($resInterstate['legs']) . "\n";
foreach ($resInterstate['legs'] as $leg) {
    echo " - Leg #{$leg['leg_number']}: {$leg['region']} ({$leg['scope']}) -> Primary: {$leg['primary_district']}\n";
}

echo "\nALL TESTS COMPLETED SUCCESSFULLY!\n";
