<?php

namespace App\Console\Commands;

use App\Models\District;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class FetchDistricts extends Command
{
    protected $signature = 'fetch:districts';
    protected $description = 'Fetch district summaries and hero images from Wikipedia';

    public function handle(): int
    {
        $csvPath = storage_path('app/districts.csv');
        if (!file_exists($csvPath)) {
            $this->error("districts.csv not found at: {$csvPath}");
            return Command::FAILURE;
        }

        $lines = array_filter(file($csvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
        $header = str_getcsv(array_shift($lines));

        $this->info("Fetching data for " . count($lines) . " districts from Wikipedia...");

        $count = 0;
        $total = count($lines);

        foreach ($lines as $line) {
            $count++;
            $row = array_combine($header, str_getcsv($line));
            $name = trim($row['name'] ?? '');
            $wikiTitle = trim($row['wiki_title'] ?? "{$name}_district");
            $region = trim($row['region'] ?? 'Central');
            $bestSeason = trim($row['best_season'] ?? 'Oct - Mar');

            if (empty($name)) {
                continue;
            }

            $imageUrl = null;
            $description = null;

            try {
                $response = Http::withHeaders(['User-Agent' => 'TN-Explore/1.0 (Smart Tourism; contact@tnexplore.gov.in)'])
                    ->timeout(10)
                    ->get("https://en.wikipedia.org/api/rest_v1/page/summary/{$wikiTitle}");

                if ($response->successful()) {
                    $data = $response->json();
                    $rawImage = $data['thumbnail']['source'] ?? ($data['originalimage']['source'] ?? null);
                    if ($rawImage) {
                        $imageUrl = preg_replace('/\/\d+px-/', '/1200px-', $rawImage);
                    }
                    $description = $data['extract'] ?? null;
                }
            } catch (\Exception $e) {
                // Ignore failure and keep fallback
            }

            if (!$description) {
                $description = "{$name} is a renowned district in Tamil Nadu celebrated for its cultural legacy, natural landscapes, and heritage attractions in the {$region} region.";
            }

            District::updateOrCreate(
                ['name' => $name],
                [
                    'wiki_title' => $wikiTitle,
                    'hero_image_url' => $imageUrl,
                    'description' => $description,
                    'region' => $region,
                    'best_season' => $bestSeason,
                ]
            );

            $status = $imageUrl ? '✅ image fetched' : '⚠️ default image';
            $this->line("[{$count}/{$total}] {$name} → {$status}");
            usleep(200000); // 200ms
        }

        $this->info("Successfully processed {$total} districts.");
        return Command::SUCCESS;
    }
}
