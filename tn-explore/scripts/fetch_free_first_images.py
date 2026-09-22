"""
Tamil Nadu Tourism - Free First Cascading Image Fetcher
Implements 100% free multi-tiered image sourcing pipeline:
  Step 1: Wikimedia Commons Geolocation Search (500m - 5000m radius) + Nominatim/Wikidata coordinate discovery
  Step 2: Wikivoyage & Wikipedia Travel PageImages Search
  Step 3: Google Custom Search API (100 free daily quota, Creative Commons / Public Domain only)
  Step 4: Leonardo AI / AI Image Generator Fallback (Prompt-based for Hidden Gems)
  Step 5: Clean Frontend Fallback (sets image_url = null for CSS gradient cards)
"""

import os
import re
import sys
import time
import json
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from dotenv import load_dotenv

# Set utf-8 stdout encoding for Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load environment variables for optional API keys
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

GOOGLE_API_KEY = os.getenv('GOOGLE_CUSTOM_SEARCH_KEY') or os.getenv('GOOGLE_SEARCH_API_KEY') or os.getenv('GOOGLE_API_KEY')
GOOGLE_CX = os.getenv('GOOGLE_CUSTOM_SEARCH_CX') or os.getenv('GOOGLE_SEARCH_CX')
LEONARDO_API_KEY = os.getenv('LEONARDO_API_KEY')

JSON_PATHS = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data', 'tourism_data.json'),
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'tourism_data.json'),
    os.path.join(os.getcwd(), 'public', 'data', 'tourism_data.json'),
    os.path.join(os.getcwd(), 'data', 'tourism_data.json')
]

session = requests.Session()
session.headers.update({
    'User-Agent': 'TNTourismSmartBot/4.0 (educational_travel_research@tnexplore.org; mailto:contact@tnexplore.org)'
})

# Cache for geocoded coordinates to avoid duplicate calls
GEO_CACHE = {}
GOOGLE_QUOTA_USED = 0
GOOGLE_QUOTA_MAX = 100

def get_coordinates(name, district):
    """Attempt free coordinate lookup via OpenStreetMap / Nominatim or Wikipedia coordinates."""
    cache_key = f"{name}_{district}".lower()
    if cache_key in GEO_CACHE:
        return GEO_CACHE[cache_key]

    # 1. Try Wikipedia Coordinates API
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(name)}&prop=coordinates&format=json"
        resp = session.get(url, timeout=3.5)
        if resp.status_code == 200:
            pages = resp.json().get('query', {}).get('pages', {})
            for pid, pdata in pages.items():
                if 'coordinates' in pdata and len(pdata['coordinates']) > 0:
                    c = pdata['coordinates'][0]
                    coords = (c['lat'], c['lon'])
                    GEO_CACHE[cache_key] = coords
                    return coords
    except Exception:
        pass

    # 2. Try Nominatim Geocoding
    try:
        q = f"{name}, {district}, Tamil Nadu, India"
        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(q)}&format=json&limit=1"
        resp = session.get(url, timeout=3.5, headers={'User-Agent': 'TNTourismExplorerBot/4.0'})
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                coords = (lat, lon)
                GEO_CACHE[cache_key] = coords
                return coords
    except Exception:
        pass

    GEO_CACHE[cache_key] = None
    return None

def step1_wikimedia_geosearch(lat, lon, radius=1000):
    """
    Step 1: Wikimedia Commons Geolocation Search
    Searches for files within radius (meters) of the coordinates.
    """
    if not lat or not lon:
        return None, None

    try:
        # Search commons for files near coordinates
        url = (
            f"https://commons.wikimedia.org/w/api.php?"
            f"action=query&generator=geosearch&ggscoord={lat}|{lon}&ggsradius={radius}"
            f"&ggsnamespace=6&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1200&format=json"
        )
        resp = session.get(url, timeout=4.0)
        if resp.status_code == 200:
            pages = resp.json().get('query', {}).get('pages', {})
            for pid, pdata in pages.items():
                title = pdata.get('title', '').lower()
                # Skip svg icons, maps, or sound files
                if any(title.endswith(ext) for ext in ['.svg', '.ogg', '.pdf', '.tif']):
                    continue
                imageinfo = pdata.get('imageinfo', [])
                if imageinfo and 'url' in imageinfo[0]:
                    thumb_url = imageinfo[0].get('thumburl') or imageinfo[0].get('url')
                    license_name = imageinfo[0].get('extmetadata', {}).get('LicenseShortName', {}).get('value', 'CC BY-SA / Wikimedia Commons')
                    return thumb_url, f"Wikimedia Commons Geosearch ({license_name})"
    except Exception:
        pass

    return None, None

