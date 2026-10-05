<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = \App\Models\User::with('vendor')->get();
foreach ($users as $u) {
    $vendorInfo = $u->vendor ? "YES (Vendor ID: {$u->vendor->id}, Business: '{$u->vendor->business_name}', Status: {$u->vendor->status}, KYC: {$u->vendor->kyc_status})" : "NO";
    echo "ID: {$u->id} | Email: {$u->email} | Role: {$u->role} | Vendor Record: {$vendorInfo}\n";
}
