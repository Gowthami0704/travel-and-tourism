<?php

namespace Database\Seeders;

use App\Models\CustomTrip;
use App\Models\District;
use App\Models\TripChat;
use App\Models\TripMessage;
use App\Models\TripProposal;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class CustomTripSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $tourist = User::where('email', 'tourist@gmail.com')->first();
        $vendor1 = Vendor::where('business_name', 'like', '%Meenakshi%')->first();
        $vendor2 = Vendor::where('business_name', 'like', '%Nilgiri%')->first();

        if (!$tourist) return;

        // 1. Trip 1: 4-Day Kerala Monsoon Friends Trip (Verified, with 2 proposals)
        $trip1 = CustomTrip::firstOrCreate(
            ['title' => '4-Day Kerala Monsoon & Houseboat Escape'],
            [
                'user_id' => $tourist->id,
                'destination_region' => 'kerala',
                'destinations' => ['Munnar (Tea Estates & Waterfalls)', 'Alleppey (Backwaters & Houseboat)', 'Kochi / Fort Kochi'],
                'trip_type' => 'friends',
                'start_date' => now()->addDays(14)->toDateString(),
                'end_date' => now()->addDays(18)->toDateString(),
                'duration_days' => 4,
                'adults_count' => 4,
                'children_count' => 0,
                'budget_min' => 18000,
                'budget_max' => 36000,
                'accommodation_pref' => 'houseboat',
                'transport_pref' => 'suv',
                'food_pref' => 'flexible',
                'required_services' => ['cab_driver', 'hotel_stay', 'breakfast', 'houseboat_cruise', 'campfire_bbq'],
                'notes' => 'College friends reunion. Need 1 night on a private Alleppey houseboat and 2 nights in a misty Munnar tea estate.',
                'status' => 'verified_active',
                'admin_notes' => 'Verified by Admin team. Approved for Kerala licensed tour operators.',
                'verified_by' => $admin ? $admin->id : null,
                'verified_at' => now()->subHours(4),
            ]
        );

        if ($vendor1) {
            $prop1 = TripProposal::firstOrCreate(
                ['custom_trip_id' => $trip1->id, 'vendor_id' => $vendor1->id],
                [
                    'quote_price' => 28500,
                    'inclusions' => [
                        'Dedicated AC Innova Crysta (Kochi -> Munnar -> Alleppey -> Kochi)',
                        '2 Nights 4-Star Mountain View Resort in Munnar',
                        '1 Night Private Deluxe Houseboat in Alleppey with All Meals',
                        'Daily Buffet Breakfast in Munnar',
                        'Campfire & Evening BBQ session in Munnar',
                        'All Interstate Permits, Tolls & Driver Allowances'
                    ],
                    'exclusions' => [
                        'Lunch in Munnar',
                        'Kathakali / Martial Arts show tickets (optional @ ₹350/person)'
                    ],
                    'itinerary_summary' => "Day 1: Kochi Airport Pickup -> Cheeyappara Waterfalls -> Munnar Check-in.\nDay 2: Eravikulam National Park, Mattupetty Dam, Tea Museum & Night Campfire.\nDay 3: Scenic Drive to Alleppey -> 12 PM Houseboat Check-in with Kerala Lunch -> Sunset Cruise.\nDay 4: Morning backwater sunrise, Fort Kochi spice market & Departure.",
                    'vendor_message' => 'We are highly rated South India operators with 10+ years experience in Kerala circuits. Sanitized cabs and 24/7 dedicated support.',
                    'valid_until' => now()->addDays(7),
                    'status' => 'submitted',
                ]
            );

            // Create initial chat & messages
            $chat1 = TripChat::firstOrCreate(
                [
                    'custom_trip_id' => $trip1->id,
                    'proposal_id' => $prop1->id,
                    'tourist_id' => $tourist->id,
                    'vendor_id' => $vendor1->id,
                ],
                [
                    'last_message_at' => now(),
                ]
            );

            TripMessage::firstOrCreate(
                [
                    'chat_id' => $chat1->id,
                    'sender_id' => $vendor1->user_id,
                    'message' => 'Hello Kavitha! We have submitted our all-inclusive proposal for your Kerala trip. The AC Innova and private Alleppey houseboat are reserved for your dates.',
                ],
                [
                    'sender_role' => 'vendor',
                    'is_read' => true,
                ]
            );

            TripMessage::firstOrCreate(
                [
                    'chat_id' => $chat1->id,
                    'sender_id' => $tourist->id,
                    'message' => 'Hi Sundaram sir! Thanks for the quick quote. Can we add an extra tea factory tasting session on Day 2 morning?',
                ],
                [
                    'sender_role' => 'tourist',
                    'is_read' => true,
                ]
            );

            TripMessage::firstOrCreate(
                [
                    'chat_id' => $chat1->id,
                    'sender_id' => $vendor1->user_id,
                    'message' => 'Official Revised Quotation: ₹29,000 — Added complimentary organic tea tasting session at Lockhart Estate!',
                ],
                [
                    'sender_role' => 'vendor',
                    'custom_quote_payload' => [
                        'price' => 29000,
                        'inclusions' => $prop1->inclusions,
                        'note' => 'Added Lockhart Organic Tea Factory Tour & Tasting!',
                    ],
                    'is_read' => false,
                ]
            );
        }

        // 2. Trip 2: Ooty & Kodaikanal Family Retreat (Pending Admin Verification)
        CustomTrip::firstOrCreate(
            ['title' => 'Nilgiris & Kodaikanal Family Summer Retreat'],
            [
                'user_id' => $tourist->id,
                'destination_region' => 'inside_tn',
                'destinations' => ['Ooty & Nilgiris (Hill Station & Tea)', 'Kodaikanal (Princess of Hills)'],
                'trip_type' => 'family',
                'start_date' => now()->addDays(30)->toDateString(),
                'end_date' => now()->addDays(34)->toDateString(),
                'duration_days' => 5,
                'adults_count' => 3,
                'children_count' => 1,
                'budget_min' => 20000,
                'budget_max' => 45000,
                'accommodation_pref' => '4_5star_resort',
                'transport_pref' => 'suv',
                'food_pref' => 'veg_only',
                'required_services' => ['cab_driver', 'hotel_stay', 'breakfast', 'dinner', 'licensed_guide'],
                'notes' => 'Traveling with senior citizens and 1 child. Require ground floor rooms with heaters and pure vegetarian meals.',
                'status' => 'pending_verification',
            ]
        );

        // 3. Trip 3: Strangers Backpacking Pool (Verified Active)
        CustomTrip::firstOrCreate(
            ['title' => 'Wayanad & Coorg Strangers Backpacker Trek Pool'],
            [
                'user_id' => $tourist->id,
                'destination_region' => 'outside_tn',
                'destinations' => ['Wayanad (Caves & Rainforest)', 'Coorg / Chikmagalur (Karnataka Coffee Hills)'],
                'trip_type' => 'strangers_pool',
                'start_date' => now()->addDays(20)->toDateString(),
                'end_date' => now()->addDays(23)->toDateString(),
                'duration_days' => 3,
                'adults_count' => 6,
                'children_count' => 0,
                'budget_min' => 12000,
                'budget_max' => 25000,
                'accommodation_pref' => 'camping',
                'transport_pref' => 'tempo_traveller',
                'food_pref' => 'flexible',
                'required_services' => ['cab_driver', 'licensed_guide', 'campfire_bbq', 'jeep_safari'],
                'notes' => 'Group of 6 solo backpackers pooling costs. Need AC Tempo Traveller from Bangalore/Coimbatore with forest camping.',
                'status' => 'verified_active',
                'admin_notes' => 'KYC ID verification verified for pooling safety.',
                'verified_by' => $admin ? $admin->id : null,
                'verified_at' => now()->subHours(1),
            ]
        );
    }
}
