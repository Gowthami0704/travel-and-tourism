<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\District;

$districts = District::pluck('name', 'id')->toArray();
echo json_encode($districts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
