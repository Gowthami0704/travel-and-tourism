<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\District;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KycPrivacyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_unauthenticated_user_cannot_access_kyc_documents(): void
    {
        $district = District::firstOrCreate(['name' => 'Madurai', 'region' => 'South']);
        $vendorUser = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Secret Tours',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'license_url' => 'private/kyc/secret_license.pdf',
            'kyc_status' => 'pending',
        ]);

        $response = $this->get(route('admin.vendors.document', $vendor->id));
        // Should redirect to login or return 403
        $this->assertTrue(in_array($response->status(), [302, 403]));
    }

    public function test_tourist_cannot_access_kyc_documents(): void
    {
        $tourist = User::factory()->create(['role' => 'tourist']);
        $district = District::firstOrCreate(['name' => 'Madurai', 'region' => 'South']);
        $vendorUser = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Secret Tours',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'license_url' => 'private/kyc/secret_license.pdf',
            'kyc_status' => 'pending',
        ]);

        $response = $this->actingAs($tourist)->get(route('admin.vendors.document', $vendor->id));
        $response->assertStatus(403);
    }

    public function test_admin_can_access_kyc_document_and_audit_log_is_recorded(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'admin_role' => 'super_admin']);
        $district = District::firstOrCreate(['name' => 'Madurai', 'region' => 'South']);
        $vendorUser = User::factory()->create(['role' => 'vendor']);

        // Put a fake file on local disk
        Storage::disk('local')->put('private/kyc/secret_license.pdf', 'dummy pdf binary content');

        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Secret Tours',
            'service_type' => 'tour_package',
            'district_id' => $district->id,
            'license_url' => 'private/kyc/secret_license.pdf',
            'kyc_status' => 'pending',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.vendors.document', $vendor->id));
        $response->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'admin_viewed_kyc_document',
            'target_type' => 'vendor',
            'target_id' => (string) $vendor->id,
        ]);
    }
}