def step2_wikivoyage_and_wikipedia(name, district):
    """
    Step 2: Wikivoyage & Wikipedia Travel API Search
    """
    # 2a. Wikivoyage Pageimages Search
    try:
        for query_title in [name, f"{name}, {district}"]:
            url = f"https://en.wikivoyage.org/w/api.php?action=query&prop=pageimages&piprop=original|thumbnail&pithumbsize=1200&titles={urllib.parse.quote(query_title)}&format=json"
            resp = session.get(url, timeout=3.5)
            if resp.status_code == 200:
                pages = resp.json().get('query', {}).get('pages', {})
                for pid, pdata in pages.items():
                    if pid != "-1":
                        if 'original' in pdata and 'source' in pdata['original']:
                            return pdata['original']['source'], "Wikivoyage Original (CC BY-SA)"
                        if 'thumbnail' in pdata and 'source' in pdata['thumbnail']:
                            return pdata['thumbnail']['source'], "Wikivoyage Thumbnail (CC BY-SA)"
    except Exception:
        pass

    # 2b. Wikipedia Summary API
    try:
        for title in [name, f"{name}, {district}"]:
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
            resp = session.get(url, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                if 'originalimage' in data and 'source' in data['originalimage']:
                    return data['originalimage']['source'], "Wikipedia Summary API"
                if 'thumbnail' in data and 'source' in data['thumbnail']:
                    return data['thumbnail']['source'], "Wikipedia Summary Thumbnail"
    except Exception:
        pass

    # 2c. Wikipedia Generator Search API
    try:
        search_query = f"{name} {district} Tamil Nadu"
        url = (
            f"https://en.wikipedia.org/w/api.php?"
            f"action=query&generator=search&gsrsearch={urllib.parse.quote(search_query)}&gsrlimit=1"
            f"&prop=pageimages&piprop=original|thumbnail&pithumbsize=1200&format=json"
        )
        resp = session.get(url, timeout=3.5)
        if resp.status_code == 200:
            pages = resp.json().get('query', {}).get('pages', {})
            for pid, pdata in pages.items():
                title = pdata.get('title', '').lower()
                if title in ['tamil nadu', 'chennai', 'india', 'tourism in tamil nadu']:
                    continue
                if 'original' in pdata and 'source' in pdata['original']:
                    return pdata['original']['source'], f"Wikipedia Search: {pdata.get('title')}"
                if 'thumbnail' in pdata and 'source' in pdata['thumbnail']:
                    return pdata['thumbnail']['source'], f"Wikipedia Search: {pdata.get('title')}"
    except Exception:
        pass

    return None, None

def step3_google_custom_search(name, district):
    """
    Step 3: Google Custom Search API (CC / Free to use photos only, 100 free/day)
    """
    global GOOGLE_QUOTA_USED
    if not GOOGLE_API_KEY or not GOOGLE_CX:
        return None, None

    if GOOGLE_QUOTA_USED >= GOOGLE_QUOTA_MAX:
        return None, None

    try:
        query = f"{name} {district} Tamil Nadu"
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            'key': GOOGLE_API_KEY,
            'cx': GOOGLE_CX,
            'q': query,
            'searchType': 'image',
            'imgType': 'photo',
            'rights': 'cc_publicdomain,cc_attribute',
            'num': 1
        }
        resp = session.get(url, params=params, timeout=4.0)
        GOOGLE_QUOTA_USED += 1
        if resp.status_code == 200:
            items = resp.json().get('items', [])
            if items and 'link' in items[0]:
                return items[0]['link'], "Google Custom Search (Creative Commons)"
    except Exception:
        pass

    return None, None

def step4_leonardo_ai(name, district, description):
    """
    Step 4: Leonardo AI / AI Generation Fallback for rare Hidden Gems
    """
    if not LEONARDO_API_KEY:
        return None, None

    try:
        prompt = f"A realistic, beautiful travel photograph of {name}, located in {district}, Tamil Nadu. {description}. High quality, scenic, no text."
        url = "https://cloud.leonardo.ai/api/rest/v1/generations"
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {LEONARDO_API_KEY}"
        }
        payload = {
            "prompt": prompt,
            "num_images": 1,
            "width": 1024,
            "height": 640
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=5.0)
        if resp.status_code == 200:
            gen_id = resp.json().get('sdGenerationJob', {}).get('generationId')
            if gen_id:
                # Poll once after short delay
                time.sleep(3)
                poll_url = f"https://cloud.leonardo.ai/api/rest/v1/generations/{gen_id}"
                poll_resp = requests.get(poll_url, headers=headers, timeout=5.0)
                if poll_resp.status_code == 200:
                    generated_images = poll_resp.json().get('generations_by_pk', {}).get('generated_images', [])
                    if generated_images and 'url' in generated_images[0]:
                        return generated_images[0]['url'], "Leonardo AI (Generated)"
    except Exception:
        pass

    return None, None

