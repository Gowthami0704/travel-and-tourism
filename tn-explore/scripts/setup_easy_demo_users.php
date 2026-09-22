<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Vendor;
use App\Models\District;
use App\Models\Place;
use App\Models\Listing;
use App\Models\Booking;
use App\Models\Review;
use App\Models\ReviewVote;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

echo "--- Seeding TN EXPLORE Complete Platform Data (Admin, Vendors, Bookings, Reviews, AI Sentiment, Audits) ---\n";

// 1. User / Tourist Demo Account
$tourist = User::updateOrCreate(
    ['email' => 'user@tnexplore.com'],
    [
        'name' => 'Kavitha Ramachandran',
        'password' => Hash::make('password'),
        'role' => 'tourist',
        'phone' => '+91 98401 56789',
        'is_banned' => false,
    ]
);

$tourist2 = User::updateOrCreate(
    ['email' => 'arunachalam@gmail.com'],
    [
        'name' => 'Arunachalam S',
        'password' => Hash::make('password'),
        'role' => 'tourist',
        'phone' => '+91 94440 99887',
        'is_banned' => false,
    ]
);

$tourist3 = User::updateOrCreate(
    ['email' => 'ananya.iyer@gmail.com'],
    [
        'name' => 'Ananya Iyer',
        'password' => Hash::make('password'),
        'role' => 'tourist',
        'phone' => '+91 98410 33221',
        'is_banned' => false,
    ]
);

// 2. Admin Accounts (Super Admin & Moderator)
$superAdmin = User::updateOrCreate(
    ['email' => 'admin@tnexplore.gov.in'],
    [
        'name' => 'Dr. C. Umashankar IAS',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'admin_role' => 'super_admin',
        'phone' => '+91 94440 12345',
        'is_banned' => false,
    ]
);

User::updateOrCreate(
    ['email' => 'admin@tnexplore.com'],
    [
        'name' => 'Dr. C. Umashankar IAS',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'admin_role' => 'super_admin',
        'phone' => '+91 94440 12345',
        'is_banned' => false,
    ]
);

$moderator = User::updateOrCreate(
    ['email' => 'moderator@tnexplore.gov.in'],
    [
        'name' => 'Priya Natarajan (Content Officer)',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'admin_role' => 'moderator',
        'phone' => '+91 98421 99000',
        'is_banned' => false,
    ]
);

// 3. Primary Vendor: Meenakshi Heritage Travels & Guides (Verified)
$vendorUser1 = User::updateOrCreate(
    ['email' => 'vendor@tnexplore.com'],
    [
        'name' => 'Sundaram Pandian',
        'password' => Hash::make('password'),
        'role' => 'vendor',
        'phone' => '+91 98421 11223',
        'is_banned' => false,
    ]
);

