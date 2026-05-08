import json

file_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\data\posts.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

posts = data.get('posts', [])

ah_talks = sum(1 for p in posts if 'Amir Hashmi Talks' in p.get('categories', []))
baba = sum(1 for p in posts if 'बाबा अमीरानंद' in p.get('categories', []))

unique_cats = set()
for p in posts:
    for cat in p.get('categories', []):
        unique_cats.add(cat)

print(f"Ah Talks count: {ah_talks}")
print(f"Baba count: {baba}")
print(f"Unique categories: {list(unique_cats)}")
