<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\District;

$districts = District::all();
foreach ($districts as $d) {
    $desc = $d->description;
    $changed = false;

    if (strpos($desc, 'Chenglpattu') !== false) {
        $desc = str_replace('Chenglpattu', 'Chengalpattu', $desc);
        $changed = true;
    }

    // Missing full stop before "It is surrounded"
    if (preg_match('/([a-zA-Z0-9])\s+(It is surrounded)/', $desc)) {
        $desc = preg_replace('/([a-zA-Z0-9])\s+(It is surrounded)/', '$1. $2', $desc);
        $changed = true;
    }

    if ($changed) {
        $d->description = $desc;
        $d->save();
        echo "Updated District #{$d->id} ({$d->name}): {$desc}\n";
    }
}

echo "District typo check complete.\n";
