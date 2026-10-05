<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Place;
use App\Models\DistanceMatrix;

class PrecomputeDistancesCommand extends Command
{
    protected $signature = 'planner:precompute-distances';
    protected $description = 'Precompute offline distance and driving time matrix between all stored places without external API calls';

    public function handle(): int
    {
        $this->info('Precomputing offline distance matrix from stored coordinates...');

        $places = Place::whereNotNull('latitude')->whereNotNull('longitude')->get();
        $totalPlaces = $places->count();

        if ($totalPlaces < 2) {
            $this->warn('Not enough places with coordinates found.');
            return 0;
        }

        $count = 0;
        $bar = $this->output->createProgressBar(($totalPlaces * ($totalPlaces - 1)) / 2);
        $bar->start();

        foreach ($places as $i => $from) {
            foreach ($places as $j => $to) {
                if ($i >= $j) continue;

                $distanceKm = $this->calculateHaversine(
                    $from->latitude, $from->longitude,
                    $to->latitude, $to->longitude,
                    $from->category === 'hill_station' || $to->category === 'hill_station'
                );

                // Avg speed 45 km/h for regular, 30 km/h for hill stations
                $avgSpeed = ($from->category === 'hill_station' || $to->category === 'hill_station') ? 30 : 45;
                $minutes = (int)max(15, round(($distanceKm / $avgSpeed) * 60));

                DistanceMatrix::updateOrCreate(
                    ['from_place_id' => $from->id, 'to_place_id' => $to->id],
                    ['km' => $distanceKm, 'minutes' => $minutes]
                );

                DistanceMatrix::updateOrCreate(
                    ['from_place_id' => $to->id, 'to_place_id' => $from->id],
                    ['km' => $distanceKm, 'minutes' => $minutes]
                );

                $count++;
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully precomputed {$count} place-pair distances in local distance_matrix table.");

        return 0;
    }

    private function calculateHaversine(float $lat1, float $lon1, float $lat2, float $lon2, bool $isHilly = false): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $straightLineKm = $earthRadius * $c;

        // Road winding multiplier: 1.25 for highway/plains, 1.45 for winding ghat roads
        $windingFactor = $isHilly ? 1.45 : 1.25;
        return round($straightLineKm * $windingFactor, 1);
    }
}
