<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\District;
use App\Models\Vendor;
use App\Models\Listing;
use App\Models\VendorDistrict;
use Illuminate\Support\Facades\DB;

echo "Seeding States and Two-Tier Package System...\n";

// 1. Seed States
$statesData = [
    ['name' => 'Tamil Nadu', 'code' => 'TN', 'is_active' => true],
    ['name' => 'Kerala', 'code' => 'KL', 'is_active' => true],
    ['name' => 'Karnataka', 'code' => 'KA', 'is_active' => true],
    ['name' => 'Puducherry', 'code' => 'PY', 'is_active' => true],
    ['name' => 'Andhra Pradesh', 'code' => 'AP', 'is_active' => true],
    ['name' => 'Telangana', 'code' => 'TS', 'is_active' => true],
];

foreach ($statesData as $s) {
    DB::table('states')->updateOrInsert(['code' => $s['code']], $s);
}

$tnState = DB::table('states')->where('code', 'TN')->first();

if ($tnState) {
    District::whereNull('state_id')->update(['state_id' => $tnState->id]);
}

// 2. Ensure Vendors have state_id and primary/extended levels set
$vendors = Vendor::all();
foreach ($vendors as $v) {
    $v->state_id = $tnState->id ?? null;
    $v->state_name = 'Tamil Nadu';
    $v->safety_approved = true;
    $v->license_expiry_date = now()->addMonths(18)->toDateString();
    $v->save();

    // Ensure first 1-2 districts are primary and approved
    $districts = $v->vendorDistricts()->get();
    if ($districts->isEmpty() && $v->district_id) {
        VendorDistrict::updateOrCreate(
            ['vendor_id' => $v->id, 'district_id' => $v->district_id],
            ['level' => 'primary', 'status' => 'approved', 'reviewed_at' => now()]
        );
    } else {
        $count = 0;
        foreach ($districts as $vd) {
            $count++;
            $level = $count <= 2 ? 'primary' : 'extended';
            $vd->level = $level;
            $vd->status = 'approved';
            $vd->save();
        }
    }
}

// 3. Seed GT Holidays-Style Rich Structured Packages
$maduraiDistrict = District::where('name', 'like', '%Madurai%')->first();
$nilgirisDistrict = District::where('name', 'like', '%Nilgiris%')->first();
$chennaiDistrict = District::where('name', 'like', '%Chennai%')->first();
$kanyakumariDistrict = District::where('name', 'like', '%Kanyakumari%')->first();

$sampleVendor = Vendor::where('status', 'active')->first();

