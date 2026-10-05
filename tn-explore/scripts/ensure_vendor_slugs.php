<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Vendor;
use Illuminate\Support\Str;

$count = 0;
foreach (Vendor::all() as $v) {
    if (empty($v->slug)) {
        $v->slug = Str::slug($v->business_name) . '-' . $v->id;
        $v->save();
        $count++;
    }
}

echo "Assigned slugs to {$count} vendors. Total: " . Vendor::count() . PHP_EOL;
echo "Sample slug: " . Vendor::first()->slug . PHP_EOL;
