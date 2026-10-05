<?php

namespace Tests\Feature;

use App\Models\District;
use App\Models\DistrictChangeRequest;
use App\Models\Listing;
use App\Models\PackageDeparture;
use App\Models\State;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorDistrict;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TwoTierVendorDistrictAndPackageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Storage::fake('local');
    }

    public function test_more_than_two_primary_districts_rejected_on_registration(): void
    {
        $d1 = District::create(['name' => 'Madurai', 'region' => 'South', 'description' => 'Temple city']);
        $d2 = District::create(['name' => 'Dindigul', 'region' => 'South', 'description' => 'City']);
        $d3 = District::create(['name' => 'Theni', 'region' => 'South', 'description' => 'Valley']);

        $response = $this->post(route('vendor.register.store'), [
            'owner_name' => 'Karthik Raja',
            'business_name' => 'Karthik Travels',
            'email' => 'karthik@travels.com',
            'phone' => '+91 98401 23456',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'primary_district_ids' => [$d1->id, $d2->id, $d3->id], // 3 primary districts (violates max 2)
            'services' => ['car', 'package'],
            'owner_photo' => UploadedFile::fake()->image('owner.jpg'),
            'aadhaar_file' => UploadedFile::fake()->create('aadhaar.pdf', 100),
            'license_file' => UploadedFile::fake()->create('license.pdf', 100),
        ]);

        $response->assertSessionHasErrors('primary_district_ids');
        $this->assertDatabaseMissing('vendors', ['business_name' => 'Karthik Travels']);
    }

    public function test_guide_only_vendor_cannot_add_extended_districts(): void
    {
        $d1 = District::create(['name' => 'Madurai', 'region' => 'South', 'description' => 'Temple city']);
        $d2 = District::create(['name' => 'Dindigul', 'region' => 'South', 'description' => 'City']);
        $d3 = District::create(['name' => 'Theni', 'region' => 'South', 'description' => 'Valley']);

        $response = $this->post(route('vendor.register.store'), [
            'owner_name' => 'Vignesh Guide',
            'business_name' => 'Madurai Temple Heritage Walks',
            'email' => 'vignesh@guide.com',
            'phone' => '+91 98401 99999',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'primary_district_ids' => [$d1->id],
            'extended_district_ids' => [$d2->id, $d3->id],
            'services' => ['guide'], // Guide only
            'owner_photo' => UploadedFile::fake()->image('owner.jpg'),
            'aadhaar_file' => UploadedFile::fake()->create('aadhaar.pdf', 100),
            'license_file' => UploadedFile::fake()->create('license.pdf', 100),
        ]);

        $response->assertSessionHasErrors('extended_district_ids');
    }

    public function test_district_ranking_places_primary_before_extended_vendors(): void
    {
        $district = District::create(['name' => 'Madurai', 'region' => 'South', 'description' => 'Temple city']);

        // 1. Primary Vendor
        $u1 = User::factory()->create(['role' => 'vendor']);
        $vPrimary = Vendor::create([
            'user_id' => $u1->id,
            'business_name' => 'Local Expert Agency',
            'owner_name' => 'Ravi',
            'phone' => '9840111111',
            'status' => 'active',
            'kyc_status' => 'verified',
            'trust_score' => 0.80,
            'district_id' => $district->id,
            'service_type' => 'tour_package',
            'services' => ['car', 'package'],
        ]);
        VendorDistrict::create([
            'vendor_id' => $vPrimary->id,
            'district_id' => $district->id,
            'level' => 'primary',
            'status' => 'approved',
        ]);

        // 2. Extended Vendor with higher trust score
        $u2 = User::factory()->create(['role' => 'vendor']);
        $vExtended = Vendor::create([
            'user_id' => $u2->id,
            'business_name' => 'Travels To Agency',
            'owner_name' => 'Suresh',
            'phone' => '9840122222',
            'status' => 'active',
            'kyc_status' => 'verified',
            'trust_score' => 0.98,
            'district_id' => $district->id,
            'service_type' => 'tour_package',
            'services' => ['car', 'package'],
        ]);
        VendorDistrict::create([
            'vendor_id' => $vExtended->id,
            'district_id' => $district->id,
            'level' => 'extended',
            'status' => 'approved',
        ]);

        $response = $this->get(route('district.show', $district->id));
        $response->assertOk();

        $vendors = $response->viewData('page')['props']['districtVendors'];
        $this->assertCount(2, $vendors);
        $this->assertEquals($vPrimary->id, $vendors[0]['id'], 'Primary local expert vendor should rank first');
        $this->assertEquals($vExtended->id, $vendors[1]['id'], 'Extended travels-to vendor should rank second');
    }

    public function test_booking_is_blocked_for_guide_in_extended_district(): void
    {
        $primaryDistrict = District::create(['name' => 'Madurai', 'region' => 'South', 'description' => 'Temple city']);
        $extendedDistrict = District::create(['name' => 'Tiruchirappalli', 'region' => 'Central', 'description' => 'Rockfort city']);

        $user = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create([
            'user_id' => $user->id,
            'business_name' => 'Heritage Guide Services',
            'owner_name' => 'Manikandan',
            'phone' => '9840133333',
            'status' => 'active',
            'kyc_status' => 'verified',
            'service_type' => 'tour_package',
            'services' => ['guide', 'car'],
            'district_id' => $primaryDistrict->id,
        ]);

        VendorDistrict::create([
            'vendor_id' => $vendor->id,
            'district_id' => $primaryDistrict->id,
            'level' => 'primary',
            'status' => 'approved',
        ]);
        VendorDistrict::create([
            'vendor_id' => $vendor->id,
            'district_id' => $extendedDistrict->id,
            'level' => 'extended',
            'status' => 'approved',
        ]);

        // Listing for guide in extended district
        $guideListing = Listing::create([
            'vendor_id' => $vendor->id,
            'district_id' => $extendedDistrict->id,
            'title' => 'Rockfort Temple Walking Tour',
            'description' => 'Guided walking tour',
            'type' => 'guide',
            'price' => 2000,
            'is_active' => true,
            'status' => 'published',
        ]);

        $tourist = User::factory()->create(['role' => 'tourist']);

        $response = $this->actingAs($tourist)->post(route('bookings.store'), [
            'listing_id' => $guideListing->id,
            'start_date' => now()->addDays(2)->toDateString(),
            'travelers' => 2,
        ]);

        $response->assertSessionHasErrors('district');
    }

    public function test_admin_can_revoke_extended_district(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $district = District::create(['name' => 'Madurai', 'region' => 'South', 'description' => 'Temple city']);
        $user = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create([
            'user_id' => $user->id,
            'business_name' => 'Speed Cabs',
            'owner_name' => 'Murugan',
            'phone' => '9840144444',
            'status' => 'active',
            'kyc_status' => 'verified',
            'service_type' => 'rental_vehicle',
            'district_id' => $district->id,
        ]);

        $vd = VendorDistrict::create([
            'vendor_id' => $vendor->id,
            'district_id' => $district->id,
            'level' => 'extended',
            'status' => 'approved',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.vendors.revokeExtendedDistrict', [
            'id' => $vendor->id,
            'districtId' => $district->id,
        ]), [
            'reason' => 'Multiple traveler complaints in this sector.',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('vendor_districts', ['id' => $vd->id]);
    }

    public function test_primary_district_change_within_90_days_is_rejected(): void
    {
        $d1 = District::create(['name' => 'Madurai', 'region' => 'South', 'description' => 'Temple city']);
        $d2 = District::create(['name' => 'Theni', 'region' => 'South', 'description' => 'Valley']);

        $user = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create([
            'user_id' => $user->id,
            'business_name' => 'Highland Cabs',
            'owner_name' => 'Bala',
            'phone' => '9840155555',
            'status' => 'active',
            'kyc_status' => 'verified',
            'service_type' => 'rental_vehicle',
            'district_id' => $d1->id,
        ]);

        VendorDistrict::create([
            'vendor_id' => $vendor->id,
            'district_id' => $d1->id,
            'level' => 'primary',
            'status' => 'approved',
        ]);

        // Previous approved request 30 days ago (within 90-day cooldown)
        DistrictChangeRequest::create([
            'vendor_id' => $vendor->id,
            'old_district_id' => $d1->id,
            'new_district_id' => $d2->id,
            'status' => 'approved',
            'reviewed_at' => now()->subDays(30),
        ]);

        $response = $this->actingAs($user)->post(route('vendor.district-change.store'), [
            'old_district_id' => $d1->id,
            'new_district_id' => $d2->id,
            'reason' => 'Relocating office base',
        ]);

        $response->assertSessionHasErrors('cooldown');
    }

    public function test_package_price_zero_is_rejected(): void
    {
        $d = District::create(['name' => 'Madurai', 'region' => 'South', 'description' => 'Temple city']);
        $user = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create([
            'user_id' => $user->id,
            'business_name' => 'Value Tours',
            'owner_name' => 'Kumar',
            'phone' => '9840166666',
            'status' => 'active',
            'kyc_status' => 'verified',
            'service_type' => 'tour_package',
            'services' => ['package'],
            'district_id' => $d->id,
        ]);

        VendorDistrict::create([
            'vendor_id' => $vendor->id,
            'district_id' => $d->id,
            'level' => 'primary',
            'status' => 'approved',
        ]);

        $response = $this->actingAs($user)->post(route('vendor.listings.store'), [
            'title' => 'Zero Price Fake Package',
            'description' => 'Test invalid zero price package',
            'type' => 'package',
            'price' => 0, // Zero price
            'district_id' => $d->id,
        ]);

        $response->assertSessionHasErrors('price');
    }

    public function test_group_departure_seats_cannot_oversell(): void
    {
        $district = District::create(['name' => 'Madurai', 'region' => 'South', 'description' => 'Temple city']);
        $user = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create([
            'user_id' => $user->id,
            'business_name' => 'Express Tour Operator',
            'owner_name' => 'Anand',
            'phone' => '9840177777',
            'status' => 'active',
            'kyc_status' => 'verified',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
        ]);
        VendorDistrict::create([
            'vendor_id' => $vendor->id,
            'district_id' => $district->id,
            'level' => 'primary',
            'status' => 'approved',
        ]);

        $listing = Listing::create([
            'vendor_id' => $vendor->id,
            'district_id' => $district->id,
            'title' => 'Weekend Madurai Departure',
            'description' => 'Fixed departure weekend package',
            'type' => 'package',
            'price' => 5000,
            'is_active' => true,
            'status' => 'published',
        ]);

        $departure = PackageDeparture::create([
            'listing_id' => $listing->id,
            'departure_date' => now()->addDays(5)->toDateString(),
            'total_seats' => 5,
            'seats_left' => 2, // Only 2 seats left
            'status' => 'open',
        ]);

        $tourist = User::factory()->create(['role' => 'tourist']);

        // Request 4 seats when only 2 are left
        $response = $this->actingAs($tourist)->post(route('bookings.store'), [
            'listing_id' => $listing->id,
            'departure_id' => $departure->id,
            'start_date' => $departure->departure_date->toDateString(),
            'travelers' => 4,
        ]);

        $response->assertSessionHasErrors('seats');
        $this->assertEquals(2, $departure->fresh()->seats_left);
    }
}
