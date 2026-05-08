import json
import re
import sys

file_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\data\posts.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

posts = data.get('posts', [])

baba_keywords = ['बाबा अमीरानंद', 'शायरी', 'सुविचार', 'quote', 'thought', 'बाबा', 'अमीरानंद']
ahtalks_keywords = ['ahtalks', 'thought of the day', 'quote', 'motivation', 'wisdom', 'thought']

def is_hindi(text):
    hindi_chars = len(re.findall(r'[\u0900-\u097F]', text))
    return hindi_chars > len(text) * 0.2 if len(text) > 0 else False

baba_matches = []
ah_matches = []

for p in posts:
    if p.get('id') in [201, 444, 555]:
        continue
        
    cats = p.get('categories', [])
    if 'Blog' not in cats:
        continue

    content = p.get('content', '') or ''
    title = p.get('title', '') or ''
    
    text_clean = re.sub(r'<[^>]+>', '', content).strip()
    full_text = title + " " + text_clean
    
    # Keyword search
    has_baba_kw = any(kw in full_text.lower() for kw in baba_keywords)
    has_ah_kw = any(kw in full_text.lower() for kw in ahtalks_keywords)
    
    # Length heuristic (quotes are usually short, let's say < 400 chars of actual text)
    is_short = 0 < len(text_clean) < 400
    
    # Image check (often quotes are just an image with a short caption)
    has_image = p.get('hasImage', False)
    
    if is_hindi(full_text):
        if has_baba_kw or (is_short and has_image):
            baba_matches.append(p)
    else:
        if has_ah_kw or (is_short and has_image):
            ah_matches.append(p)

with open(r'C:\Users\hashm\Desktop\Projects\Workplace AH\scratch\baba_examples.txt', 'w', encoding='utf-8') as f:
    for p in baba_matches[:20]:
        f.write(f"ID: {p['id']}, Title: {p['title']}\n")

with open(r'C:\Users\hashm\Desktop\Projects\Workplace AH\scratch\ah_examples.txt', 'w', encoding='utf-8') as f:
    for p in ah_matches[:20]:
        f.write(f"ID: {p['id']}, Title: {p['title']}\n")
        
print(f"Matched Baba: {len(baba_matches)}")
print(f"Matched AH Talks: {len(ah_matches)}")
