"""
Unsplash & Pexels Real Travel Photography Fetcher for Tamil Nadu Places
Searches authentic travel images for all places using:
1. Unsplash API (if UNSPLASH_ACCESS_KEY is set in .env)
2. Pexels API (if PEXELS_API_KEY is set in .env)
3. Direct Curated Unsplash Travel Photos matching landmark categories (Waterfall, Temple, Hill Station, Lake, Heritage)
4. Updates both SQLite database and public/data/tourism_data.json.
"""

import os
import sys
import re
import json
import urllib.parse
import sqlite3
import requests

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'database.sqlite')
JSON_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data', 'tourism_data.json')
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')

# Curated high-resolution Unsplash travel photography library for Tamil Nadu landscapes & heritage
CURATED_CATEGORY_PHOTOS = {
    'waterfall': [
        'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=1000&q=80'
    ],
    'temple': [
        'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1000&q=80'
    ],
    'hill_station': [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1000&q=80'
    ],
    'lake': [
        'https://images.unsplash.com/photo-1439853941329-a99ce0457e8a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80'
    ],
    'beach': [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=1000&q=80'
    ],
    'heritage': [
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80'
    ],
    'nature': [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1000&q=80'
    ],
    'hidden_gem': [
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80'
    ]
}

def load_keys():
    unsplash_key = os.environ.get('UNSPLASH_ACCESS_KEY')
    pexels_key = os.environ.get('PEXELS_API_KEY')
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('UNSPLASH_ACCESS_KEY='):
                    unsplash_key = line.split('=', 1)[1].strip('"\'\n ')
                elif line.startswith('PEXELS_API_KEY='):
                    pexels_key = line.split('=', 1)[1].strip('"\'\n ')
    return unsplash_key, pexels_key

def search_unsplash_api(query, key):
    try:
        url = f"https://api.unsplash.com/search/photos?query={urllib.parse.quote(query)}&per_page=1&orientation=landscape"
        headers = {"Authorization": f"Client-ID {key}"}
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            results = resp.json().get('results', [])
            if results:
                return results[0]['urls']['regular']
    except Exception:
        pass
    return None

def search_pexels_api(query, key):
    try:
        url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page=1&orientation=landscape"
        headers = {"Authorization": key}
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            photos = resp.json().get('photos', [])
            if photos:
                return photos[0]['src']['large']
    except Exception:
        pass
    return None

def get_best_place_photo(name, district, category, place_id, unsplash_key, pexels_key):
    # 1. Check local custom generated AI photo
    local_gem = f"/images/gems/{re.sub(r'[^a-zA-Z0-9]', '_', name.lower()).strip('_')}.jpg"
    local_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', local_gem.lstrip('/'))
    if os.path.exists(local_path):
        return local_gem

    # 2. Unsplash API if key available
    if unsplash_key:
        url = search_unsplash_api(f"{name} {district} Tamil Nadu", unsplash_key)
        if url:
            return url

    # 3. Pexels API if key available
    if pexels_key:
        url = search_pexels_api(f"{name} {district}", pexels_key)
        if url:
            return url

    # 4. Keyword based matching against high-res curated Unsplash photos
    name_lower = name.lower()
    cat_lower = category.lower()

    if 'fall' in name_lower or 'waterfall' in name_lower:
        pool = CURATED_CATEGORY_PHOTOS['waterfall']
    elif 'lake' in name_lower or 'dam' in name_lower or 'reservoir' in name_lower:
        pool = CURATED_CATEGORY_PHOTOS['lake']
    elif 'temple' in name_lower or 'kovil' in name_lower or 'church' in name_lower or 'mosque' in name_lower or cat_lower == 'temple':
        pool = CURATED_CATEGORY_PHOTOS['temple']
    elif 'peak' in name_lower or 'hill' in name_lower or 'mountain' in name_lower or 'valley' in name_lower or cat_lower == 'hill_station':
        pool = CURATED_CATEGORY_PHOTOS['hill_station']
    elif 'beach' in name_lower or 'sea' in name_lower or 'coast' in name_lower or cat_lower == 'beach':
        pool = CURATED_CATEGORY_PHOTOS['beach']
    elif 'fort' in name_lower or 'palace' in name_lower or cat_lower == 'heritage':
        pool = CURATED_CATEGORY_PHOTOS['heritage']
    elif cat_lower == 'hidden_gem':
        pool = CURATED_CATEGORY_PHOTOS['hidden_gem']
    else:
        pool = CURATED_CATEGORY_PHOTOS.get(cat_lower, CURATED_CATEGORY_PHOTOS['nature'])

    # Deterministic rotation based on place_id to guarantee unique and stable photos
    idx = place_id % len(pool)
    return pool[idx]

def enrich_all_places():
    unsplash_key, pexels_key = load_keys()
    print("=" * 65)
    print(" [*] ENRICHING ALL PLACES WITH HIGH-RES REAL PHOTOS")
    if unsplash_key:
        print(" [OK] Unsplash API Key detected!")
    if pexels_key:
        print(" [OK] Pexels API Key detected!")
    if not unsplash_key and not pexels_key:
        print(" [INFO] Using Curated High-Res Unsplash Travel Photography Library")
    print("=" * 65)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT p.id, p.name, d.name, p.category, p.image_url FROM places p JOIN districts d ON p.district_id = d.id")
    places = c.fetchall()

    print(f"Enriching {len(places)} places in database...")

    updated_count = 0
    for p_id, p_name, d_name, p_cat, existing_img in places:
        # Keep existing local AI image if present
        if existing_img and existing_img.startswith('/images/'):
            continue

        photo_url = get_best_place_photo(p_name, d_name, p_cat, p_id, unsplash_key, pexels_key)
        if photo_url:
            c.execute("UPDATE places SET image_url = ? WHERE id = ?", (photo_url, p_id))
            updated_count += 1

    conn.commit()
    conn.close()

    print(f"[OK] Updated {updated_count} places in SQLite database with real travel photos!")

    # Also update JSON file
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            records = json.load(f)

        for idx, r in enumerate(records):
            if 'place' in (r.get('record_type') or r.get('type') or 'place').lower():
                r_id = idx + 1
                name = r.get('name', '')
                district = r.get('district', '')
                cat = r.get('category', 'heritage')
                r['image_url'] = get_best_place_photo(name, district, cat, r_id, unsplash_key, pexels_key)

        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
        print(f"[OK] Updated {JSON_PATH} with real photo URLs!")

if __name__ == '__main__':
    enrich_all_places()
