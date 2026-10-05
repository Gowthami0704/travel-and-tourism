<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\District;
use App\Models\Place;
use Illuminate\Support\Facades\DB;

$districts = District::all();
echo "Total districts: " . $districts->count() . "\n";
echo "Total places: " . Place::count() . "\n\n";

$districtsBelow35 = [];
$districtsWithDupes = [];

foreach ($districts as $d) {
    $places = Place::where('district_id', $d->id)->get();
    $count = $places->count();
    $uniqueNames = $places->pluck('name')->unique()->count();
    $uniqueImages = $places->pluck('image_url')->unique()->count();
    
    printf("%-22s (ID: %2d): %2d places | %2d unique names | %2d unique images\n", $d->name, $d->id, $count, $uniqueNames, $uniqueImages);
    
    if ($count < 35) {
        $districtsBelow35[] = $d->name . " ($count)";
    }
}

echo "\nDistricts with < 35 places: " . count($districtsBelow35) . "\n";
if (!empty($districtsBelow35)) {
    echo implode(', ', $districtsBelow35) . "\n";
}
