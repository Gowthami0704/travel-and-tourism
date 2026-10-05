<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TripPlannerService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WarmupPlannerCommand extends Command
{
    protected $signature = 'planner:warmup';
    protected $description = 'Warm up the local offline assistant and database query caches';

    public function handle(): int
    {
        $this->info('Warming up offline planner and local assistant...');

        // 1. Warm up SQLite DB caches
        $plannerService = new TripPlannerService();
        $plannerService->generatePlanOptions([
            'scope' => 'inside_tn',
            'start_place' => 'Chennai',
            'end_place' => 'Chennai',
            'destinations' => ['Madurai'],
            'days' => 2,
            'budget_total' => 15000,
            'budget_basis' => 'total',
            'travelers' => ['adults' => 2, 'children' => 0],
        ]);

        // 2. Ping local Ollama instance if available
        $ollamaUrl = config('tourism.ollama_url', 'http://127.0.0.1:11434');
        try {
            $res = Http::timeout(2)->post("{$ollamaUrl}/api/generate", [
                'model' => config('tourism.ollama_model', 'mistral'),
                'prompt' => 'ping',
                'stream' => false,
            ]);
            if ($res->successful()) {
                $this->info('Local Ollama model warmed up successfully.');
            }
        } catch (\Throwable $e) {
            $this->line('Local Ollama standby (template fallback ready).');
        }

        $this->info('Planner warmup complete. Ready for instant offline requests.');
        return 0;
    }
}
