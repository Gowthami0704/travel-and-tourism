<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\Listing;
use App\Models\Review;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin Account
        $admin = User::firstOrCreate(
            ['email' => 'admin@tnexplore.gov.in'],
            [
                'name' => 'TN Tourism Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '+91 94440 12345',
            ]
        );

        // 2. Tourist Demo Account
        $tourist = User::firstOrCreate(
            ['email' => 'tourist@gmail.com'],
            [
                'name' => 'Kavitha Ramachandran',
                'password' => Hash::make('tourist123'),
                'role' => 'tourist',
                'phone' => '+91 98401 56789',
            ]
        );

        // 3. Vendor 1: Madurai Heritage Travels (Active, High Trust)
        $vendorUser1 = User::firstOrCreate(
            ['email' => 'madurai.tours@gmail.com'],
            [
                'name' => 'Sundaram Pandian',
                'password' => Hash::make('vendor123'),
                'role' => 'vendor',
                'phone' => '+91 98421 11223',
            ]
        );

        $madurai = District::where('name', 'Madurai')->first();
        if ($madurai) {
            $vendor1 = Vendor::updateOrCreate(
                ['user_id' => $vendorUser1->id],
                [
                    'business_name' => 'Meenakshi Heritage Travels & Guides',
                    'service_type' => 'tour_package',
                    'district_id' => $madurai->id,
                    'description' => 'Licensed tourist guides and cultural walking heritage tours of Madurai temples, palace, and night street food crawls.',
                    'logo_url' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300',
                    'status' => 'active',
                    'trust_score' => 0.940,
                ]
            );

            Listing::updateOrCreate(
                ['vendor_id' => $vendor1->id, 'title' => 'Madurai Temple & Food Crawl (Full Day)'],
                [
                    'description' => 'Comprehensive guided exploration of Meenakshi Amman Temple, Thirumalai Nayakkar Palace, and evening food tour covering famous Jigarthanda & Kari Dosa.',
                    'type' => 'package',
                    'price' => 1499,
                    'image_url' => 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600',
                    'details' => [
                        'duration' => '8 Hours',
                        'includes' => ['Guide fees', 'Jigarthanda tasting', 'Temple shoe-care tokens', 'AC Cab between spots'],
                        'group_size' => 'Up to 6 guests',
                    ],
                    'is_active' => true,
                ]
            );

            Listing::updateOrCreate(
                ['vendor_id' => $vendor1->id, 'title' => 'Chithirai Festival VIP Walk & Heritage Tour'],
                [
                    'description' => 'Specialized guided tour covering ancient Chithirai festival history, Teppakulam lake, and hidden Jain cave trails.',
                    'type' => 'package',
                    'price' => 999,
                    'image_url' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
                    'details' => [
                        'duration' => '4 Hours',
                        'includes' => ['Local historian guide', 'Traditional morning breakfast', 'Audio headsets'],
                    ],
                    'is_active' => true,
                ]
            );
        }

        // 4. Vendor 2: Nilgiris Tea Mist Homestay & Cabs (Active)
        $vendorUser2 = User::firstOrCreate(
            ['email' => 'ooty.homestay@gmail.com'],
            [
                'name' => 'Ravi Varma',
                'password' => Hash::make('vendor123'),
                'role' => 'vendor',
                'phone' => '+91 94861 88990',
            ]
        );

        $nilgiris = District::where('name', 'Nilgiris')->first();
        if ($nilgiris) {
            $vendor2 = Vendor::updateOrCreate(
                ['user_id' => $vendorUser2->id],
                [
                    'business_name' => 'Nilgiri Mist Heritage Cottage & 4x4 Jeep Safaris',
                    'service_type' => 'hotel',
                    'district_id' => $nilgiris->id,
                    'description' => 'Cozy wooden cottages surrounded by organic tea plantations in Kotagiri & Ooty with private campfires and forest view balcony.',
                    'logo_url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
                    'status' => 'active',
                    'trust_score' => 0.910,
                ]
            );

            Listing::updateOrCreate(
                ['vendor_id' => $vendor2->id, 'title' => 'Deluxe Tea Estate Valley View Suite'],
                [
                    'description' => 'Spacious wooden suite with panoramic tea garden views, fireplace, complimentary organic Nilgiri tea, and homemade breakfast.',
                    'type' => 'hotel_room',
                    'price' => 3200,
                    'image_url' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
                    'details' => [
                        'beds' => '1 King Bed',
                        'occupancy' => '2 Adults + 1 Child',
                        'amenities' => ['Balcony', 'Breakfast included', 'Campfire', 'Free High Speed Wi-Fi'],
                    ],
                    'is_active' => true,
                ]
            );

            Listing::updateOrCreate(
                ['vendor_id' => $vendor2->id, 'title' => 'Avalanche Lake & Forest 4x4 Jeep Safari'],
                [
                    'description' => 'Rugged off-road journey deep into Nilgiri biosphere reserve, trout hatchery, and hidden waterfalls.',
                    'type' => 'vehicle',
                    'price' => 2400,
                    'image_url' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
                    'details' => [
                        'vehicle' => 'Mahindra Thar 4x4 (AC)',
                        'capacity' => '6 passengers',
                        'duration' => '5 Hours',
                    ],
                    'is_active' => true,
                ]
            );
        }

        // 5. Vendor 3: Pending Approval Vendor
        $vendorUser3 = User::firstOrCreate(
            ['email' => 'tanjore.crafts@gmail.com'],
            [
                'name' => 'Ganesan Sthapathi',
                'password' => Hash::make('vendor123'),
                'role' => 'vendor',
                'phone' => '+91 97890 33445',
            ]
        );

        $thanjavur = District::where('name', 'Thanjavur')->first();
        if ($thanjavur) {
            Vendor::updateOrCreate(
                ['user_id' => $vendorUser3->id],
                [
                    'business_name' => 'Thanjavur Bronze & Art Gallery Homestay',
                    'service_type' => 'tour_package',
                    'district_id' => $thanjavur->id,
                    'description' => 'Traditional artisan studio visits, Thanjavur doll craft experiences, and guided Big Temple Chola architectural tours.',
                    'logo_url' => null,
                    'status' => 'pending',
                    'trust_score' => 0.750,
                ]
            );
        }

        // 6. Vendor 4: Flagged / Suspicious Vendor (for Demo testing)
        $vendorUser4 = User::firstOrCreate(
            ['email' => 'cheap.tours@suspicious.com'],
            [
                'name' => 'Fast Track Quick Tours',
                'password' => Hash::make('vendor123'),
                'role' => 'vendor',
                'phone' => '+91 99999 00000',
            ]
        );

        $chennai = District::where('name', 'Chennai')->first();
        if ($chennai) {
            $vendor4 = Vendor::updateOrCreate(
                ['user_id' => $vendorUser4->id],
                [
                    'business_name' => 'Super Saver Chennai Quick Trips',
                    'service_type' => 'rental_vehicle',
                    'district_id' => $chennai->id,
                    'description' => 'Unverified budget cab provider offering unusually low tariff rates.',
                    'logo_url' => null,
                    'status' => 'active',
                    'trust_score' => 0.280,
                ]
            );

            Listing::updateOrCreate(
                ['vendor_id' => $vendor4->id, 'title' => 'Ultra Cheap Chennai-Mahabalipuram Sedan'],
                [
                    'description' => 'Cab service at 90% below market average.',
                    'type' => 'vehicle',
                    'price' => 199,
                    'image_url' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
                    'details' => ['warning' => 'Abnormal price deviation detected by AI system'],
                    'is_active' => true,
                ]
            );
        }

        // Add some sample reviews
        if (isset($vendor1) && $tourist) {
            Review::updateOrCreate(
                ['tourist_id' => $tourist->id, 'vendor_id' => $vendor1->id],
                [
                    'rating' => 5,
                    'comment' => 'Outstanding guide! The Madurai food crawl and temple architecture explanation were the highlights of our trip. Highly recommend Sundaram sir!',
                ]
            );
        }
    }
}
