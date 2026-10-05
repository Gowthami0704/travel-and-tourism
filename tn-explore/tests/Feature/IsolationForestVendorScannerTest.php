<?php

namespace Tests\Feature;

use App\Models\District;
use App\Models\FraudFlag;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorEvent;
use App\Services\VendorAnomalyScanner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IsolationForestVendorScannerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_new_vendors_are_classified_as_insufficient_data_and_never_high_risk()
    {
        $district = District::create(['name' => 'Chennai', 'slug' => 'chennai']);
        $user = User::factory()->create();

        $vendor = Vendor::create([
            'user_id' => $user->id,
            'business_name' => 'Brand New Travels',
            'slug' => 'brand-new-travels-' . uniqid(),
            'district_id' => $district->id,
            'service_type' => 'car',
            'status' => 'pending',
            'kyc_status' => 'pending',
            'created_at' => now()->subDays(3), // Cold start: 3 days old
        ]);

        $scanner = new VendorAnomalyScanner();
        $result = $scanner->scanVendor($vendor);

        $this->assertEquals('insufficient_data', $result['scan_status']);
        $this->assertNotEquals('high', $result['risk_tier']);
        $this->assertLessThanOrEqual(35, $result['risk_score']);
    }

    public function test_duplicate_credentials_or_device_ring_creates_hard_rule_flag()
    {
        $district = District::create(['name' => 'Madurai', 'slug' => 'madurai']);
        $u1 = User::factory()->create();
        $u2 = User::factory()->create();

        $sharedPhone = '9876543210';
        $v1 = Vendor::create([
            'user_id' => $u1->id,
            'business_name' => 'Alpha Travels',
            'slug' => 'alpha-travels-' . uniqid(),
            'district_id' => $district->id,
            'service_type' => 'car',
            'phone' => $sharedPhone,
            'status' => 'approved',
            'created_at' => now()->subDays(60),
        ]);

        $v2 = Vendor::create([
            'user_id' => $u2->id,
            'business_name' => 'Beta Travels',
            'slug' => 'beta-travels-' . uniqid(),
            'district_id' => $district->id,
            'service_type' => 'car',
            'phone' => $sharedPhone, // Same phone number
            'status' => 'approved',
            'created_at' => now()->subDays(60),
        ]);

        $scanner = new VendorAnomalyScanner();
        $res = $scanner->scanVendor($v2);

        $this->assertGreaterThanOrEqual(30, $res['hard_rule_score']);
        $this->assertTrue(collect($res['top_reasons'])->pluck('title')->contains(function ($title) {
            return str_contains(strtolower($title), 'duplicate') || str_contains(strtolower($title), 'violation');
        }));
    }

    public function test_dismissal_requires_a_reason()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $district = District::create(['name' => 'Nilgiris', 'slug' => 'nilgiris']);
        $vendorUser = User::factory()->create();

        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Test Operator',
            'slug' => 'test-op-' . uniqid(),
            'district_id' => $district->id,
            'service_type' => 'car',
            'status' => 'approved',
            'created_at' => now()->subDays(60),
        ]);

        $flag = FraudFlag::create([
            'vendor_id' => $vendor->id,
            'reason' => 'Cancellation anomaly',
            'severity' => 'high',
            'resolved' => false,
        ]);

        // Post without reason -> validation failure
        $response = $this->actingAs($admin)->post(route('admin.fraud.dismiss', $flag->id), []);
        $response->assertSessionHasErrors('reason');

        // Post with reason -> succeeds
        $response = $this->actingAs($admin)->post(route('admin.fraud.dismiss', $flag->id), [
            'reason' => 'Verified route closure due to landslide advisory',
        ]);
        $response->assertRedirect();
        
        $flag->refresh();
        $this->assertTrue($flag->resolved);
        $this->assertEquals('dismissed', $flag->admin_action);
        $this->assertEquals('Verified route closure due to landslide advisory', $flag->dismissed_reason);
    }

    public function test_suspend_requires_confirmation()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $district = District::create(['name' => 'Coimbatore', 'slug' => 'coimbatore']);
        $vendorUser = User::factory()->create();

        $vendor = Vendor::create([
            'user_id' => $vendorUser->id,
            'business_name' => 'Suspicious Tours',
            'slug' => 'suspicious-tours-' . uniqid(),
            'district_id' => $district->id,
            'service_type' => 'package',
            'status' => 'approved',
            'created_at' => now()->subDays(60),
        ]);

        $flag = FraudFlag::create([
            'vendor_id' => $vendor->id,
            'reason' => 'Repeated off-platform payment solicitations',
            'severity' => 'high',
            'resolved' => false,
        ]);

        // Post without confirmation checkbox -> validation error
        $response = $this->actingAs($admin)->post(route('admin.fraud.suspend', $flag->id), [
            'reason' => 'Confirmed policy breach',
        ]);
        $response->assertSessionHasErrors('confirmation');

        // Post with confirmation checkbox -> succeeds
        $response = $this->actingAs($admin)->post(route('admin.fraud.suspend', $flag->id), [
            'confirmation' => true,
            'reason' => 'Confirmed policy breach and tourist extortion report',
        ]);
        $response->assertRedirect();

        $vendor->refresh();
        $this->assertEquals('suspended', $vendor->status);
    }

    public function test_benchmark_metrics_read_from_csv()
    {
        $scanner = new VendorAnomalyScanner();
        $metrics = $scanner->getBenchmarkMetrics();

        $this->assertArrayHasKey('precision', $metrics);
        $this->assertArrayHasKey('recall', $metrics);
        $this->assertArrayHasKey('f1_score', $metrics);
        $this->assertArrayHasKey('false_positive_rate', $metrics);
        $this->assertEquals(57, $metrics['training_vendors']);
        $this->assertEquals('v2.4-iso-forest', $metrics['model_version']);
    }
}
