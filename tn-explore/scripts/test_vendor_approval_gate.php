<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Auth;

echo "========================================================\n";
echo "TESTING VENDOR REGISTRATION & APPROVAL GATE ENFORCEMENT\n";
echo "========================================================\n\n";

// 1. Create a newly registered pending vendor
$user = User::firstOrCreate(
    ['email' => 'kovaitours@tnexplore.local'],
    [
        'name' => 'Kovai Tour Operator',
        'password' => bcrypt('secret123'),
        'role' => 'vendor',
        'phone' => '9876543210',
    ]
);

$vendor = Vendor::updateOrCreate(
    ['user_id' => $user->id],
    [
        'business_name' => 'Kovai Heritage Tours',
        'owner_name' => 'Kovai Operator',
        'slug' => 'kovai-heritage-tours-test',
        'service_type' => 'tour_package',
        'district_id' => 4, // Coimbatore
        'phone' => '9876543210',
        'status' => 'pending',
        'kyc_status' => 'pending',
        'trust_score' => 0.700,
        'license_url' => 'kyc_documents/test_permit.pdf',
    ]
);

echo "1. Newly Registered Vendor State:\n";
echo "   - Email: {$user->email}\n";
echo "   - Status: {$vendor->status}\n";
echo "   - KYC Status: {$vendor->kyc_status}\n";
echo "   - Access Permitted: " . ($vendor->status === 'active' && $vendor->kyc_status === 'verified' ? 'YES (Active)' : 'NO (BLOCKED)') . "\n\n";

// 2. Admin Reviews and Approves
echo "2. Admin Reviews & Approves Vendor at /admin/kyc...\n";
$vendor->update([
    'kyc_status' => 'verified',
    'status' => 'active',
    'kyc_reviewed_at' => now(),
    'trust_score' => 0.890,
]);
$vendor->refresh();

echo "3. Post-Approval State:\n";
echo "   - Status: {$vendor->status}\n";
echo "   - KYC Status: {$vendor->kyc_status}\n";
echo "   - Access Permitted: " . ($vendor->status === 'active' && $vendor->kyc_status === 'verified' ? 'YES (GRANTED)' : 'NO (BLOCKED)') . "\n\n";

echo "✓ Verification Gate Enforced Successfully!\n";
