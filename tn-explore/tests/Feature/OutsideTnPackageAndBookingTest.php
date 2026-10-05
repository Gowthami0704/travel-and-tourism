<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\District;
use App\Models\DistrictChangeRequest;
use App\Models\Listing;
use App\Models\Review;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorAvailability;
use App\Models\VendorDistrict;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OutsideTnPackageAndBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_outside_tn_package_requires_admin_approval_before_being_publicly_visible(): void
    {
        $district = District::firstOrCreate(['name' => 'Chennai'], ['region' => 'North', 'description' => 'Capital']);
        $vendorUser = User::factory()->create(['role' => 'vendor']);
        
        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'South India Expeditions',
            'owner_name' => 'Murugan',
            'slug' => 'south-india-expeditions',
            'service_type' => 'tour_package',
            'services' => ['package', 'car'],
            'district_id' => $district->id,
            'approved_district_ids' => [$district->id],
            'status' => 'active',
            'kyc_status' => 'verified',
            'phone' => '9840123456',
        ]);

        // Create Outside-TN package tour
        $listing = Listing::create([
            'vendor_id' => $vendor->id,
            'district_id' => $district->id,
            'title' => 'Chennai to Munnar & Wayanad Grand Tour',
            'description' => '5-day cross-state luxury tour across Kerala and Tamil Nadu.',
            'type' => 'package',
            'scope' => 'outside_tn',
            'destination_states' => ['Kerala', 'Karnataka'],
            'price' => 25000,
            'days' => 5,
            'approval_status' => 'pending_approval',
            'is_active' => true,
            'status' => 'published',
        ]);

        // Pending approval listing should not appear in published scope
        $this->assertFalse(Listing::published()->where('id', $listing->id)->exists());

        // Admin approves the package
        $admin = User::factory()->create(['role' => 'admin', 'admin_role' => 'super_admin']);
        $response = $this->actingAs($admin)->post(route('admin.packages.approve', $listing->id));
        $response->assertSessionHas('success');

        $listing->refresh();
        $this->assertEquals('approved', $listing->approval_status);

        // Now it appears in published scope
        $this->assertTrue(Listing::published()->where('id', $listing->id)->exists());
    }

    public function test_booking_is_blocked_if_vendor_is_not_approved_for_that_district(): void
    {
        $chennai = District::firstOrCreate(['name' => 'Chennai'], ['region' => 'North', 'description' => 'Capital']);
        $madurai = District::firstOrCreate(['name' => 'Madurai'], ['region' => 'South', 'description' => 'Temple city']);

        $vendorUser = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Chennai Only Travels',
            'owner_name' => 'Ravi',
            'slug' => 'chennai-only-travels',
            'service_type' => 'rental_vehicle',
            'services' => ['car'],
            'district_id' => $chennai->id,
            'approved_district_ids' => [$chennai->id],
            'status' => 'active',
            'kyc_status' => 'verified',
            'phone' => '9840111222',
        ]);

        // Attempt listing in Madurai which vendor is NOT approved for
        $listing = Listing::create([
            'vendor_id' => $vendor->id,
            'district_id' => $madurai->id,
            'title' => 'Madurai Temple Cab',
            'description' => 'Cab service in Madurai',
            'type' => 'car',
            'price' => 2000,
            'is_active' => true,
            'status' => 'published',
        ]);

        $tourist = User::factory()->create(['role' => 'tourist']);

        $response = $this->actingAs($tourist)->post(route('bookings.store'), [
            'listing_id' => $listing->id,
            'start_date' => now()->addDays(2)->toDateString(),
            'travelers' => 2,
        ]);

        $response->assertSessionHasErrors(['district']);
    }

    public function test_booking_is_blocked_if_dates_conflict_with_vendor_availability(): void
    {
        $chennai = District::firstOrCreate(['name' => 'Chennai'], ['region' => 'North', 'description' => 'Capital']);
        $vendorUser = User::factory()->create(['role' => 'vendor']);
        
        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Elite Cabs',
            'owner_name' => 'Karthik',
            'slug' => 'elite-cabs',
            'service_type' => 'rental_vehicle',
            'services' => ['car'],
            'district_id' => $chennai->id,
            'approved_district_ids' => [$chennai->id],
            'status' => 'active',
            'kyc_status' => 'verified',
            'phone' => '9840199999',
        ]);

        $listing = Listing::create([
            'vendor_id' => $vendor->id,
            'district_id' => $chennai->id,
            'title' => 'Marina to Mahabalipuram AC Cab',
            'description' => 'Day trip',
            'type' => 'car',
            'price' => 3000,
            'is_active' => true,
            'status' => 'published',
        ]);

        $targetDate = now()->addDays(5)->toDateString();

        // Mark date as booked in calendar
        VendorAvailability::create([
            'vendor_id' => $vendor->id,
            'date' => $targetDate,
            'status' => 'booked',
            'notes' => 'VIP tour booked',
        ]);

        $tourist = User::factory()->create(['role' => 'tourist']);

        $response = $this->actingAs($tourist)->post(route('bookings.store'), [
            'listing_id' => $listing->id,
            'start_date' => $targetDate,
            'travelers' => 1,
        ]);

        $response->assertSessionHasErrors(['dates']);
    }

    public function test_tourist_without_completed_booking_cannot_submit_review(): void
    {
        $district = District::firstOrCreate(['name' => 'Madurai'], ['region' => 'South', 'description' => 'Temple city']);
        $vendorUser = User::factory()->create(['role' => 'vendor']);
        
        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Madurai Heritage Guides',
            'owner_name' => 'Sundaram',
            'slug' => 'madurai-heritage-guides',
            'service_type' => 'tour_package',
            'services' => ['guide'],
            'district_id' => $district->id,
            'approved_district_ids' => [$district->id],
            'status' => 'active',
            'kyc_status' => 'verified',
            'phone' => '9840188888',
        ]);

        $tourist = User::factory()->create(['role' => 'tourist']);

        // Attempt submitting review without completed booking
        $response = $this->actingAs($tourist)->post(route('reviews.store'), [
            'vendor_id' => $vendor->id,
            'rating' => 5,
            'comment' => 'Great tour but never booked through the system!',
        ]);

        $response->assertSessionHasErrors(['booking']);
    }

    public function test_district_change_requests_enforce_90_day_cooldown(): void
    {
        $district1 = District::firstOrCreate(['name' => 'Madurai'], ['region' => 'South', 'description' => 'Temple city']);
        $district2 = District::firstOrCreate(['name' => 'Theni'], ['region' => 'South', 'description' => 'Nature']);
        $district3 = District::firstOrCreate(['name' => 'Dindigul'], ['region' => 'South', 'description' => 'Hills']);

        $vendorUser = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Hill Rides',
            'owner_name' => 'Anand',
            'slug' => 'hill-rides',
            'service_type' => 'rental_vehicle',
            'services' => ['car'],
            'district_id' => $district1->id,
            'approved_district_ids' => [$district1->id, $district2->id],
            'status' => 'active',
            'kyc_status' => 'verified',
            'phone' => '9840177777',
        ]);

        // Record a recent approved change request 10 days ago (within 90-day cooldown)
        DistrictChangeRequest::create([
            'vendor_id' => $vendor->id,
            'old_district_id' => $district1->id,
            'new_district_id' => $district2->id,
            'reason' => 'Relocation',
            'status' => 'approved',
            'reviewed_at' => now()->subDays(10),
        ]);

        $this->assertFalse($vendor->canRequestDistrictChange());

        // Attempt new change request
        $response = $this->actingAs($vendorUser)->post(route('vendor.district-change.store'), [
            'old_district_id' => $district1->id,
            'new_district_id' => $district3->id,
            'reason' => 'Another expansion',
        ]);

        $response->assertSessionHasErrors(['cooldown']);
    }
}
