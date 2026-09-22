"""
AI Image Generator for Tamil Nadu Hidden Gems & Tourism Places
Generates realistic, scenic travel photographs using Google Imagen/Gemini or OpenAI DALL-E
and saves them locally to public/images/gems/ with direct JSON & DB synchronization.

Usage:
    python scripts/generate_ai_images.py [--limit 10] [--provider gemini|openai]
"""

import os
import re
import json
import time
import argparse
import requests
import sqlite3

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data')
JSON_PATH = os.path.join(DATA_DIR, 'tourism_data.json')
IMAGES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'images', 'gems')
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'database.sqlite')

os.makedirs(IMAGES_DIR, exist_ok=True)

def sanitize_filename(name):
    clean = re.sub(r'[^a-zA-Z0-9_\-\s]', '', name).strip().lower()
    return re.sub(r'\s+', '_', clean)

def generate_image_gemini(name, district, description, api_key):
    """Generate realistic travel photo using Google Imagen 3 API."""
    prompt = f"A realistic, beautiful travel photograph of {name}, located in {district}, Tamil Nadu. {description}. High quality, scenic, golden hour travel photography, natural lighting, ultra high detail, 4k, no text, no watermark."
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "16:9",
            "outputMimeType": "image/jpeg"
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            import base64
            data = response.json()
            predictions = data.get("predictions", [])
            if predictions and "bytesBase64Encoded" in predictions[0]:
                return base64.b64decode(predictions[0]["bytesBase64Encoded"])
        else:
            print(f"Gemini API Error [{response.status_code}]: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    return None

def generate_image_openai(name, district, description, api_key):
    """Generate realistic travel photo using OpenAI DALL-E 3."""
    prompt = f"A realistic, beautiful travel photograph of {name}, located in {district}, Tamil Nadu. {description}. High quality, scenic, natural lighting, travel photography, no text."
    
    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "model": "dall-e-3",
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
        "quality": "standard"
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            data = response.json()
            image_url = data["data"][0]["url"]
            img_data = requests.get(image_url, timeout=30).content
            return img_data
        else:
            print(f"OpenAI API Error [{response.status_code}]: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    return None

def run_generator(limit=10, provider='auto'):
    # Load API keys from environment or .env file
    gemini_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    openai_key = os.environ.get('OPENAI_API_KEY')

    # Try reading from .env if not found
    env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('GEMINI_API_KEY=') or line.startswith('GOOGLE_API_KEY='):
                    gemini_key = line.split('=', 1)[1].strip('"\'')
                elif line.startswith('OPENAI_API_KEY='):
                    openai_key = line.split('=', 1)[1].strip('"\'')

    if not gemini_key and not openai_key:
        print("=" * 70)
        print(" [!] No AI Image Generation API Key Detected")
        print("=" * 70)
        print("To generate realistic AI images for places missing Wikipedia photos:")
        print(" 1. Add your key to .env:")
        print("      GEMINI_API_KEY=your_google_api_key_here")
        print("      OR")
        print("      OPENAI_API_KEY=your_openai_api_key_here")
        print(" 2. Run this script again: python scripts/generate_ai_images.py --limit 10")
        print("=" * 70)
        print("Note: The frontend UI already displays a sleek, professional CSS placeholder")
        print("with 'VERIFIED HIDDEN GEM' and sparkle badge for all missing cards.")
        return

    if not os.path.exists(JSON_PATH):
        print(f"JSON not found at {JSON_PATH}. Run convert_excel_to_json.py first.")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        records = json.load(f)

    # Find missing Place records
    missing = [
        r for r in records
        if (not r.get('image_url') or r['image_url'].strip() == '')
        and 'place' in (r.get('record_type') or r.get('type') or 'place').lower()
    ]

    print(f"Found {len(missing)} Place records needing photos. Processing up to {limit}...")

    generated_count = 0
    for r in missing[:limit]:
        name = r.get('name', 'Place')
        district = r.get('district', 'Tamil Nadu')
        desc = r.get('description', '')
        filename = f"{sanitize_filename(name)}.jpg"
        filepath = os.path.join(IMAGES_DIR, filename)
        web_path = f"/images/gems/{filename}"

        print(f"\n[Generating] {name} ({district})...")
        img_bytes = None

        if (provider in ['auto', 'gemini']) and gemini_key:
            img_bytes = generate_image_gemini(name, district, desc, gemini_key)
        elif (provider in ['auto', 'openai']) and openai_key:
            img_bytes = generate_image_openai(name, district, desc, openai_key)

        if img_bytes:
            with open(filepath, 'wb') as img_f:
                img_f.write(img_bytes)
            print(f"  -> Saved to {web_path}")

            # Update record
            r['image_url'] = web_path
            generated_count += 1

            # Update SQLite database if place exists
            if os.path.exists(DB_PATH):
                try:
                    conn = sqlite3.connect(DB_PATH)
                    c = conn.cursor()
                    c.execute("UPDATE places SET image_url = ? WHERE name LIKE ?", (web_path, f"%{name}%"))
                    conn.commit()
                    conn.close()
                except Exception as e:
                    print(f"  Warning updating DB: {e}")

            time.sleep(1)
        else:
            print(f"  -> Generation failed or skipped for {name}")

    if generated_count > 0:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
        print(f"\nSuccessfully generated {generated_count} images and updated {JSON_PATH}!")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="AI Image Generator for Tamil Nadu Tourism")
    parser.add_argument('--limit', type=int, default=6, help="Maximum number of images to generate")
    parser.add_argument('--provider', choices=['auto', 'gemini', 'openai'], default='auto', help="AI image provider")
    args = parser.parse_args()

    run_generator(limit=args.limit, provider=args.provider)
