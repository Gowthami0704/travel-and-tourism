<?php
/**
 * Script: seed_realistic_fraud_demo_scenarios.php
 * Creates realistic anomalous vendor test cases for live Isolation Forest demo in Review 1.
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Vendor;
use App\Models\FraudFlag;
use App\Models\Booking;
use App\Models\Listing;
use App\Models\Review;
use App\Models\User;

echo "=================================================================\n";
echo "SEEDING REALISTIC ANOMALY DEMO SCENARIOS FOR ISOLATION FOREST\n";
echo "=================================================================\n\n";

// 1. High-Risk Anomaly: "Apex Royal Horizon Tours" (Simulated Sybil & Overcharging Operator)
$user1 = User::firstOrCreate(
    ['email' => 'apex.anomaly@tnexplore.local'],
    ['name' => 'Apex Tours Admin', 'password' => bcrypt('password123'), 'role' => 'vendor', 'phone' => '9840112233']
);

$vendorHigh = Vendor::updateOrCreate(
    ['user_id' => $user1->id],
    [
        'business_name' => 'Apex Royal Horizon Cabs & Safaris',
        'owner_name' => 'K. Rajan',
        'slug' => 'apex-royal-horizon-cabs-safaris',
        'service_type' => 'rental_vehicle',
        'district_id' => 18, // Nilgiris
        'phone' => '9840112233',
        'status' => 'suspended',
        'kyc_status' => 'rejected',
        'kyc_rejected_reason' => 'Duplicate permit registered under different GST',
        'trust_score' => 0.25,
        'fraud_risk_score' => 85,
        'fraud_risk_reason' => '3 open tourist complaints (+30 pts); 5 cancelled bookings (+25 pts); 60% negative reviews (+30 pts)',
    ]
);

// Add listing for vendorHigh
$listingHigh = Listing::firstOrCreate(
    ['vendor_id' => $vendorHigh->id, 'title' => 'Ooty 4x4 Avalanche Safari & Camping'],
    [
        'district_id' => 18,
        'type' => 'rental_vehicle',
        'price' => 7500.0, // Significant price surge
        'is_active' => true,
        'description' => 'Luxury offroad safari to Avalanche Lake and Upper Bhavani.'
    ]
);

// Add customer complaints / FraudFlags
FraudFlag::updateOrCreate(
    ['vendor_id' => $vendorHigh->id, 'reason' => 'Tourist reported 80% price surge and unauthorized extra charges at pickup point.'],
    ['severity' => 'high', 'status' => 'open', 'flagged_at' => now()->subDays(2)]
);
FraudFlag::updateOrCreate(
    ['vendor_id' => $vendorHigh->id, 'reason' => 'Driver failed to show up for confirmed Avalanche safari; refused instant refund.'],
    ['severity' => 'high', 'status' => 'open', 'flagged_at' => now()->subDays(1)]
);
FraudFlag::updateOrCreate(
    ['vendor_id' => $vendorHigh->id, 'reason' => 'Misleading vehicle specification (standard sedan provided instead of promised 4x4).'],
    ['severity' => 'high', 'status' => 'open', 'flagged_at' => now()->subHours(6)]
);

// Add cancelled bookings
$touristUser = User::where('role', 'tourist')->first() ?: User::first();
for ($i = 1; $i <= 5; $i++) {
    Booking::create([
        'tourist_id' => $touristUser->id,
        'listing_id' => $listingHigh->id,
        'start_date' => now()->subDays($i + 1)->format('Y-m-d'),
        'end_date' => now()->subDays($i)->format('Y-m-d'),
        'guests' => 2,
        'status' => 'rejected',
        'total_amount' => 7500.0,
        'total_price' => 7500.0,
        'special_requests' => 'Urgent refund requested due to cancellation',
    ]);
}

// Add negative reviews
Review::create([
    'vendor_id' => $vendorHigh->id,
    'tourist_id' => $touristUser->id,
    'rating' => 1,
    'comment' => 'Terrible experience! Charged ₹7500 upfront and the driver cancelled 10 minutes before the Ooty trip.',
    'status' => 'published',
]);
Review::create([
    'vendor_id' => $vendorHigh->id,
    'tourist_id' => $touristUser->id,
    'rating' => 2,
    'comment' => 'Vehicle was not well-maintained and customer service was unresponsive.',
    'status' => 'published',
]);

echo "✓ Created High-Risk Anomaly Entity: {$vendorHigh->business_name} (Risk Score: 85/100)\n";

// 2. Moderate-Risk Watchlist Entity: "Kaveri Express Travel Link"
$user2 = User::firstOrCreate(
    ['email' => 'kaveri.watch@tnexplore.local'],
    ['name' => 'Kaveri Link', 'password' => bcrypt('password123'), 'role' => 'vendor', 'phone' => '9443219876']
);

$vendorMod = Vendor::updateOrCreate(
    ['user_id' => $user2->id],
    [
        'business_name' => 'Kaveri Express Travel Link',
        'owner_name' => 'S. Mani',
        'slug' => 'kaveri-express-travel-link',
        'service_type' => 'tour_package',
        'district_id' => 31, // Tiruchirappalli
        'phone' => '9443219876',
        'status' => 'pending',
        'kyc_status' => 'pending',
        'trust_score' => 0.60,
        'fraud_risk_score' => 40,
        'fraud_risk_reason' => 'Unverified KYC documentation (+20 pts); New partner account (< 7 days) (+10 pts); 1 open complaint (+10 pts)',
    ]
);

FraudFlag::updateOrCreate(
    ['vendor_id' => $vendorMod->id, 'reason' => 'Price quote 45% above regional Trichy temple circuit baseline.'],
    ['severity' => 'medium', 'status' => 'open', 'flagged_at' => now()->subHours(12)]
);

echo "✓ Created Moderate-Risk Watchlist Entity: {$vendorMod->business_name} (Risk Score: 40/100)\n\n";

echo "Demo scenarios seeded successfully! Open http://127.0.0.1:8000/admin/fraud to view live dashboard.\n";
