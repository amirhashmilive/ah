import json
import re

file_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\data\posts.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

original_posts = data.get('posts', [])

# 1. Delete empty posts
deleted_ids = [201, 444, 555]
posts = [p for p in original_posts if p.get('id') not in deleted_ids]

# Heuristics setup
ah_talks_keywords = ['#ahtalks', 'thought of the day', 'quote', 'motivation', 'wisdom', 'thought', 'monday motivation']
baba_keywords = ['#बाबा_अमीरानंद', 'बाबा अमीरानंद', 'शायरी', 'सुविचार', 'अमीर हाशमी की कलम से', 'ग़ज़ल', 'गज़ल']

def is_hindi(text):
    hindi_chars = len(re.findall(r'[\u0900-\u097F]', text))
    return hindi_chars > len(text) * 0.2 if len(text) > 0 else False

ah_talks_count = 0
baba_count = 0

for p in posts:
    cats = p.get('categories', [])
    if 'Blog' not in cats:
        continue

    content = p.get('content', '') or ''
    title = p.get('title', '') or ''
    text_clean = re.sub(r'<[^>]+>', '', content).strip()
    full_text = (title + " " + text_clean).lower()
    
    is_short = 0 < len(text_clean) < 400
    has_image = p.get('hasImage', False)
    
    # Check Baba
    baba_match = any(kw.lower() in full_text for kw in baba_keywords)
    if not baba_match and is_hindi(title + " " + text_clean):
        # Hindi short quote
        if is_short and (has_image or '?' in title or '!' in title or '\n' in text_clean):
             baba_match = True

    # Check AH Talks
    ah_match = any(kw.lower() in full_text for kw in ah_talks_keywords)
    if not ah_match and not is_hindi(title + " " + text_clean):
        # English short quote
        if is_short and (has_image or '"' in title or "'" in title or '?' in title or '\n' in text_clean):
             ah_match = True

    # Apply categories
    if baba_match:
        if 'बाबा अमीरानंद' not in cats:
            cats.append('बाबा अमीरानंद')
            baba_count += 1
    elif ah_match: # Use elif to prevent assigning both, prioritize Baba for Hindi
        if 'Amir Hashmi Talks' not in cats:
            cats.append('Amir Hashmi Talks')
            ah_talks_count += 1
            
    p['categories'] = cats

# Re-assign posts
data['posts'] = posts

# Write back to file
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

# Calculate current unique categories
unique_cats = set()
for p in posts:
    for cat in p.get('categories', []):
        unique_cats.add(cat)

print(f"Deleted IDs: {deleted_ids}")
print(f"Moved to Amir Hashmi Talks: {ah_talks_count}")
print(f"Moved to बाबा अमीरानंद: {baba_count}")
print(f"Current unique categories: {list(unique_cats)}")
