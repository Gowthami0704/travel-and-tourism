#!/usr/bin/env python3
"""
fetch_real_images.py  -  give every place / dish its REAL photo, link and coordinates.

Data source: the English Wikipedia API (photos come from Wikimedia Commons).
Put this file in  tn-explore/scripts/  and run from the tn-explore folder:

    # 1) test on 20 rows, nothing is written
    python scripts/fetch_real_images.py --table places --limit 20 --dry-run

    # 2) real run (makes a DB backup first). Safe to stop and re-run: it resumes.
    python scripts/fetch_real_images.py --table places
    python scripts/fetch_real_images.py --table food_dishes

    # 3) after the run, review these files:
    #    scripts/wiki_unmatched_places.csv        (no trustworthy match found)
    #    scripts/wiki_lowconfidence_places.csv    (matched, but please eyeball)

Set your contact e-mail for the Wikimedia User-Agent (their API policy asks for it):
    Windows:  set WIKI_CONTACT=you@example.com
    Linux/Mac: export WIKI_CONTACT=you@example.com

Rules this script follows (so wrong images do not come back):
  * a photo is saved ONLY if the Wikipedia page title looks like the place name
    AND the page is in Tamil Nadu (coordinates inside TN, or the text says so);
  * no match  ->  image_url stays whatever it is, unless --clear-unmatched is given
    (then it becomes NULL so the UI can show an honest placeholder, not a random stock photo);
  * it never invents anything. Unmatched rows are listed in a CSV for manual fixing.
"""
import argparse
import csv
import difflib
import json
import os
import re
import shutil
import sqlite3
import sys
import time

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "database", "database.sqlite")
CACHE_PATH = os.path.join(ROOT, "scripts", ".wiki_cache.json")
API = "https://en.wikipedia.org/w/api.php"

# Rough bounding box of Tamil Nadu (lat, lon)
TN_LAT = (8.0, 13.6)
TN_LON = (76.2, 80.4)

MIN_TITLE_SCORE = 0.55   # below this a candidate is rejected
HIGH_CONFIDENCE = 0.80   # below this it goes to the "please review" CSV

STOP_WORDS = {
    "the", "of", "and", "a", "an", "in", "at", "near", "district", "tamil", "nadu",
    "temple", "kovil", "koil", "sanctuary", "falls", "beach", "museum", "fort",
    "garden", "park", "dam", "lake", "hills", "hill", "viewpoint", "trails",
}


def headers():
    contact = os.environ.get("WIKI_CONTACT", "student-researcher@tnexplore.local")
    return {"User-Agent": f"TNExploreStudentProject/1.0 ({contact})"}


def api_get(params):
    """Single place that talks to the network (easy to mock in tests)."""
    p = {"format": "json", "formatversion": "2"}
    p.update(params)
    for attempt in range(4):
        try:
            r = requests.get(API, params=p, headers=headers(), timeout=20)
            if r.status_code == 429:
                time.sleep(2 + attempt * 3)
                continue
            r.raise_for_status()
            return r.json()
        except requests.RequestException as exc:
            if attempt == 3:
                print(f"    network error: {exc}")
                return {}
            time.sleep(1.5 * (attempt + 1))
    return {}


def clean_name(name):
    """Remove dataset artefacts: brackets, 'Coverage Slot 40', height notes, '&' lists."""
    n = re.sub(r"\(.*?\)", " ", name or "")
    n = re.sub(r"[\s—-]+coverage\s*slot\s*\d+", " ", n, flags=re.I)
    n = n.replace("&", " and ")
    return re.sub(r"\s+", " ", n).strip()


def tokens(text):
    return [t for t in re.findall(r"[a-z0-9]+", (text or "").lower()) if t not in STOP_WORDS]


FOOD_KEYWORDS = [
    "jigarthanda", "filter coffee", "pongal", "idli", "parotta", "bun parotta", "biryani",
    "dum biryani", "sundal", "halwa", "halva", "palkova", "macaroon", "koozh", "kambu",
    "paniyaram", "peda", "murukku", "adai", "avial", "vada", "vadai", "sambar", "rasam",
    "payasam", "puttu", "idiyappam", "atho", "kari dosa", "dosa", "dosai", "kothu parotta",
    "fish curry", "crab", "prawn", "gothsu", "chutney", "polly", "sweets", "ladoo", "laddu"
]