$madurai = District::where('name', 'Madurai')->first() ?? District::first();
if ($madurai && $vendorUser1) {
    $vendor1 = Vendor::updateOrCreate(
        ['user_id' => $vendorUser1->id],
        [
            'business_name' => 'Meenakshi Heritage Travels & Guides',
            'owner_name' => 'Sundaram Pandian',
            'slug' => 'meenakshi-heritage-travels',
            'service_type' => 'tour_package',
            'specialties' => ['bus', 'car', 'guide', 'package', 'hotel', 'restaurant'],
            'district_id' => $madurai->id,
            'description' => 'Government certified heritage tour operator in Madurai with a fleet of luxury AC buses, outstation SUVs, licensed historian guides, and culinary food trail walks across South Tamil Nadu.',
            'logo_url' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300',
            'status' => 'active',
            'kyc_status' => 'verified',
            'license_url' => 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
            'gst_number' => '33AADCM1234F1Z9',
            'pan_number' => 'AADCM1234F',
            'phone' => '+91 98421 11223',
            'trust_score' => 0.940,
        ]
    );

    // Listing 1: Bus Rental
    $l1 = Listing::updateOrCreate(
        ['vendor_id' => $vendor1->id, 'title' => '40-Seater AC Luxury Sleeper Coach (South Circuit)'],
        [
            'description' => 'Ultra-luxury Volvo Multi-Axle AC sleeper bus with pushback berths, air suspension, high-speed WiFi, LED entertainment and USB charging ports.',
            'type' => 'bus',
            'price' => 14000,
            'image_url' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
            'details' => [
                'bus_type' => 'Volvo Multi-Axle AC Sleeper',
                'total_seats' => 40,
                'price_per_km' => 48,
                'price_per_day' => 14000,
                'route_coverage' => 'Madurai ➔ Rameswaram ➔ Kanyakumari ➔ Thanjavur',
                'amenities' => ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Luggage Compartment'],
            ],
            'status' => 'published',
            'is_active' => true,
        ]
    );

    // Listing 2: Car Rental
    $l2 = Listing::updateOrCreate(
        ['vendor_id' => $vendor1->id, 'title' => 'Toyota Innova Crysta AC 7-Seater Outstation SUV'],
        [
            'description' => 'Premium air-conditioned 7-seater SUV with professional uniform chauffeur for temple tours, airport transfers, and hill station trips.',
            'type' => 'car',
            'price' => 2800,
            'image_url' => 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
            'details' => [
                'car_type' => 'SUV (Innova Crysta)',
                'car_seats' => 7,
                'car_price_per_km' => 19,
                'driver_included' => true,
                'ac_type' => 'Dual AC',
            ],
            'status' => 'published',
            'is_active' => true,
        ]
    );

    // Listing 3: Tour Guide
    $l3 = Listing::updateOrCreate(
        ['vendor_id' => $vendor1->id, 'title' => 'Senior Certified Historian Guide (Meenakshi & Palace)'],
        [
            'description' => 'Deep architectural walkthrough of Meenakshi Amman Temple 1000 Pillar Hall, Thirumalai Nayakkar Palace, and Keeladi Sangam Age museum.',
            'type' => 'guide',
            'price' => 1500,
            'image_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
            'details' => [
                'languages' => ['Tamil', 'English', 'Hindi', 'French'],
                'experience_years' => 12,
                'guide_specialties' => ['Temples', 'Heritage', 'Food Tours', 'Architecture'],
                'certifications' => 'TN Tourism Dept. Master Heritage Guide #MAD-042',
            ],
            'status' => 'published',
            'is_active' => true,
        ]
    );

    // Listing 4: Tour Package
    $l4 = Listing::updateOrCreate(
        ['vendor_id' => $vendor1->id, 'title' => 'Madurai Temple, Palace & Night Food Crawl (All-Inclusive)'],
        [
            'description' => 'Complete guided tour covering Meenakshi Temple, Thirumalai Nayakkar light show, famous Jigarthanda tasting, and night Kari Dosa food crawl.',
            'type' => 'package',
            'price' => 2499,
            'image_url' => 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600',
            'details' => [
                'duration_days' => 1,
                'places_included' => ['Meenakshi Amman Temple', 'Thirumalai Nayakkar Mahal', 'Teppakulam', 'Famous Jigarthanda Shop'],
                'hotel_included' => false,
                'food_included' => true,
                'transport_included' => true,
                'itinerary' => "08:00 AM: Temple VIP Darshan\n01:00 PM: Traditional Banana Leaf Lunch\n03:30 PM: Palace & Sound Show\n07:00 PM: Madurai Street Food Trail",
            ],
            'status' => 'published',
            'is_active' => true,
        ]
    );

    // Bookings for Vendor 1
    $b1 = Booking::updateOrCreate(
        ['listing_id' => $l4->id, 'tourist_id' => $tourist->id, 'start_date' => date('Y-m-d', strtotime('+2 days'))],
        [
            'vendor_id' => $vendor1->id,
            'customer_name' => 'Kavitha Ramachandran',
            'customer_phone' => '+91 98401 56789',
            'customer_email' => 'user@tnexplore.com',
            'end_date' => date('Y-m-d', strtotime('+2 days')),
            'travelers' => 4,
            'special_requests' => 'Please arrange an English speaking guide and pure vegetarian meals for family.',
            'total_amount' => 9996,
            'status' => 'pending',
            'payment_status' => 'paid',
        ]
    );

    $b2 = Booking::updateOrCreate(
        ['listing_id' => $l2->id, 'tourist_id' => $tourist2->id, 'start_date' => date('Y-m-d', strtotime('-5 days'))],
        [
            'vendor_id' => $vendor1->id,
            'customer_name' => 'Arunachalam S',
            'customer_phone' => '+91 94440 99887',
            'customer_email' => 'arunachalam@gmail.com',
            'end_date' => date('Y-m-d', strtotime('-4 days')),
            'travelers' => 5,
            'special_requests' => 'Pickup from Madurai Airport (IXM) at 9:00 AM.',
            'total_amount' => 5600,
            'status' => 'completed',
            'payment_status' => 'paid',
        ]
    );

    $b3 = Booking::updateOrCreate(
        ['listing_id' => $l1->id, 'tourist_id' => $tourist3->id, 'start_date' => date('Y-m-d', strtotime('+7 days'))],
        [
            'vendor_id' => $vendor1->id,
            'customer_name' => 'Ananya Iyer',
            'customer_phone' => '+91 98410 33221',
            'customer_email' => 'ananya.iyer@gmail.com',
            'end_date' => date('Y-m-d', strtotime('+9 days')),
            'travelers' => 38,
            'special_requests' => 'College heritage study tour. Required AC sleeper coach with mic sound system.',
            'total_amount' => 28000,
            'status' => 'accepted',
            'payment_status' => 'paid',
        ]
    );

    // Reviews for Vendor 1
    $r1 = Review::updateOrCreate(
        ['tourist_id' => $tourist2->id, 'vendor_id' => $vendor1->id],
        [
            'booking_id' => $b2->id,
            'rating' => 5,
            'title' => 'Exceptional chauffeur and spotless Innova SUV',
            'comment' => 'Sundaram Pandian and team arranged our Madurai airport transfer and temple circuit. Driver was punctual, courteous, and drove extremely safely through highway traffic. Top notch service!',
            'photos' => [
                'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
                'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600'
            ],
            'tags' => ['Punctual', 'Clean', 'Professional', 'Safe'],
            'sentiment' => 'positive',
            'sentiment_confidence' => 0.98,
            'sentiment_keywords' => ['exceptional', 'punctual', 'courteous', 'safely', 'top notch'],
            'is_approved' => true,
            'is_flagged' => false,
            'helpful_count' => 12,
            'unhelpful_count' => 0,
            'visit_date' => date('Y-m-d', strtotime('-5 days')),
        ]
    );

    $r2 = Review::updateOrCreate(
        ['tourist_id' => $tourist3->id, 'vendor_id' => $vendor1->id],
        [
            'booking_id' => $b3->id,
            'rating' => 5,
            'title' => 'Master Historian Guide brought Keeladi & Meenakshi to life',
            'comment' => 'Our guide explained the 2,500-year-old Keeladi excavation artifacts with so much passion. The 1000 Pillar Hall acoustics explanation was mindblowing. Highly recommended for families with kids!',
            'photos' => ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'],
            'tags' => ['Knowledgeable', 'Friendly', 'Family Friendly'],
            'sentiment' => 'positive',
            'sentiment_confidence' => 0.96,
            'sentiment_keywords' => ['passion', 'mindblowing', 'highly recommended', 'knowledgeable'],
            'is_approved' => true,
            'is_flagged' => false,
            'helpful_count' => 8,
            'unhelpful_count' => 1,
            'visit_date' => date('Y-m-d', strtotime('-12 days')),
        ]
    );

    // Vendor Reply
    Review::updateOrCreate(
        ['parent_id' => $r1->id],
        [
            'vendor_id' => $vendor1->id,
            'tourist_id' => $vendorUser1->id,
            'rating' => 5,
            'comment' => 'Thank you so much Arunachalam sir! It was an absolute pleasure hosting you and your family. Looking forward to serving you again on your next Rameswaram trip.',
            'is_approved' => true,
        ]
    );

    // A flagged review for moderation queue demo
    Review::updateOrCreate(
        ['comment' => 'Call me at 9999988888 for cheaper off-platform direct taxi bookings without paying platform taxes.'],
        [
            'tourist_id' => $tourist->id,
            'vendor_id' => $vendor1->id,
            'rating' => 1,
            'title' => 'Suspicious Contact Posting',
            'sentiment' => 'negative',
            'sentiment_confidence' => 0.89,
            'sentiment_keywords' => ['cheaper', 'direct taxi', 'off-platform'],
            'is_approved' => false,
            'is_flagged' => true,
            'moderation_reason' => 'Off-platform contact solicitation & suspected spam.',
            'helpful_count' => 0,
            'unhelpful_count' => 0,
            'visit_date' => date('Y-m-d'),
        ]
    );
}

