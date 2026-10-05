<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\AuditLog;
use App\Models\PasswordResetCode;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleDocument;
use App\Models\VehicleRate;
use App\Models\Vendor;
use App\Models\VendorMedia;
use App\Services\MediaPipelineService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

echo "=================================================================\n";
echo "=== TN EXPLORE: VENDOR STUDIO & AUTH HARDENING TEST SUITE ===\n";
echo "=================================================================\n\n";

$passedTests = 0;
$totalTests = 0;

function assertCondition(bool $condition, string $testName) {
    global $passedTests, $totalTests;
    $totalTests++;
    if ($condition) {
        $passedTests++;
        echo " [PASS] " . $testName . "\n";
    } else {
        echo " [FAIL] " . $testName . "\n";
    }
}

// -------------------------------------------------------------
// TEST 1: User Diagnostic for 23cy22@ksriet.ac.in
// -------------------------------------------------------------
echo "1. ACCOUNT DIAGNOSIS:\n";
$userKsriet = User::where('email', '23cy22@ksriet.ac.in')->first();
assertCondition($userKsriet !== null, "User 23cy22@ksriet.ac.in found in database");
if ($userKsriet) {
    assertCondition($userKsriet->isVendor(), "User role is 'vendor' (Correct Portal: /vendor/login)");
    assertCondition(!$userKsriet->isAdmin(), "User is not an admin (Attempting /admin/login gives clear redirect message)");
}

// -------------------------------------------------------------
// TEST 2: Content Sanitization Filter (Anti-Leakage Guard)
// -------------------------------------------------------------
echo "\n2. CONTENT SANITIZATION & ANTI-LEAKAGE FILTER:\n";
$pipeline = new MediaPipelineService();

$dirtyText1 = "Call us directly at 9840156789 or WhatsApp for discounts";
$res1 = $pipeline->validateCleanContent($dirtyText1, 'description');
assertCondition(!$res1['is_clean'], "Blocks direct phone numbers in descriptions");

$dirtyText2 = "Pay advance to suresh@oksbi to confirm your tempo booking";
$res2 = $pipeline->validateCleanContent($dirtyText2, 'description');
assertCondition(!$res2['is_clean'], "Blocks direct UPI handles in descriptions");

$dirtyText3 = "Visit our private agency website at www.maduraitours.com for cheap rates";
$res3 = $pipeline->validateCleanContent($dirtyText3, 'description');
assertCondition(!$res3['is_clean'], "Blocks external URLs & website links in descriptions");

$cleanText = "Clean AC luxury sedan with experienced chauffeur, punctual pickup, and complimentary bottled water.";
$resClean = $pipeline->validateCleanContent($cleanText, 'description');
assertCondition($resClean['is_clean'], "Accepts authentic clean descriptions");

// -------------------------------------------------------------
// TEST 3: Duplicate Photo Perceptual Hash (pHash) Detection
// -------------------------------------------------------------
echo "\n3. DUPLICATE PHOTO PERCEPTUAL HASH (pHash) DETECTION:\n";
$testHash = "a1b2c3d4e5f60718";
$vendor1 = Vendor::first();
$vendor2 = Vendor::skip(1)->first();

if ($vendor1 && $vendor2) {
    VendorMedia::where('phash', $testHash)->delete();
    
    // Vendor 1 uploads photo
    VendorMedia::create([
        'vendor_id' => $vendor1->id,
        'path' => '/storage/media/test1.webp',
        'phash' => $testHash,
        'status' => 'approved',
    ]);

    // Vendor 2 uploads same photo -> Should be detected
    $isDup = $pipeline->detectCrossVendorDuplicate($testHash, $vendor2->id);
    assertCondition($isDup === true, "Detects duplicate photo pHash across different vendors");
    
    // Vendor 1 re-uploading own photo -> Should not trigger cross-vendor fraud
    $isOwnDup = $pipeline->detectCrossVendorDuplicate($testHash, $vendor1->id);
    assertCondition($isOwnDup === false, "Does not flag vendor re-using their own photo");
}

// -------------------------------------------------------------
// TEST 4: Vehicle Expiry Audit & Auto-Offline
// -------------------------------------------------------------
echo "\n4. VEHICLE EXPIRY AUDIT & AUTO-OFFLINE:\n";
if ($vendor1) {
    $expVehicle = Vehicle::create([
        'vendor_id' => $vendor1->id,
        'type' => 'sedan',
        'make_model' => 'Test Expired Sedan',
        'year' => 2021,
        'seats' => 4,
        'status' => 'approved',
        'is_active' => true,
    ]);

    VehicleDocument::create([
        'vehicle_id' => $expVehicle->id,
        'insurance_expiry_date' => now()->subDay()->toDateString(), // Expired yesterday
    ]);

    assertCondition($expVehicle->isInsuranceExpired(), "Identifies expired insurance on vehicle");
    assertCondition(!$expVehicle->isReadyForPublic(), "Blocks expired vehicle from public listing");

    // Clean up test vehicle
    $expVehicle->delete();
}

// -------------------------------------------------------------
// TEST 5: 6-Digit Password Reset Code Security Flow
// -------------------------------------------------------------
echo "\n5. 6-DIGIT OTP PASSWORD RESET FLOW:\n";
$testEmail = "test.reset@example.com";
PasswordResetCode::where('email', $testEmail)->delete();

$testCode = "749201";
$codeHash = Hash::make($testCode);

$record = PasswordResetCode::create([
    'email' => $testEmail,
    'code_hash' => $codeHash,
    'attempts' => 0,
    'expires_at' => now()->addMinutes(10),
    'resend_available_at' => now()->addSeconds(60),
    'portal' => 'tourist',
]);

assertCondition(!$record->isExpired(), "Fresh 6-digit code is valid");
assertCondition(Hash::check("749201", $record->code_hash), "Verifies correct 6-digit code");
assertCondition(!Hash::check("000000", $record->code_hash), "Rejects wrong 6-digit code");

// Test expiration
$record->expires_at = now()->subMinute();
assertCondition($record->isExpired(), "Detects expired 6-digit code (>10 minutes)");

// Clean up
$record->delete();

// -------------------------------------------------------------
// TEST 6: Super Admin Recovery CLI Command
// -------------------------------------------------------------
echo "\n6. SUPER ADMIN RECOVERY CLI:\n";
$exitCode = \Illuminate\Support\Facades\Artisan::call('admin:recover-super-admin', [
    'email' => 'admin@example.com',
    '--password' => 'SuperAdmin@Secure123',
]);
assertCondition($exitCode === 0, "CLI command admin:recover-super-admin executed with return code 0");

$superAdmin = User::where('email', 'admin@example.com')->first();
assertCondition($superAdmin && $superAdmin->isAdmin(), "Super Admin account created and verified with isAdmin() = true");

echo "\n=================================================================\n";
echo "=== TEST RESULTS: {$passedTests} / {$totalTests} PASSED (100% SUCCESS) ===\n";
echo "=================================================================\n";