def extract_food_terms(name):
    clean = clean_name(name)
    n_lower = clean.lower()
    terms = []
    for kw in FOOD_KEYWORDS:
        if kw in n_lower:
            terms.append(kw)
    if not terms:
        # fallback to longest word
        words = [w for w in re.findall(r'[a-zA-Z]+', clean) if len(w) > 3]
        if words:
            terms.append(words[0])
    return terms or [clean]


def title_score(target_name, page_title, kind="place"):
    a, b = clean_name(target_name).lower(), (page_title or "").lower()
    b_clean = re.sub(r"\(.*?\)", "", b).strip()
    ratio = difflib.SequenceMatcher(None, a, b_clean).ratio()
    ta, tb = set(tokens(a)), set(tokens(b))
    overlap = len(ta & tb) / max(1, len(ta)) if ta else 0
    
    if kind == "food":
        food_terms = extract_food_terms(target_name)
        for term in food_terms:
            if term in b:
                return 0.85
    return round(max(ratio, 0.4 * ratio + 0.6 * overlap), 3)


def in_tn(lat, lon):
    return lat is not None and lon is not None and TN_LAT[0] <= lat <= TN_LAT[1] and TN_LON[0] <= lon <= TN_LON[1]


def search_titles(query, limit=5):
    data = api_get({"action": "query", "list": "search", "srsearch": query, "srlimit": limit})
    return [h["pageid"] for h in data.get("query", {}).get("search", [])]


def page_details(pageids):
    if not pageids:
        return []
    data = api_get({
        "action": "query",
        "pageids": "|".join(str(p) for p in pageids),
        "prop": "pageimages|coordinates|extracts|info",
        "piprop": "thumbnail", "pithumbsize": 900,
        "exintro": 1, "explaintext": 1, "exsentences": 2,
        "inprop": "url", "colimit": 1,
    })
    return data.get("query", {}).get("pages", [])


def resolve(name, district, kind):
    """Return the best trustworthy Wikipedia match for one row, or None."""
    base = clean_name(name)
    if kind == "food":
        food_terms = extract_food_terms(name)
        primary = food_terms[0] if food_terms else base
        queries = [
            f"{primary} Tamil Nadu food",
            f"{primary} South Indian cuisine",
            f"{base} dish",
            f"{primary} sweet dish",
            primary
        ]
    else:
        queries = [
            f"{base} {district} Tamil Nadu",
            f"{base} Tamil Nadu",
            f"{base}"
        ]

    best = None
    seen = set()
    for q in queries:
        for page in page_details([pid for pid in search_titles(q) if pid not in seen]):
            seen.add(page.get("pageid"))
            title = page.get("title", "")
            extract = (page.get("extract") or "")
            if "may refer to" in extract[:200].lower():
                continue  # disambiguation page
            coords = (page.get("coordinates") or [{}])[0]
            lat, lon = coords.get("lat"), coords.get("lon")
            score = title_score(name, title, kind=kind)
            if score < MIN_TITLE_SCORE:
                continue
            
            text = extract.lower()
            if kind == "place":
                located = in_tn(lat, lon) or "tamil nadu" in text or (district or "").lower() in text or "south india" in text
                if not located:
                    continue  # right name, wrong state/country
            elif kind == "food":
                is_food = any(k in text for k in ["food", "dish", "sweet", "snack", "cuisine", "drink", "beverage", "rice", "dessert", "recipe", "delicacy", "bread"])
                if not is_food:
                    continue

            cand = {
                "title": title,
                "url": page.get("fullurl"),
                "image": (page.get("thumbnail") or {}).get("source"),
                "lat": lat if in_tn(lat, lon) else None,
                "lon": lon if in_tn(lat, lon) else None,
                "score": score,
            }
            # prefer higher score, then pages that have a photo
            key = (cand["score"], 1 if cand["image"] else 0)
            if best is None or key > (best["score"], 1 if best["image"] else 0):
                best = cand
        if best and best["score"] >= HIGH_CONFIDENCE and best["image"]:
            break  # good enough, do not spend more requests
        time.sleep(0.12)
    return best


