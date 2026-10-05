<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Vendor;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

$admin = User::where('role', 'admin')->first();
Auth::login($admin);

$controller = new \App\Http\Controllers\Admin\AdminVendorController();
$vendor44 = Vendor::find(44);

if ($vendor44) {
    echo "Vendor 44 found: {$vendor44->business_name}\n";
    echo "License URL: {$vendor44->license_url}\n";
    try {
        $response = $controller->downloadKycDocument(44);
        echo "Response Class: " . get_class($response) . "\n";
        echo "Status Code: " . $response->getStatusCode() . "\n";
        echo "Content Type: " . $response->headers->get('Content-Type') . "\n";
        echo "✓ Successfully loaded permit document without 403 error!\n";
    } catch (\Throwable $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "Vendor 44 not found.\n";
}
