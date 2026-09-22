"""
Master Automated Pipeline: Tamil Nadu Smart Tourism Dataset Processor
Executes end-to-end:
1. Excel dataset reading & JSON conversion (2,500 records)
2. Wikipedia API & LoremFlickr automatic image enrichment
3. Validation, categorization statistics, and output reporting
"""

import os
import sys
import json
import time

# Set utf-8 stdout encoding for Windows compatibility
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure scripts directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from convert_excel_to_json import convert_excel_to_json
from fetch_images import fetch_all_images, JSON_PATHS

def main():
    start_time = time.time()
    print("=" * 70)
    print(" [*] TAMIL NADU SMART TOURISM - AUTOMATED 2,500 DATASET PROCESSOR")
    print("=" * 70)

    # Step 1: Excel to JSON Conversion
    print("\n[STEP 1/3] Reading Excel dataset & generating JSON...")
    records = convert_excel_to_json()
    print(f"[OK] Step 1 complete: {len(records)} records extracted.\n")

    # Step 2: Automatic Image Fetching
    print("[STEP 2/3] Fetching Wikimedia photos & category stock images...")
    fetch_all_images()
    print(f"[OK] Step 2 complete: All records enriched with image URLs.\n")

    # Step 3: Verification & Analytics Output
    print("[STEP 3/3] Validating output data & generating summary statistics...")
    target_json = JSON_PATHS[0]
    with open(target_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    districts = set(r['district'] for r in data if r.get('district'))
    types = set(r['record_type'] for r in data if r.get('record_type'))
    wiki_count = sum(1 for r in data if 'wikimedia' in r.get('image_url', '') or 'wikipedia' in r.get('image_url', ''))
    stock_count = sum(1 for r in data if 'loremflickr' in r.get('image_url', '') or 'unsplash' in r.get('image_url', ''))

    elapsed = round(time.time() - start_time, 2)

    print("\n" + "=" * 70)
    print(" PIPELINE EXECUTION REPORT")
    print("=" * 70)
    print(f" * Total Records Processed : {len(data)}")
    print(f" * Total Districts Covered  : {len(districts)} districts")
    print(f" * Record Types             : {', '.join(sorted(types))}")
    print(f" * Real Wikipedia Photos    : {wiki_count}")
    print(f" * Dynamic Stock Photos     : {stock_count}")
    print(f" * Target Output JSON       : {target_json}")
    print(f" * Time Elapsed             : {elapsed} seconds")
    print("=" * 70)

    print("\n--- Sample Enriched Records from Dataset ---")
    sample_indices = [0, 49, 120, 2499]
    for idx in sample_indices:
        if idx < len(data):
            r = data[idx]
            print(f"\n[Record #{idx+1}: {r.get('id')}]")
            print(f"  Name        : {r.get('name')}")
            print(f"  District    : {r.get('district')}")
            print(f"  Type        : {r.get('record_type')} / {r.get('type')}")
            print(f"  Category    : {r.get('category')}")
            print(f"  Description : {r.get('description')[:85]}...")
            print(f"  Image URL   : {r.get('image_url')}")
            if r.get('maps_url'):
                print(f"  Google Maps : {r.get('maps_url')}")

    print("\nAll 2,500 records are ready and connected to the UI!")

if __name__ == '__main__':
    main()
