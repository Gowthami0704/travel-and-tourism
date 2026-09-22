<?php

namespace App\Console\Commands;

use App\Models\District;
use App\Models\FoodDish;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class FetchFoods extends Command
{
    protected $signature = 'fetch:foods';
    protected $description = 'Fetch regional food dishes and images from Wikipedia';

    public function handle(): int
    {
        $csvPath = storage_path('app/foods.csv');
        if (!file_exists($csvPath)) {
            $this->error("foods.csv not found at: {$csvPath}");
            return Command::FAILURE;
        }

        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            $this->error("Could not open foods.csv");
            return Command::FAILURE;
        }

        $header = fgetcsv($handle);
        $rows = [];
        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) === count($header)) {
                $rows[] = array_combine($header, $data);
            }
        }
        fclose($handle);

        $total = count($rows);
        $this->info("Fetching data for {$total} food dishes from Wikipedia...");

        $count = 0;
        $districtsCache = District::all()->keyBy('name');

        foreach ($rows as $row) {
            $count++;
            $districtName = trim($row['district'] ?? '');
            $dishName = trim($row['dish_name'] ?? '');
            $wikiTitle = trim($row['wiki_title'] ?? $dishName);
            $whereToTry = trim($row['where_to_try'] ?? 'Local authentic eateries & traditional messes');

            if (empty($dishName) || empty($districtName)) {
                continue;
            }

            $district = $districtsCache->get($districtName);
            if (!$district) {
                $district = District::firstOrCreate(
                    ['name' => $districtName],
                    ['wiki_title' => "{$districtName}_district", 'region' => 'Central', 'best_season' => 'Oct - Mar']
                );
                $districtsCache->put($districtName, $district);
            }

            $imageUrl = null;
            $description = null;

            try {
                $response = Http::withHeaders(['User-Agent' => 'TN-Explore/1.0 (Smart Tourism; contact@tnexplore.gov.in)'])
                    ->timeout(8)
                    ->get("https://en.wikipedia.org/api/rest_v1/page/summary/{$wikiTitle}");

                if ($response->successful()) {
                    $data = $response->json();
                    $rawImage = $data['thumbnail']['source'] ?? ($data['originalimage']['source'] ?? null);
                    if ($rawImage) {
                        $imageUrl = preg_replace('/\/\d+px-/', '/800px-', $rawImage);
                    }
                    $description = $data['extract'] ?? null;
                }
            } catch (\Exception $e) {
                // Ignore failure
            }

            if (!$description) {
                $description = "{$dishName} is an iconic culinary delicacy of {$districtName}, celebrated for its authentic flavours and traditional preparation.";
            }

            FoodDish::updateOrCreate(
                [
                    'district_id' => $district->id,
                    'name' => $dishName,
                ],
                [
                    'wiki_title' => $wikiTitle,
                    'description' => $description,
                    'image_url' => $imageUrl,
                    'where_to_try' => $whereToTry,
                ]
            );

            $status = $imageUrl ? '✅ image fetched' : '⚠️ default image';
            $this->line("[{$count}/{$total}] 🍲 {$dishName} ({$districtName}) → {$status}");
            usleep(100000); // 100ms
        }

        $this->info("Successfully processed {$total} food dishes.");
        return Command::SUCCESS;
    }
}