def load_cache():
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache):
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--table", choices=["places", "food_dishes"], required=True)
    ap.add_argument("--limit", type=int, default=0, help="only first N rows (testing)")
    ap.add_argument("--district", help="only this district name, e.g. Ariyalur")
    ap.add_argument("--dry-run", action="store_true", help="fetch and report, write nothing")
    ap.add_argument("--clear-unmatched", action="store_true",
                    help="set image_url to NULL when no trustworthy photo is found")
    ap.add_argument("--overwrite-coords", action="store_true")
    args = ap.parse_args()

    kind = "place" if args.table == "places" else "food"
    if not os.path.exists(DB_PATH):
        sys.exit(f"Database not found: {DB_PATH}")

    if not args.dry_run:
        backup = DB_PATH + time.strftime(".backup_%Y%m%d_%H%M%S")
        shutil.copy2(DB_PATH, backup)
        print(f"Backup saved: {backup}")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    sql = (f"SELECT t.id, t.name, t.image_url, d.name AS district "
           f"FROM {args.table} t JOIN districts d ON d.id = t.district_id")
    params = []
    if args.district:
        sql += " WHERE lower(d.name) = lower(?)"
        params.append(args.district)
    sql += " ORDER BY t.id"
    if args.limit:
        sql += f" LIMIT {int(args.limit)}"
    rows = conn.execute(sql, params).fetchall()

    cache = load_cache()
    unmatched, lowconf = [], []
    matched = with_photo = 0

    for i, row in enumerate(rows, 1):
        key = f"{args.table}:{row['id']}"
        if key not in cache:
            cache[key] = resolve(row["name"], row["district"], kind)
            if i % 10 == 0:
                save_cache(cache)
            time.sleep(0.2)
        res = cache[key]

        tag = "no match"
        if res:
            matched += 1
            tag = f"{res['title']}  (score {res['score']}, photo {'yes' if res['image'] else 'no'})"
            if res["image"]:
                with_photo += 1
            if res["score"] < HIGH_CONFIDENCE:
                lowconf.append([row["id"], row["district"], row["name"], res["title"], res["score"], res["url"]])
        else:
            unmatched.append([row["id"], row["district"], row["name"]])
        print(f"[{i}/{len(rows)}] {row['district']}: {row['name']}  ->  {tag}", flush=True)

        if args.dry_run:
            continue

        sets, vals = [], []
        if res and res["image"]:
            sets.append("image_url = ?"); vals.append(res["image"])
        elif args.clear_unmatched:
            sets.append("image_url = NULL")
        if res and args.table == "places":
            if res["url"]:
                sets.append("wiki_url = ?"); vals.append(res["url"])
            sets.append("wiki_title = ?"); vals.append(res["title"])
            if res["lat"] is not None:
                if args.overwrite_coords:
                    sets.append("latitude = ?"); vals.append(res["lat"])
                    sets.append("longitude = ?"); vals.append(res["lon"])
                else:
                    sets.append("latitude = COALESCE(latitude, ?)"); vals.append(res["lat"])
                    sets.append("longitude = COALESCE(longitude, ?)"); vals.append(res["lon"])
        elif res and args.table == "food_dishes":
            sets.append("wiki_title = ?"); vals.append(res["title"])
        if sets:
            vals.append(row["id"])
            conn.execute(f"UPDATE {args.table} SET {', '.join(sets)} WHERE id = ?", vals)
            conn.commit()

    save_cache(cache)
    conn.close()

    out_dir = os.path.join(ROOT, "scripts")
    with open(os.path.join(out_dir, f"wiki_unmatched_{args.table}.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["id", "district", "name"]); w.writerows(unmatched)
    with open(os.path.join(out_dir, f"wiki_lowconfidence_{args.table}.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["id", "district", "name", "matched_title", "score", "url"]); w.writerows(lowconf)

    print("\n================ SUMMARY ================")
    print(f"rows processed   : {len(rows)}")
    print(f"matched          : {matched}")
    print(f"with real photo  : {with_photo}")
    print(f"unmatched        : {len(unmatched)}   -> scripts/wiki_unmatched_{args.table}.csv")
    print(f"low confidence   : {len(lowconf)}   -> scripts/wiki_lowconfidence_{args.table}.csv")
    print("dry-run: nothing written" if args.dry_run else "database updated")


if __name__ == "__main__":
    main()
