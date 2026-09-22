import os
import re
import urllib.parse
import requests

session = requests.Session()
session.headers.update({
    'User-Agent': 'TNTourismCleaner/1.0 (contact@tnexplore.org)'
})

test_names = [
    ("Ariyalur Government Museum — Coverage Slot 40", "Ariyalur"),
    ("Elakurichi Adaikala Matha Church", "Ariyalur"),
    ("Elakurichi Adaikala Matha Church — Coverage Slot 16", "Ariyalur"),
    ("Gangaikonda Cholapuram", "Ariyalur"),
    ("Karaivetti Bird Sanctuary", "Ariyalur"),
    ("Kallankurichi Kaliyaperumal Temple — Coverage Slot 33", "Ariyalur"),
    ("Brihadisvara Temple", "Thanjavur"),
    ("Meenakshi Amman Temple", "Madurai")
]

for raw, district in test_names:
    clean = re.sub(r'[\s—-]+coverage slot\s*\d+', '', raw, flags=re.IGNORECASE).strip()
    # Search query
    q = f"{clean} {district}"
    url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(q)}&gsrlimit=1&prop=pageimages&piprop=original|thumbnail&pithumbsize=800&format=json"
    
    resp = session.get(url, timeout=4).json()
    pages = resp.get('query', {}).get('pages', {})
    found_title = None
    found_img = None
    for pid, p in pages.items():
        if pid != "-1":
            found_title = p.get('title')
            found_img = p.get('original', {}).get('source') or p.get('thumbnail', {}).get('source')
            
    print(f"RAW: '{raw}'")
    print(f"  -> Cleaned Name : '{clean}'")
    print(f"  -> Wikipedia Match: {found_title}")
    print(f"  -> Exact Image   : {found_img}")
    print("-" * 50)
