<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

$vendorUser = App\Models\User::where('role', 'vendor')->first();
if ($vendorUser && $vendorUser->vendor) {
    $vendor = $vendorUser->vendor;
    $breakdown = $vendor->ai_trust_breakdown;
    echo "Vendor: " . $vendorUser->email . PHP_EOL;
    echo "Business Name: " . $vendor->business_name . PHP_EOL;
    echo "AI Trust Breakdown: " . json_encode($breakdown) . PHP_EOL;
    echo "Total Trust Score: " . ($breakdown['total'] ?? 'MISSING') . PHP_EOL;
} else {
    echo "No vendor user found" . PHP_EOL;
}
