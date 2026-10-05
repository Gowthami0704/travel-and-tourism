<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Place;

$places = Place::where('district_id', 1)->get(['id', 'name', 'category', 'image_url']);
foreach ($places as $p) {
    echo "ID: {$p->id} | Name: {$p->name} | Cat: {$p->category} | Img: {$p->image_url}\n";
}
