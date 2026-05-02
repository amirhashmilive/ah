import json

with open('data/gallery.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

featured_titles = [
    "Johar Gandhi",
    "Youth Festival with IAS OP Chaudhary",
    "Bemetara Annual Day",
    "Bolti Nadi Conclave 2019",
    "15-km Long Tiranga Drapes Raipur"
]

for ev in data.get('events', []):
    ev['isFeatured'] = any(f.lower() in ev['title'].lower() for f in featured_titles)

with open('data/gallery.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated featured flags in JSON.")
