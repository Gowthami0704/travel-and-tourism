<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FetchAll extends Command
{
    protected $signature = 'fetch:all';
    protected $description = 'Populate all Tamil Nadu districts, places, and foods from Wikipedia';

    public function handle(): int
    {
        $this->info("=============================================================");
        $this->info("🚀 TN EXPLORE — COMPREHENSIVE AUTO-FETCH DATA POPULATION 🚀");
        $this->info("=============================================================");

        $this->line("");
        $this->info("STEP 1/3: Fetching 38 Districts...");
        $this->call('fetch:districts');

        $this->line("");
        $this->info("STEP 2/3: Fetching Places & Hidden Gems...");
        $this->call('fetch:places');

        $this->line("");
        $this->info("STEP 3/3: Fetching Regional Food Dishes...");
        $this->call('fetch:foods');

        $this->line("");
        $this->info("=============================================================");
        $this->info("✨ ALL TAMIL NADU DATA SUCCESSFULLY POPULATED! ✨");
        $this->info("=============================================================");

        return Command::SUCCESS;
    }
}