if ($sampleVendor && $maduraiDistrict) {
    // 1. Heritage Package
    $heritagePkg = Listing::updateOrCreate(
        ['vendor_id' => $sampleVendor->id, 'title' => 'Madurai & Rameswaram Temple Heritage Circuit'],
        [
            'type' => 'package',
            'category' => 'Heritage and Temples',
            'scope' => 'inside_tn',
            'start_district_id' => $maduraiDistrict->id,
            'start_city' => 'Madurai',
            'start_state' => 'Tamil Nadu',
            'destinations' => ['Madurai', 'Rameswaram', 'Dhanushkodi'],
            'duration_days' => 4,
            'duration_nights' => 3,
            'group_size' => 20,
            'price' => 14500,
            'price_per_person' => 14500,
            'child_with_bed_price' => 9500,
            'child_without_bed_price' => 6000,
            'accommodation' => '3-Star Heritage & Sea View Hotels',
            'transport' => 'AC Tempo Traveller / Premium Coach',
            'day_wise_itinerary' => [
                ['day' => 1, 'title' => 'Arrival in Madurai & Meenakshi Darshan', 'description' => 'Pickup from Madurai Junction/Airport. Check-in to hotel. Evening temple darshan, Pudhu Mandapam visit, and local street food tasting.', 'meals' => 'Dinner'],
                ['day' => 2, 'title' => 'Thirumalai Nayakkar Palace & Journey to Rameswaram', 'description' => 'Morning palace tour and Gandhi Museum. Scenic drive across Pamban Sea Bridge to Rameswaram.', 'meals' => 'Breakfast & Dinner'],
                ['day' => 3, 'title' => 'Ramanathaswamy Temple Theertham & Dhanushkodi Ghost Town', 'description' => '22 sacred well baths and darshan. Afternoon 4x4 coastal safari to Dhanushkodi beach and Ram Setu point.', 'meals' => 'Breakfast & Dinner'],
                ['day' => 4, 'title' => 'Kalam Memorial & Departure', 'description' => 'Visit Dr. APJ Abdul Kalam National Memorial. Return transfer to Madurai.', 'meals' => 'Breakfast'],
            ],
            'inclusions' => [
                '3 Nights accommodation on twin sharing basis',
                'Daily buffet breakfast and dinners',
                'AC vehicle transfers throughout the tour',
                'Certified temple heritage guide assistance',
                'All toll, parking, driver allowance, and state road taxes'
            ],
            'exclusions' => [
                'Airfare or train tickets',
                'Personal expenses and room service',
                'Camera entry tickets and special pooja charges',
                'GST (5%)'
            ],
            'need_to_know' => [
                'Dress code required at Meenakshi and Ramanathaswamy temples (dhotis/sarees/salwars).',
                'Valid government ID proof required at hotel check-in.',
                'Float festival and festival dates may have temple queue delays.'
            ],
            'payment_terms' => [
                'deposit_percent' => 25,
                'balance_due_days_before' => 7,
            ],
            'cancellation_slabs' => [
                ['days_before' => 30, 'charge_percent' => 10],
                ['days_before' => 15, 'charge_percent' => 25],
                ['days_before' => 7, 'charge_percent' => 50],
                ['days_before' => 3, 'charge_percent' => 100],
            ],
            'difficulty' => 'easy',
            'weather_season_note' => 'Best enjoyed from October to March with pleasant coastal breezes.',
            'is_adventure' => false,
            'is_group_departure' => true,
            'approval_status' => 'approved',
            'emergency_contact' => '+91 94431 88220 (24x7 Help Desk)',
        ]
    );

    // Add group departures
    DB::table('package_departures')->updateOrInsert(
        ['listing_id' => $heritagePkg->id, 'departure_date' => now()->addDays(5)->toDateString()],
        ['total_seats' => 25, 'seats_left' => 8, 'status' => 'open']
    );
    DB::table('package_departures')->updateOrInsert(
        ['listing_id' => $heritagePkg->id, 'departure_date' => now()->addDays(12)->toDateString()],
        ['total_seats' => 25, 'seats_left' => 19, 'status' => 'open']
    );

    // 2. Adventure & Trekking Package
    if ($nilgirisDistrict) {
        $adventurePkg = Listing::updateOrCreate(
            ['vendor_id' => $sampleVendor->id, 'title' => 'Nilgiris Cloud Forest Trek & Camping Expedition'],
            [
                'type' => 'package',
                'category' => 'Adventure',
                'scope' => 'inside_tn',
                'start_district_id' => $nilgirisDistrict->id,
                'start_city' => 'Ooty',
                'start_state' => 'Tamil Nadu',
                'destinations' => ['Ooty', 'Pykara', 'Avalanche', 'Mukurthi'],
                'duration_days' => 3,
                'duration_nights' => 2,
                'group_size' => 12,
                'price' => 9800,
                'price_per_person' => 9800,
                'child_with_bed_price' => 7500,
                'child_without_bed_price' => 5000,
                'accommodation' => 'Eco-Tents & Pine Forest Camp',
                'transport' => '4x4 Mountain Jeep Safari',
                'day_wise_itinerary' => [
                    ['day' => 1, 'title' => 'Avalanche Lake Base Camp & Twilight Walk', 'description' => 'Arrive in Ooty. Jeep transfer to Avalanche valley. Pitch dome tents, campfire, and stargazing.', 'meals' => 'Lunch & Dinner'],
                    ['day' => 2, 'title' => 'Shola Grassland Ridge Trek & Waterfall Rappelling', 'description' => 'Guided 12 km ridge trek through native Shola forests with licensed wilderness leader. Technical waterfall descent.', 'meals' => 'All Meals'],
                    ['day' => 3, 'title' => 'Pykara River Coracle & Return Transfer', 'description' => 'Morning birdwatching, coracle boat experience, and transfer back to Ooty.', 'meals' => 'Breakfast'],
                ],
                'inclusions' => [
                    '2 Nights all-weather alpine camping with sleeping bags',
                    'All forest entry permits and environmental fees',
                    'Certified IMF wilderness trek leader & first responder',
                    'Safety harness and certified climbing equipment',
                    'Nutritious trail meals and energy rations'
                ],
                'exclusions' => [
                    'Trekking shoes and personal gear',
                    'Personal medical evacuation insurance',
                    'Tips to porters and guides'
                ],
                'need_to_know' => [
                    'Requires basic fitness and ability to walk 8-12 km per day.',
                    'Zero-plastic and Leave-No-Trace environmental protocol strictly enforced.',
                    'Mandatory age 14+ and signed health declaration at time of booking.'
                ],
                'payment_terms' => [
                    'deposit_percent' => 50,
                    'balance_due_days_before' => 5,
                ],
                'cancellation_slabs' => [
                    ['days_before' => 15, 'charge_percent' => 20],
                    ['days_before' => 7, 'charge_percent' => 50],
                    ['days_before' => 2, 'charge_percent' => 100],
                ],
                'difficulty' => 'moderate',
                'weather_season_note' => 'Cool temperatures (8°C to 18°C). Monsoons require waterproof rain shell.',
                'is_adventure' => true,
                'is_group_departure' => true,
                'approval_status' => 'approved',
                'emergency_contact' => '+91 94433 11223 (Nilgiris Mountain Rescue & SOS)',
            ]
        );

        DB::table('package_departures')->updateOrInsert(
            ['listing_id' => $adventurePkg->id, 'departure_date' => now()->addDays(7)->toDateString()],
            ['total_seats' => 12, 'seats_left' => 4, 'status' => 'open']
        );
    }
}

echo "Successfully seeded states, two-tier vendor districts, and GT-Holidays style package marketplace!\n";
