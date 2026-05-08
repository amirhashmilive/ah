import json
file_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\data\posts.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)
missing_titles = [p.get('id') for p in data.get('posts', []) if not p.get('title')]
print(missing_titles)
