<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\District;

$sourceDir = 'C:\\Users\\princ\\Downloads\\TN_Smart_Tourism_Project\\photos';
$destDir = __DIR__ . '/../public/images/districts';

if (!is_dir($destDir)) {
    mkdir($destDir, 0755, true);
    echo "Created directory: {$destDir}\n";
}

$files = scandir($sourceDir);
$filesMap = [];
foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    $info = pathinfo($file);
    $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $info['filename']));
    $filesMap[$cleanName] = $file;
}

echo "Found " . count($filesMap) . " files in source directory.\n";

// District name normalization aliases
$aliases = [
    'nilgiris' => ['thenilgiris', 'nilgiris'],
    'kanyakumari' => ['kanniyakumari', 'kanyakumari'],
    'tirupathur' => ['tirupattur', 'tirupathur'],
    'viluppuram' => ['viluppuram', 'villupuram'],
    'tiruvallur' => ['tiruvallur', 'thiruvallur'],
    'tiruvannamalai' => ['tiruvannamalai', 'thiruvannamalai'],
    'tiruvarur' => ['tiruvarur', 'thiruvarur'],
    'tiruchirappalli' => ['tiruchirappalli', 'trichy'],
    'thoothukudi' => ['thoothukudi', 'tuticorin'],
];

$districts = District::all();
$updated = 0;

foreach ($districts as $d) {
    $dClean = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $d->name));
    $matchedFile = null;

    // Check direct match
    if (isset($filesMap[$dClean])) {
        $matchedFile = $filesMap[$dClean];
    } else {
        // Check aliases
        if (isset($aliases[$dClean])) {
            foreach ($aliases[$dClean] as $alias) {
                if (isset($filesMap[$alias])) {
                    $matchedFile = $filesMap[$alias];
                    break;
                }
            }
        }
    }

    if ($matchedFile) {
        $srcPath = $sourceDir . DIRECTORY_SEPARATOR . $matchedFile;
        // Standardize destination filename
        $ext = pathinfo($matchedFile, PATHINFO_EXTENSION);
        $destFileName = strtolower(str_replace(' ', '_', $d->name)) . '.' . $ext;
        $destPath = $destDir . DIRECTORY_SEPARATOR . $destFileName;

        if (copy($srcPath, $destPath)) {
            $webUrl = '/images/districts/' . $destFileName;
            $d->hero_image_url = $webUrl;
            $d->save();
            echo "✓ [District #{$d->id}] {$d->name} -> {$webUrl}\n";
            $updated++;
        } else {
            echo "✗ Failed to copy {$srcPath} to {$destPath}\n";
        }
    } else {
        echo "⚠ No matching file for {$d->name} (clean: {$dClean})\n";
    }
}

echo "\n Successfully updated {$updated} / " . $districts->count() . " districts!\n";
