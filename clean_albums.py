import json
import os

with open('data/gallery.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

events = data.get('events', [])
valid_events = []

for ev in events:
    # Check if there's any image
    if not ev.get('images'):
        continue
    
    # Verify at least one image exists
    slug = ev.get('slug')
    has_valid_image = False
    
    # Filter valid images
    valid_images = []
    for img in ev.get('images', []):
        img_path = os.path.join('assets', 'images', 'gallery', slug, img)
        if os.path.isfile(img_path):
            valid_images.append(img)
            has_valid_image = True
    
    if has_valid_image:
        ev['images'] = valid_images
        ev['imageCount'] = len(valid_images)
        
        # Check cover image
        cover = ev.get('coverImage', '')
        if not cover or not os.path.isfile(cover):
            ev['coverImage'] = f"assets/images/gallery/{slug}/{valid_images[0]}"
            
        valid_events.append(ev)

data['events'] = valid_events
with open('data/gallery.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Cleaned up {len(events) - len(valid_events)} empty/broken albums. {len(valid_events)} remaining.")
