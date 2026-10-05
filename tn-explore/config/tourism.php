<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Strict Offline Operation Mode
    |--------------------------------------------------------------------------
    | When set to true, no external network calls (Gemini, Google Maps, DeepSeek,
    | external weather APIs) are allowed at runtime. Everything runs locally
    | using the SQLite DB, precomputed distance matrix, and local Ollama model.
    */
    'offline_mode' => env('OFFLINE_MODE', true),

    /*
    |--------------------------------------------------------------------------
    | Local Offline LLM Configuration (Ollama / Local FastAPI)
    |--------------------------------------------------------------------------
    */
    'ollama_url' => env('OLLAMA_URL', 'http://127.0.0.1:11434'),
    'ollama_model' => env('OLLAMA_MODEL', 'mistral'),
    'llm_timeout_seconds' => env('LLM_TIMEOUT_SECONDS', 8),
    'llm_temperature' => env('LLM_TEMPERATURE', 0.2),

    /*
    |--------------------------------------------------------------------------
    | Feature Flags
    |--------------------------------------------------------------------------
    */
    'enable_offline_voice' => env('ENABLE_OFFLINE_VOICE', false),
    'use_cached_map_tiles' => env('USE_CACHED_MAP_TILES', false),

    /*
    |--------------------------------------------------------------------------
    | Benchmark and Storage Paths
    |--------------------------------------------------------------------------
    */
    'benchmark_dir' => storage_path('benchmarks'),
    'latency_csv' => storage_path('benchmarks/latency.csv'),
    'benchmark_csv' => storage_path('benchmarks/benchmark.csv'),
];
