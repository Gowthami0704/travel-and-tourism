<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Place;
use App\Models\District;

$madurai = District::where('name', 'like', '%Madurai%')->orWhere('id', 14)->first();
echo "District: " . ($madurai ? $madurai->name . " (ID: " . $madurai->id . ")" : "Not found") . PHP_EOL;

if ($madurai) {
    $places = Place::where('district_id', $madurai->id)->get();
    foreach ($places as $p) {
        echo sprintf("ID: %-4d | Name: %-30s | Area: %-15s | Best: %-10s | Img: %-40s | Desc: %s\n",
            $p->id,
            substr($p->name, 0, 30),
            $p->area ?? 'null',
            $p->best_time ?? 'null',
            substr($p->image_url ?? 'null', 0, 40),
            substr($p->description ?? 'null', 0, 60)
        );
    }
}
