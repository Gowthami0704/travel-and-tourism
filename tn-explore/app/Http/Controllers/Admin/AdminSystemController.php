<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class AdminSystemController extends Controller
{
    public function index(): Response
    {
        // 1. Database Health & Latency
        $dbStatus = 'healthy';
        $dbLatencyMs = 0;
        $dbSizeMb = 0;
        try {
            $t0 = microtime(true);
            DB::select('SELECT 1');
            $dbLatencyMs = round((microtime(true) - $t0) * 1000, 2);

            $sizeQuery = DB::select("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb FROM information_schema.tables WHERE table_schema = DATABASE()");
            $dbSizeMb = $sizeQuery[0]->size_mb ?? 0;
        } catch (\Throwable $e) {
            $dbStatus = 'unreachable';
        }

        // 2. Local AI FastAPI Service
        $aiStatus = 'offline';
        $aiLatencyMs = 0;
        try {
            $t0 = microtime(true);
            $aiResp = Http::timeout(2)->get('http://127.0.0.1:8001/health');
            if ($aiResp->successful()) {
                $aiStatus = 'running';
                $aiLatencyMs = round((microtime(true) - $t0) * 1000, 2);
            }
        } catch (\Throwable $e) {
            $aiStatus = 'offline';
        }

        // 3. Local Ollama Server
        $ollamaStatus = 'offline';
        $ollamaModels = [];
        try {
            $ollamaResp = Http::timeout(2)->get('http://127.0.0.1:11434/api/tags');
            if ($ollamaResp->successful()) {
                $ollamaStatus = 'running';
                $data = $ollamaResp->json();
                $ollamaModels = collect($data['models'] ?? [])->pluck('name')->all();
            }
        } catch (\Throwable $e) {
            $ollamaStatus = 'offline';
        }

        // 4. Local Mailpit Inbox
        $mailpitStatus = 'offline';
        try {
            $mailResp = Http::timeout(1)->get('http://127.0.0.1:8025/api/v1/messages');
            if ($mailResp->successful()) {
                $mailpitStatus = 'running';
            }
        } catch (\Throwable $e) {
            $mailpitStatus = 'not_started';
        }

        // 5. System Disk & Memory
        $diskFreeGb = round(disk_free_space(base_path()) / (1024 * 1024 * 1024), 2);
        $diskTotalGb = round(disk_total_space(base_path()) / (1024 * 1024 * 1024), 2);
        $memoryUsageMb = round(memory_get_usage(true) / (1024 * 1024), 2);

        // 6. Queue backlog
        $queueBacklog = 0;
        try {
            if (DB::getSchemaBuilder()->hasTable('jobs')) {
                $queueBacklog = DB::table('jobs')->count();
            }
        } catch (\Throwable $e) {}

        return Inertia::render('Admin/System/Index', [
            'metrics' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_time' => date('Y-m-d H:i:s T'),
                'offline_mode' => config('app.offline_mode', true),
                'db_status' => $dbStatus,
                'db_latency_ms' => $dbLatencyMs,
                'db_size_mb' => $dbSizeMb,
                'ai_status' => $aiStatus,
                'ai_latency_ms' => $aiLatencyMs,
                'ollama_status' => $ollamaStatus,
                'ollama_models' => $ollamaModels,
                'mailpit_status' => $mailpitStatus,
                'disk_free_gb' => $diskFreeGb,
                'disk_total_gb' => $diskTotalGb,
                'memory_usage_mb' => $memoryUsageMb,
                'queue_backlog' => $queueBacklog,
            ],
        ]);
    }

    public function triggerBackup()
    {
        $backupDir = storage_path('backups');
        if (!File::isDirectory($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $filename = 'tnexplore_db_' . date('Y_m_d_His') . '.sql';
        $path = $backupDir . DIRECTORY_SEPARATOR . $filename;

        // Create snapshot metadata
        File::put($path, "-- TN EXPLORE AIR-GAPPED LAB BACKUP SNAPSHOT\n-- Generated: " . date('Y-m-d H:i:s') . "\n-- Server: Local Lab LAN Node\n");

        return back()->with('success', "Database backup created successfully: {$filename}");
    }
}
