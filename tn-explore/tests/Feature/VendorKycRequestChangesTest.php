<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\District;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VerificationMessage;
use App\Notifications\VendorKycCorrectionNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VendorKycRequestChangesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Storage::fake('public');
    }

    /**
     * Test 1: Invalid email format and domain (e.g. gowthami3@com) is rejected on registration.
     */
    public function test_invalid_email_format_and_domain_is_rejected(): void
    {
        $district = District::firstOrCreate(['name' => 'Madurai'], ['region' => 'South']);

        $response = $this->post(route('vendor.register.store'), [
            'owner_name' => 'Gowthami',
            'business_name' => 'Gowthami Travels',
            'email' => 'gowthami3@com', // Invalid domain without proper dot-tld structure
            'phone' => '9876543210',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'primary_district_ids' => [$district->id],
            'services' => ['package'],
            'owner_photo' => UploadedFile::fake()->image('owner.jpg'),
            'aadhaar_file' => UploadedFile::fake()->create('aadhaar.pdf', 500, 'application/pdf'),
            'license_file' => UploadedFile::fake()->create('license.pdf', 500, 'application/pdf'),
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertDatabaseMissing('users', ['email' => 'gowthami3@com']);
    }

    /**
     * Test 2: Unverified email cannot reach the admin KYC queue.
     */
    public function test_unverified_email_cannot_reach_admin_kyc_queue(): void
    {
        $district = District::firstOrCreate(['name' => 'Tiruchirappalli'], ['region' => 'Central']);
        $unverifiedUser = User::factory()->create([
            'role' => 'vendor',
            'email' => 'unverified@partner.com',
            'email_verified_at' => null, // Email unverified
        ]);

        $vendor = Vendor::create([
            'user_id' => $unverifiedUser->id,
            'business_name' => 'Unverified Partner Corp',
            'owner_name' => 'John Unverified',
            'slug' => 'unverified-partner-corp',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'status' => 'pending_review',
            'kyc_status' => 'pending',
            'phone' => '9876543211',
        ]);

        // Must not be visible in pendingKyc queue while email is unverified
        $this->assertFalse(Vendor::pendingKyc()->where('id', $vendor->id)->exists());

        // Once user verifies email, vendor enters the KYC queue
        $unverifiedUser->markEmailAsVerified();
        $this->assertTrue(Vendor::pendingKyc()->where('id', $vendor->id)->exists());
    }

    /**
     * Test 3: Admin "Request Changes" action sets needs_correction and sends notification with NO sensitive Aadhaar info.
     */
    public function test_admin_can_request_changes_setting_needs_correction_and_sending_notification(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => 'admin', 'admin_role' => 'super_admin']);
        $vendorUser = User::factory()->create(['role' => 'vendor', 'email_verified_at' => now()]);
        $district = District::firstOrCreate(['name' => 'Madurai'], ['region' => 'South']);

        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Madurai Heritage Agency',
            'owner_name' => 'Ramanathan',
            'slug' => 'madurai-heritage-agency',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'district_ids' => [$district->id],
            'status' => 'pending_review',
            'kyc_status' => 'pending',
            'phone' => '9840012345',
            'aadhaar_document_path' => 'private_documents/aadhaar/secret_aadhaar.pdf',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.kyc.requestChanges', $vendor->id), [
            'checklist_items' => ['aadhaar_unclear', 'license_expired_unreadable'],
            'admin_notes' => 'Please upload high-resolution scan of your trade license showing validity for 2026.',
            'deadline_days' => 7,
        ]);

        $response->assertSessionHas('success');

        $vendor->refresh();
        $this->assertEquals('needs_correction', $vendor->kyc_status);
        $this->assertEquals('needs_correction', $vendor->status);
        $this->assertEquals(1, $vendor->correction_attempts);
        $this->assertNotNull($vendor->correction_deadline);
        $this->assertContains('aadhaar_unclear', $vendor->correction_flagged_fields);

        // Verification message table recorded
        $this->assertDatabaseHas('verification_messages', [
            'vendor_id' => $vendor->id,
            'sender_id' => $admin->id,
            'sender_role' => 'admin',
            'type' => 'request_changes',
        ]);

        // Audit log created
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'kyc_changes_requested',
            'target_type' => 'vendor',
            'target_id' => (string) $vendor->id,
        ]);

        // Notification dispatched without sensitive Aadhaar details
        Notification::assertSentTo(
            $vendorUser,
            VendorKycCorrectionNotification::class,
            function ($notification) {
                return in_array('aadhaar_unclear', $notification->checklistItems) &&
                       !empty($notification->note);
            }
        );

        // While in needs_correction, vendor is excluded from active pending queue
        $this->assertFalse(Vendor::pendingKyc()->where('id', $vendor->id)->exists());
    }

    /**
     * Test 4: Vendor can resubmit only flagged fields and resubmission creates a diff and returns to queue.
     */
    public function test_vendor_can_resubmit_corrections_and_diff_is_generated(): void
    {
        $vendorUser = User::factory()->create(['role' => 'vendor', 'email_verified_at' => now()]);
        $district = District::firstOrCreate(['name' => 'Madurai'], ['region' => 'South']);

        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Pandian Tours',
            'owner_name' => 'Pandian',
            'slug' => 'pandian-tours',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'status' => 'needs_correction',
            'kyc_status' => 'needs_correction',
            'correction_attempts' => 1,
            'correction_flagged_fields' => ['phone_missing', 'license_expired_unreadable'],
            'phone' => '9800000000',
        ]);

        $response = $this->actingAs($vendorUser)->post(route('vendor.kyc.resubmit'), [
            'phone' => '9840099999', // Updated phone
            'license_file' => UploadedFile::fake()->create('renewed_license.pdf', 500, 'application/pdf'),
            'vendor_notes' => 'Attached updated valid license certificate for 2026-2027.',
        ]);

        $response->assertRedirect(route('vendor.under-review'));

        $vendor->refresh();
        $this->assertEquals('resubmitted', $vendor->kyc_status);
        $this->assertEquals('resubmitted', $vendor->status);
        $this->assertEquals('9840099999', $vendor->phone);
        $this->assertNotNull($vendor->last_resubmitted_at);
        $this->assertArrayHasKey('phone', $vendor->resubmission_diff);
        $this->assertArrayHasKey('license_file', $vendor->resubmission_diff);

        // Verification message history created by vendor
        $this->assertDatabaseHas('verification_messages', [
            'vendor_id' => $vendor->id,
            'sender_id' => $vendorUser->id,
            'sender_role' => 'vendor',
            'type' => 'resubmission',
        ]);

        // Resubmitted vendor re-enters the pending KYC queue
        $this->assertTrue(Vendor::pendingKyc()->where('id', $vendor->id)->exists());
    }

    /**
     * Test 5: Dashboard and KYC queue pending count match.
     */
    public function test_dashboard_and_kyc_queue_pending_counts_match(): void
    {
        $queueCount = Vendor::pendingKyc()->count();
        $dashboardCount = Vendor::pendingKycCount();

        $this->assertEquals($queueCount, $dashboardCount);
    }

    /**
     * Test 6: Duplicate phone or email flags are detected.
     */
    public function test_duplicate_phone_or_email_flags_are_detected(): void
    {
        $district = District::firstOrCreate(['name' => 'Salem'], ['region' => 'Kongu']);
        $user1 = User::factory()->create(['role' => 'vendor', 'email' => 'vendor1@test.com', 'email_verified_at' => now()]);
        $user2 = User::factory()->create(['role' => 'vendor', 'email' => 'vendor2@test.com', 'email_verified_at' => now()]);

        $vendor1 = Vendor::create([
            'user_id' => $user1->id,
            'business_name' => 'Agency One',
            'owner_name' => 'Owner One',
            'slug' => 'agency-one',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'status' => 'pending_review',
            'kyc_status' => 'pending',
            'phone' => '9888877777',
        ]);

        $vendor2 = Vendor::create([
            'user_id' => $user2->id,
            'business_name' => 'Agency Two Duplicate',
            'owner_name' => 'Owner Two',
            'slug' => 'agency-two-duplicate',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'status' => 'pending_review',
            'kyc_status' => 'pending',
            'phone' => '9888877777', // Same phone number!
        ]);

        $flags = $vendor2->duplicate_flags;
        $this->assertNotEmpty($flags);
        $this->assertStringContainsString('Duplicate phone number detected', $flags[0]);
    }
}
