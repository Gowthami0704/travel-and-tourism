<?php

namespace App\Console\Commands;

use App\Models\District;
use App\Models\Place;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class FetchPlaces extends Command
{
    protected $signature = 'fetch:places';
    protected $description = 'Fetch tourist places & hidden gems from Wikipedia';

    public function handle(): int
    {
        $csvPath = storage_path('app/places.csv');
        if (!file_exists($csvPath)) {
            $this->error("places.csv not found at: {$csvPath}");
            return Command::FAILURE;
        }

        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            $this->error("Could not open places.csv");
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
        $this->info("Fetching data for {$total} places from Wikipedia...");

        $count = 0;
        $districtsCache = District::all()->keyBy('name');

        foreach ($rows as $row) {
            $count++;
            $districtName = trim($row['district'] ?? '');
            $placeName = trim($row['place_name'] ?? '');
            $wikiTitle = trim($row['wiki_title'] ?? $placeName);
            $category = trim($row['category'] ?? 'heritage');
            $isHiddenGem = (bool) ($row['is_hidden_gem'] ?? 0);

            if (empty($placeName) || empty($districtName)) {
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
            $wikiUrl = "https://en.wikipedia.org/wiki/{$wikiTitle}";
            $lat = null;
            $lng = null;

            try {
                $response = Http::withHeaders(['User-Agent' => 'TN-Explore/1.0 (Smart Tourism; contact@tnexplore.gov.in)'])
                    ->timeout(8)
                    ->get("https://en.wikipedia.org/api/rest_v1/page/summary/{$wikiTitle}");

                if ($response->successful()) {
                    $data = $response->json();
                    $rawImage = $data['thumbnail']['source'] ?? ($data['originalimage']['source'] ?? null);
                    if ($rawImage) {
                        $imageUrl = preg_replace('/\/\d+px-/', '/1000px-', $rawImage);
                    }
                    $description = $data['extract'] ?? null;
                    if (isset($data['coordinates']['lat']) && isset($data['coordinates']['lon'])) {
                        $lat = $data['coordinates']['lat'];
                        $lng = $data['coordinates']['lon'];
                    }
                }
            } catch (\Exception $e) {
                // Ignore failure
            }

            if (!$description) {
                $description = "{$placeName} is a prominent {$category} attraction in {$districtName}, Tamil Nadu.";
            }

            Place::updateOrCreate(
                [
                    'district_id' => $district->id,
                    'name' => $placeName,
                ],
                [
                    'wiki_title' => $wikiTitle,
                    'category' => in_array($category, ['temple', 'beach', 'heritage', 'hill_station', 'park', 'nature', 'museum', 'food', 'hidden_gem']) ? $category : 'heritage',
                    'description' => $description,
                    'image_url' => $imageUrl,
                    'wiki_url' => $wikiUrl,
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'is_hidden_gem' => $isHiddenGem,
                ]
            );

            $badge = $isHiddenGem ? '💎 [Hidden Gem]' : '🏛️';
            $status = $imageUrl ? '✅ image fetched' : '⚠️ default image';
            $this->line("[{$count}/{$total}] {$badge} {$placeName} ({$districtName}) → {$status}");
            usleep(100000); // 100ms
        }

        $this->info("Successfully processed {$total} places.");
        return Command::SUCCESS;
    }
}
