"""
Master Deduplication & Precision Image Enrichment Script
1. Deduplicates places in SQLite and tourism_data.json (removes duplicate padding rows).
2. Cleans names to authentic landmark titles.
3. Queries Wikipedia & Wikimedia Commons API with the clean landmark name to fetch exact photos.
4. Stores only UNIQUE, authentic places in database and JSON.
"""

import os
import re
import sys
import json
import sqlite3
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'database.sqlite')
JSON_PATHS = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data', 'tourism_data.json'),
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'tourism_data.json')
]

session = requests.Session()
session.headers.update({
    'User-Agent': 'TNTourismPrecisionBot/2.0 (contact@tnexplore.org)'
})

def clean_place_name(name):
    if not name:
        return ''
    cleaned = re.sub(r'[\s—-]+coverage\s*slot\s*\d+', '', str(name), flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*[-—]\s*slot\s*\d+', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*\(coverage\s*slot\s*\d+\)', '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

def search_wikipedia_photo(name, district):
    """Query Wikipedia search API for exact landmark photo."""
    clean = clean_place_name(name)
    if not clean:
        return None

    queries = [
        f"{clean} {district}",
        clean,
        f"{clean} Tamil Nadu"
    ]

    for q in queries:
        try:
            url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(q)}&gsrlimit=1&prop=pageimages&piprop=original|thumbnail&pithumbsize=1200&format=json"
            resp = session.get(url, timeout=3.5)
            if resp.status_code == 200:
                pages = resp.json().get('query', {}).get('pages', {})
                for pid, pdata in pages.items():
                    title = pdata.get('title', '').lower()
                    if title in ['tamil nadu', 'chennai', 'india', 'tourism in tamil nadu', 'district']:
                        continue
                    img = pdata.get('original', {}).get('source') or pdata.get('thumbnail', {}).get('source')
                    if img and not any(img.lower().endswith(ext) for ext in ['.svg', '.ogg', '.pdf']):
                        return img
        except Exception:
            pass

    return None

def main():
    print("=" * 70)
    print(" [*] DEDUPLICATING AND ENRICHING TAMIL NADU PLACES DATASET")
    print("=" * 70)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Step 1: Read all places and deduplicate by (district_id, clean_name)
    c.execute("""
        SELECT p.id, p.district_id, p.name, p.category, p.description, p.image_url, p.wiki_url, p.is_hidden_gem, d.name as district_name
        FROM places p
        LEFT JOIN districts d ON p.district_id = d.id
        ORDER BY p.id ASC
    """)
    all_rows = c.fetchall()
    print(f"Total raw place rows in database: {len(all_rows)}")

    unique_map = {}
    for r in all_rows:
        pid, did, name, cat, desc, img, wiki_url, is_gem, dist_name = r
        clean_nm = clean_place_name(name)
        key = (did, clean_nm.lower())

        if key not in unique_map:
            unique_map[key] = {
                'id': pid,
                'district_id': did,
                'district_name': dist_name or '',
                'name': clean_nm,
                'category': cat,
                'description': clean_place_name(desc) if desc else '',
                'image_url': img,
                'wiki_url': wiki_url,
                'is_hidden_gem': is_gem
            }
        else:
            # If duplicate has an authentic image, keep the image!
            if not unique_map[key]['image_url'] and img:
                unique_map[key]['image_url'] = img

    unique_places = list(unique_map.values())
    print(f"Unique places after deduplication: {len(unique_places)}")

    # Step 2: Fetch authentic images for unique places missing photos
    print("\n[STEP 2] Searching Wikipedia & Wikimedia for missing landmark photos...")
    missing_photos = [p for p in unique_places if not p['image_url']]
    print(f"Places without image: {len(missing_photos)}")

    found_count = 0
    with ThreadPoolExecutor(max_workers=15) as executor:
        future_to_place = {
            executor.submit(search_wikipedia_photo, p['name'], p['district_name']): p
            for p in missing_photos
        }
        for future in as_completed(future_to_place):
            place = future_to_place[future]
            try:
                img = future.result()
                if img:
                    place['image_url'] = img
                    found_count += 1
            except Exception:
                pass

    print(f"Discovered {found_count} new authentic Wikipedia images!")
    total_with_images = sum(1 for p in unique_places if p['image_url'])
    print(f"Total authentic images attached: {total_with_images} / {len(unique_places)}")

    # Step 3: Rewrite database places table cleanly without duplicates
    print("\n[STEP 3] Rebuilding SQLite database places table...")
    c.execute("DELETE FROM places")
    for p in unique_places:
        c.execute("""
            INSERT INTO places (district_id, name, wiki_title, category, description, image_url, wiki_url, is_hidden_gem, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        """, (
            p['district_id'],
            p['name'],
            p['name'],
            p['category'],
            p['description'],
            p['image_url'],
            p['wiki_url'],
            p['is_hidden_gem']
        ))

    conn.commit()
    conn.close()
    print("Database places table successfully updated!")

    # Step 4: Update tourism_data.json cleanly
    print("\n[STEP 4] Updating tourism_data.json...")
    clean_json_records = []
    for idx, p in enumerate(unique_places, 1):
        clean_json_records.append({
            "id": f"TN-{idx:04d}",
            "district": p['district_name'],
            "name": p['name'],
            "record_type": "Place",
            "type": p['category'],
            "category": "Hidden Gem" if p['is_hidden_gem'] else "Famous",
            "description": p['description'],
            "maps_url": p['wiki_url'] or f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(p['name'] + ' ' + p['district_name'])}",
            "image_url": p['image_url']
        })

    for out_path in JSON_PATHS:
        try:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(clean_json_records, f, indent=2, ensure_ascii=False)
            print(f"Saved {len(clean_json_records)} clean unique records to: {out_path}")
        except Exception as e:
            print(f"Warning writing to {out_path}: {e}")

    print("\n" + "=" * 70)
    print(" DEDUPLICATION & ENRICHMENT COMPLETE")
    print(f" * Unique Clean Places : {len(unique_places)}")
    print(f" * Authentic Photos    : {total_with_images}")
    print("=" * 70)

if __name__ == '__main__':
    main()
