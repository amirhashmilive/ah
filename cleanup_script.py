import os
import json
import shutil

base_dir = r"C:\Users\hashm\Desktop\Projects\Workplace AH\assets\images\gallery"
json_path = r"C:\Users\hashm\Desktop\Projects\Workplace AH\data\gallery.json"

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

events = data.get('events', [])

# 1. Delete 2010 and 2023 events
new_events = []
for ev in events:
    year = ev.get('year')
    if year in [2010, 2023]:
        folder_path = os.path.join(base_dir, ev.get('slug', ''))
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)
    else:
        new_events.append(ev)

events = new_events

# 2. Rename / Split
# Johar Gandhi
johar_idx = next((i for i, ev in enumerate(events) if ev['slug'] == '2022-johar-gandhi'), -1)
if johar_idx != -1:
    johar = events.pop(johar_idx)
    # create new ones
    events.append({
        "id": johar['id'],
        "title": "Johar Gandhi \u2013 Book Launch",
        "slug": "2022-johar-gandhi-book-launch",
        "year": 2022,
        "date": "2022-01-01",
        "description": "Johar Gandhi \u2013 Book Launch",
        "category": "Book Launch",
        "isFeatured": True,
        "coverImage": "",
        "imageCount": 0,
        "images": []
    })
    events.append({
        "id": 9991, # new id
        "title": "Johar Gandhi \u2013 Panel Discussion",
        "slug": "2022-johar-gandhi-panel-discussion",
        "year": 2022,
        "date": "2022-01-01",
        "description": "Johar Gandhi \u2013 Panel Discussion",
        "category": "Event",
        "isFeatured": False,
        "coverImage": "",
        "imageCount": 0,
        "images": []
    })
    if os.path.exists(os.path.join(base_dir, '2022-johar-gandhi')):
        os.rename(os.path.join(base_dir, '2022-johar-gandhi'), os.path.join(base_dir, '2022-johar-gandhi-book-launch'))
    if not os.path.exists(os.path.join(base_dir, '2022-johar-gandhi-panel-discussion')):
        os.makedirs(os.path.join(base_dir, '2022-johar-gandhi-panel-discussion'))

# Tiranga
for ev in events:
    if ev['slug'] == '2019-tiranga-world-record-event':
        ev['slug'] = '2019-tiranga-flag-rally'
        if os.path.exists(os.path.join(base_dir, '2019-tiranga-world-record-event')):
            os.rename(os.path.join(base_dir, '2019-tiranga-world-record-event'), os.path.join(base_dir, '2019-tiranga-flag-rally'))
    elif ev['slug'] == '2019-tiranga-world-record-bike-rally':
        ev['slug'] = '2019-tiranga-bike-rally'
        if os.path.exists(os.path.join(base_dir, '2019-tiranga-world-record-bike-rally')):
            os.rename(os.path.join(base_dir, '2019-tiranga-world-record-bike-rally'), os.path.join(base_dir, '2019-tiranga-bike-rally'))

# 3. Primary Images
keywords = ['primary', 'priority', 'main', 'cover', 'featured', 'best']
for ev in events:
    slug = ev.get('slug', '')
    folder_path = os.path.join(base_dir, slug)
    if not os.path.exists(folder_path):
        continue
    
    files = os.listdir(folder_path)
    images = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png')) and not f.startswith('thumb_')]
    
    # Update images array
    ev['images'] = images
    ev['imageCount'] = len(images)
    
    # Find primary
    primary_img = None
    for img in images:
        lower_name = img.lower()
        if any(k in lower_name for k in keywords):
            primary_img = img
            break
            
    if not primary_img and images:
        primary_img = images[0]
        
    if primary_img:
        ev['coverImage'] = f"assets/images/gallery/{slug}/{primary_img}"
    else:
        ev['coverImage'] = ""

data['events'] = events

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Cleanup complete!")