def process_record_free_first(record):
    """
    Executes the 5-step Cascading Pipeline for a tourism record.
    """
    rec_type = (record.get('record_type') or record.get('type') or '').strip().lower()
    name = record.get('name', '').strip()
    district = record.get('district', '').strip()
    description = record.get('description', '').strip()
    lat = record.get('latitude')
    lon = record.get('longitude')

    # Rule: For Food and Hotel records, keep null for dedicated UI rendering
    if any(k in rec_type for k in ['food', 'hotel', 'accommodation', 'restaurant']):
        record['image_url'] = None
        record['image_source'] = None
        return record

    img_url, source = None, None

    # STEP 1: Wikimedia Commons Geolocation Search
    if lat and lon:
        try:
            lat_f, lon_f = float(lat), float(lon)
            img_url, source = step1_wikimedia_geosearch(lat_f, lon_f, radius=1000)
            if not img_url:
                img_url, source = step1_wikimedia_geosearch(lat_f, lon_f, radius=5000)
        except (ValueError, TypeError):
            pass

    # If coordinates were not in record, try quick coordinate discovery
    if not img_url and name:
        coords = get_coordinates(name, district)
        if coords:
            record['latitude'] = coords[0]
            record['longitude'] = coords[1]
            img_url, source = step1_wikimedia_geosearch(coords[0], coords[1], radius=1500)

    # STEP 2: Wikivoyage & Wikipedia Travel API Search
    if not img_url and name:
        img_url, source = step2_wikivoyage_and_wikipedia(name, district)

    # STEP 3: Google Custom Search API (Free tier)
    if not img_url and name and GOOGLE_API_KEY:
        img_url, source = step3_google_custom_search(name, district)

    # STEP 4: Leonardo AI / AI Generation Fallback
    if not img_url and name and LEONARDO_API_KEY:
        img_url, source = step4_leonardo_ai(name, district, description)

    # STEP 5: Frontend Fallback (set to null)
    record['image_url'] = img_url if img_url else None
    record['image_source'] = source if img_url else None

    return record

def run_free_first_pipeline():
    target_json = None
    for p in JSON_PATHS:
        if os.path.exists(p):
            target_json = p
            break

    if not target_json:
        print("tourism_data.json not found! Running Excel converter...")
        from convert_excel_to_json import convert_excel_to_json
        convert_excel_to_json()
        target_json = JSON_PATHS[0]

    print(f"Loading records from: {target_json}")
    with open(target_json, 'r', encoding='utf-8') as f:
        records = json.load(f)

    total = len(records)
    print(f"\n" + "=" * 75)
    print(f" [FREE-FIRST CASCADING IMAGE PIPELINE] Processing {total} records")
    print(" 1. Wikimedia Commons Geosearch (Real landmark photos by lat/lon)")
    print(" 2. Wikivoyage & Wikipedia API (Dedicated travel destination images)")
    print(" 3. Google Custom Search (Creative Commons only, 100/day limit)")
    print(" 4. Leonardo AI (Prompt-based generative fallback for hidden gems)")
    print(" 5. Sleek CSS Gradient UI Placeholder (Zero broken links or cats)")
    print("=" * 75 + "\n")

    stats = {
        'wikimedia_geosearch': 0,
        'wikivoyage_wikipedia': 0,
        'google_custom_search': 0,
        'leonardo_ai': 0,
        'frontend_placeholder_null': 0
    }

    results = [None] * total

    with ThreadPoolExecutor(max_workers=20) as executor:
        future_to_idx = {executor.submit(process_record_free_first, rec): idx for idx, rec in enumerate(records)}
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            try:
                processed = future.result()
                results[idx] = processed
                src = processed.get('image_source') or ''
                if 'Geosearch' in src:
                    stats['wikimedia_geosearch'] += 1
                elif 'Wiki' in src:
                    stats['wikivoyage_wikipedia'] += 1
                elif 'Google' in src:
                    stats['google_custom_search'] += 1
                elif 'Leonardo' in src:
                    stats['leonardo_ai'] += 1
                else:
                    stats['frontend_placeholder_null'] += 1
            except Exception as e:
                records[idx]['image_url'] = None
                records[idx]['image_source'] = None
                results[idx] = records[idx]
                stats['frontend_placeholder_null'] += 1

            done = sum(stats.values())
            if done % 200 == 0 or done == total:
                print(f"Progress: {done}/{total} | Geosearch: {stats['wikimedia_geosearch']} | Wiki/Voyage: {stats['wikivoyage_wikipedia']} | Google: {stats['google_custom_search']} | AI: {stats['leonardo_ai']} | Null: {stats['frontend_placeholder_null']}")

    # Save to all target paths
    for out_path in JSON_PATHS:
        try:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print(f"Saved updated dataset to: {out_path}")
        except Exception as e:
            print(f"Warning: could not write to {out_path}: {e}")

    print("\n" + "=" * 75)
    print(" FREE-FIRST CASCADING IMAGE PIPELINE SUMMARY")
    print("=" * 75)
    print(f" Total Records Processed           : {total}")
    print(f" 1. Wikimedia Commons Geosearch    : {stats['wikimedia_geosearch']} real photos")
    print(f" 2. Wikivoyage & Wikipedia API     : {stats['wikivoyage_wikipedia']} authentic photos")
    print(f" 3. Google Custom Search (CC Only) : {stats['google_custom_search']} photos")
    print(f" 4. Leonardo AI Generated Fallback : {stats['leonardo_ai']} images")
    print(f" 5. Sleek CSS Gradient Placeholder : {stats['frontend_placeholder_null']} items (safe null)")
    print(f" Total Authentic Images Attached   : {total - stats['frontend_placeholder_null']}")
    print("=" * 75)

if __name__ == '__main__':
    run_free_first_pipeline()
