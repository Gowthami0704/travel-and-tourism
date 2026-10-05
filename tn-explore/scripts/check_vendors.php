<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$vendors = \App\Models\Vendor::with('user')->get();
foreach ($vendors as $v) {
    echo "ID: {$v->id} | User: " . ($v->user ? $v->user->email : 'NONE') . " | Status: {$v->status} | KYC: {$v->kyc_status} | Business: {$v->business_name}\n";
}