// 4. Secondary Vendor: Nilgiris Mist Homestay (Pending KYC)
$vendorUser2 = User::updateOrCreate(
    ['email' => 'ooty.homestay@gmail.com'],
    [
        'name' => 'Ravi Varma',
        'password' => Hash::make('password'),
        'role' => 'vendor',
        'phone' => '+91 94861 88990',
        'is_banned' => false,
    ]
);

$nilgiris = District::where('name', 'Nilgiris')->first() ?? District::first();
if ($nilgiris && $vendorUser2) {
    Vendor::updateOrCreate(
        ['user_id' => $vendorUser2->id],
        [
            'business_name' => 'Nilgiri Mist Heritage Cottage & 4x4 Jeep Safaris',
            'owner_name' => 'Ravi Varma',
            'slug' => 'nilgiri-mist-heritage-cottage',
            'service_type' => 'hotel',
            'specialties' => ['hotel', 'car'],
            'district_id' => $nilgiris->id,
            'description' => 'Cozy wooden cottages surrounded by organic tea plantations in Kotagiri & Ooty with private campfires and forest view balcony.',
            'logo_url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
            'status' => 'pending',
            'kyc_status' => 'submitted',
            'license_url' => 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
            'gst_number' => '33BCDEV9876Q1Z2',
            'trust_score' => 0.720,
            'phone' => '+91 94861 88990',
        ]
    );
}

// 5. Sample Audit Log Entries
AuditLog::create([
    'admin_id' => $superAdmin->id,
    'admin_name' => $superAdmin->name,
    'action' => 'Vendor Approved',
    'target_type' => 'vendor',
    'target_id' => (string)($vendor1->id ?? 1),
    'reason' => 'Meenakshi Heritage Travels & Guides KYC documents and license verified.',
    'ip_address' => '127.0.0.1',
]);

AuditLog::create([
    'admin_id' => $moderator->id,
    'admin_name' => $moderator->name,
    'action' => 'Review Flagged',
    'target_type' => 'review',
    'target_id' => '3',
    'reason' => 'Off-platform contact solicitation & suspected spam.',
    'ip_address' => '127.0.0.1',
]);

echo "\n--- SEEDING COMPLETE ---\n";
echo "1. Super Admin: admin@tnexplore.gov.in / password -> /admin/dashboard\n";
echo "2. Moderator: moderator@tnexplore.gov.in / password -> /admin/kyc\n";
echo "3. Primary Vendor: vendor@tnexplore.com / password -> /vendor/dashboard\n";
echo "4. Tourist User: user@tnexplore.com / password\n";
