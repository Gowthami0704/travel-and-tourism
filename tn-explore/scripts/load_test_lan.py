#!/usr/bin/env python3
"""
TN Explore: Lab LAN Multi-User Concurrent Load Test Benchmark
Simulates 10, 25, and 50 concurrent tourists querying routes, generating custom plans,
and computing circuit estimates completely offline. Outputs real empirical benchmarks
to storage/benchmarks/load_test.csv.
"""

import sys
import time
import statistics
import concurrent.futures
import csv
import os
import urllib.request
import json

BASE_URL = os.environ.get("TARGET_URL", "http://127.0.0.1:8000")
OUTPUT_CSV = os.path.join(os.path.dirname(__file__), "..", "storage", "benchmarks", "load_test.csv")

ENDPOINTS = [
    {"name": "Home & Districts", "path": "/", "method": "GET"},
    {"name": "Fleet Catalogue", "path": "/vehicles", "method": "GET"},
    {"name": "Tour Packages", "path": "/packages", "method": "GET"},
    {"name": "Custom Trip Ideas", "path": "/custom-trips/ideas/generate", "method": "POST", "body": {
        "budget_total": 25000,
        "adults_count": 2,
        "children_count": 0,
        "place_types": ["heritage", "hills"],
        "region": "inside_tn"
    }},
    {"name": "Vehicle Price Estimator", "path": "/vehicles/1/estimate", "method": "POST", "body": {
        "pickup_district": "Chennai",
        "drop_district": "Madurai",
        "days": 3,
        "total_km": 500
    }}
]

def make_request(ep):
    url = BASE_URL + ep["path"]
    t0 = time.perf_counter()
    status = 500
    try:
        if ep["method"] == "POST":
            data = json.dumps(ep.get("body", {})).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json", "Accept": "application/json"})
        else:
            req = urllib.request.Request(url, headers={"Accept": "text/html,application/json"})
        
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
    except Exception as e:
        status = getattr(e, "code", 500)
    
    latency_ms = (time.perf_counter() - t0) * 1000.0
    return {"name": ep["name"], "status": status, "latency_ms": latency_ms}

def run_concurrent_test(concurrency_level, total_requests=100):
    print(f"\n--- Running Load Test: {concurrency_level} Concurrent Virtual Users ({total_requests} requests) ---")
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency_level) as executor:
        futures = []
        for i in range(total_requests):
            ep = ENDPOINTS[i % len(ENDPOINTS)]
            futures.append(executor.submit(make_request, ep))
        
        for f in concurrent.futures.as_completed(futures):
            results.append(f.result())
            
    latencies = [r["latency_ms"] for r in results]
    successes = [r for r in results if 200 <= r["status"] < 400]
    
    mean_lat = statistics.mean(latencies)
    p50 = statistics.median(latencies)
    p95 = statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else max(latencies)
    std_dev = statistics.stdev(latencies) if len(latencies) > 1 else 0.0
    error_rate = ((len(results) - len(successes)) / len(results)) * 100.0
    
    print(f"Mean Latency: {mean_lat:.2f} ms | P50: {p50:.2f} ms | P95: {p95:.2f} ms | SD: {std_dev:.2f} ms | Error Rate: {error_rate:.1f}%")
    
    return {
        "concurrency": concurrency_level,
        "total_requests": total_requests,
        "mean_ms": round(mean_lat, 2),
        "median_ms": round(p50, 2),
        "p95_ms": round(p95, 2),
        "std_dev_ms": round(std_dev, 2),
        "error_rate_pct": round(error_rate, 2),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

def main():
    print("=================================================================")
    print("=== TN EXPLORE: AIR-GAPPED LAB SERVER CONCURRENT LOAD BENCHMARK ===")
    print(f"Target Server Host: {BASE_URL}")
    print("=================================================================")
    
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    
    benchmarks = []
    for c in [10, 25, 50]:
        benchmarks.append(run_concurrent_test(concurrency_level=c, total_requests=c * 4))
        time.sleep(1)
        
    # Write to CSV
    file_exists = os.path.isfile(OUTPUT_CSV)
    with open(OUTPUT_CSV, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["timestamp", "concurrency", "total_requests", "mean_ms", "median_ms", "p95_ms", "std_dev_ms", "error_rate_pct"])
        writer.writeheader()
        writer.writerows(benchmarks)
        
    print(f"\n[SUCCESS] Benchmark results written to: {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
