import json
import re

file_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\data\posts.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

posts = data.get('posts', [])

ah_talks_hashtag = 0
baba_hashtag = 0
english_quotes = 0
hindi_quotes = 0

for p in posts:
    content = p.get('content', '') or ''
    title = p.get('title', '') or ''
    text = content + " " + title
    
    if '#ahtalks' in text.lower():
        ah_talks_hashtag += 1
    if '#बाबा_अमीरानंद' in text or 'बाबा अमीरानंद' in text:
        baba_hashtag += 1
        
    # Heuristics for short quotes
    text_clean = re.sub(r'<[^>]+>', '', content).strip() # remove HTML
    if 10 < len(text_clean) < 300: # short text
        # check language rough heuristic
        hindi_chars = len(re.findall(r'[\u0900-\u097F]', text_clean))
        if hindi_chars > len(text_clean) * 0.3:
            hindi_quotes += 1
        else:
            english_quotes += 1

print(f"Hashtags - #ahtalks: {ah_talks_hashtag}, #baba: {baba_hashtag}")
print(f"Heuristics - Short English: {english_quotes}, Short Hindi: {hindi_quotes}")

# Also check root keys of json
print(f"Root keys: {list(data.keys())}")
