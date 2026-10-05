<?php

namespace Tests\Feature;

use App\Models\District;
use App\Models\Listing;
use App\Models\User;
use App\Models\Vendor;
use App\Notifications\VendorKycStatusNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VendorRegistrationAndKycTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Storage::fake('public');
    }

    public function test_new_vendor_can_register_and_appears_in_kyc_queue_immediately(): void
    {
        Notification::fake();

        $district1 = District::firstOrCreate(['name' => 'Madurai'], ['region' => 'South', 'description' => 'Temple city']);
        $district2 = District::firstOrCreate(['name' => 'Dindigul'], ['region' => 'South', 'description' => 'Hill city']);

        $initialPendingCount = Vendor::pendingKycCount();

        $response = $this->post(route('vendor.register.store'), [
            'owner_name' => 'Gowthami',
            'business_name' => 'Gowthami Agency',
            'email' => 'gowthami@agency.com',
            'phone' => '9876543210',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'district_ids' => [$district1->id, $district2->id],
            'services' => ['car', 'package'],
            'owner_photo' => UploadedFile::fake()->image('owner.jpg'),
            'aadhaar_file' => UploadedFile::fake()->create('aadhaar.pdf', 500, 'application/pdf'),
            'license_file' => UploadedFile::fake()->create('license.pdf', 500, 'application/pdf'),
            'gst_number' => '33AAAAA0000A1Z5',
            'description' => 'Premier tour and cab operations in Madurai and Dindigul.',
        ]);

        $response->assertRedirect(route('vendor.under-review'));

        // Check user & vendor records
        $this->assertDatabaseHas('users', [
            'email' => 'gowthami@agency.com',
            'role' => 'vendor',
        ]);

        $vendor = Vendor::where('business_name', 'Gowthami Agency')->first();
        $this->assertNotNull($vendor);
        $this->assertEquals('pending_review', $vendor->status);
        $this->assertEquals('pending', $vendor->kyc_status);
        $this->assertEquals([$district1->id, $district2->id], $vendor->district_ids);

        // Queue count increases by exactly 1
        $this->assertEquals($initialPendingCount + 1, Vendor::pendingKycCount());

        // Vendor is present in the pending KYC scope
        $this->assertTrue(Vendor::pendingKyc()->where('id', $vendor->id)->exists());
    }

    public function test_dashboard_pending_count_matches_kyc_queue_count(): void
    {
        $queueCount = Vendor::pendingKyc()->count();
        $dashboardCount = Vendor::pendingKycCount();

        $this->assertEquals($queueCount, $dashboardCount);
    }

    public function test_unapproved_vendor_cannot_access_active_vendor_routes_and_is_redirected_to_under_review(): void
    {
        $user = User::factory()->create(['role' => 'vendor']);
        $district = District::firstOrCreate(['name' => 'Chennai'], ['region' => 'North', 'description' => 'Capital']);

        $vendor = Vendor::create([
            'user_id' => $user->id,
            'business_name' => 'Pending Travels',
            'owner_name' => 'Tester',
            'slug' => 'pending-travels',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'status' => 'pending_review',
            'kyc_status' => 'pending',
            'phone' => '9999999999',
        ]);

        // Attempt accessing protected vendor dashboard
        $response = $this->actingAs($user)->get(route('vendor.dashboard'));
        $response->assertRedirect(route('vendor.under-review'));

        // Attempt accessing listings
        $response = $this->actingAs($user)->get(route('vendor.listings.index'));
        $response->assertRedirect(route('vendor.under-review'));

        // Accessing under-review page is allowed
        $response = $this->actingAs($user)->get(route('vendor.under-review'));
        $response->assertOk();
    }

    public function test_admin_can_approve_vendor_with_districts_and_notification_is_sent(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => 'admin', 'admin_role' => 'super_admin']);
        $vendorUser = User::factory()->create(['role' => 'vendor']);
        $district1 = District::firstOrCreate(['name' => 'Madurai'], ['region' => 'South']);
        $district2 = District::firstOrCreate(['name' => 'Theni'], ['region' => 'South']);

        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Pandian Heritage',
            'owner_name' => 'Pandian',
            'slug' => 'pandian-heritage',
            'service_type' => 'tour_package',
            'services' => ['package', 'car'],
            'district_id' => $district1->id,
            'district_ids' => [$district1->id, $district2->id],
            'status' => 'pending_review',
            'kyc_status' => 'pending',
            'phone' => '9888888888',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.kyc.approve', $vendor->id), [
            'approved_district_ids' => [$district1->id, $district2->id],
        ]);

        $response->assertSessionHas('success');

        $vendor->refresh();
        $this->assertEquals('active', $vendor->status);
        $this->assertEquals('verified', $vendor->kyc_status);
        $this->assertEquals([$district1->id, $district2->id], $vendor->approved_district_ids);

        // Verification email notification sent
        Notification::assertSentTo(
            $vendorUser,
            VendorKycStatusNotification::class,
            function ($notification) {
                return $notification->status === 'approved';
            }
        );
    }

    public function test_admin_can_reject_vendor_with_reason_and_notification_is_sent(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => 'admin', 'admin_role' => 'super_admin']);
        $vendorUser = User::factory()->create(['role' => 'vendor']);
        $district = District::firstOrCreate(['name' => 'Salem'], ['region' => 'Kongu']);

        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Reject Test Agency',
            'owner_name' => 'Reject Tester',
            'slug' => 'reject-test-agency',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'status' => 'pending_review',
            'kyc_status' => 'pending',
            'phone' => '9777777777',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.kyc.reject', $vendor->id), [
            'rejection_reason_type' => 'Expired Tourism License',
            'rejection_notes' => 'Please upload a license certificate valid for the current financial year.',
        ]);

        $response->assertSessionHas('success');

        $vendor->refresh();
        $this->assertEquals('rejected', $vendor->status);
        $this->assertEquals('rejected', $vendor->kyc_status);
        $this->assertStringContainsString('Expired Tourism License', $vendor->kyc_rejected_reason);

        // Rejection email notification sent
        Notification::assertSentTo(
            $vendorUser,
            VendorKycStatusNotification::class,
            function ($notification) {
                return $notification->status === 'rejected';
            }
        );
    }
}
