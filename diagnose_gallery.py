import json, os, sys

# 1. Check gallery.json
json_path = 'data/gallery.json'
print("=== gallery.json check ===")
try:
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)
    events = data.get('events', [])
    print(f"Total events: {len(events)}")
    if events:
        print(f"First event title: {events[0]['title']}")
        print(f"First event images: {events[0].get('images', [])[:2]}")
        print(f"First event slug: {events[0].get('slug','NO_SLUG')}")
        print(f"First event coverImage: {events[0].get('coverImage','NO_COVER')}")
except Exception as e:
    print(f"ERROR loading gallery.json: {e}")
    sys.exit(1)

# 2. Check image folders
print("\n=== Image folder check ===")
gallery_dir = 'assets/images/gallery'
if not os.path.exists(gallery_dir):
    print(f"ERROR: Directory does not exist: {gallery_dir}")
else:
    folders = [f for f in os.listdir(gallery_dir) if os.path.isdir(os.path.join(gallery_dir, f))]
    print(f"Gallery image folders: {len(folders)}")
    print("First 10 folders:", folders[:10])

# 3. Cross-check event slugs vs folders
print("\n=== Slug vs folder cross-check ===")
slugs_with_no_folder = []
slugs_with_no_images = []
events_ok = 0
for ev in events:
    slug = ev.get('slug','')
    folder = os.path.join(gallery_dir, slug)
    images = ev.get('images', [])
    cover = ev.get('coverImage','')
    
    if not os.path.isdir(folder):
        slugs_with_no_folder.append(slug)
    elif not images:
        slugs_with_no_images.append(slug)
    else:
        # check first image actually exists
        img_path = os.path.join(folder, images[0])
        if os.path.exists(img_path):
            events_ok += 1
        else:
            print(f"  MISSING image: {img_path}")

print(f"Events with no folder: {len(slugs_with_no_folder)}")
print(f"Events with folder but no images: {len(slugs_with_no_images)}")
print(f"Events with valid images: {events_ok}")
if slugs_with_no_folder:
    print("No folder slugs (first 5):", slugs_with_no_folder[:5])

# 4. Check script loading order in gallery.html
print("\n=== gallery.html script check ===")
with open('gallery.html', encoding='utf-8') as f:
    html = f.read()
scripts = []
import re
for m in re.finditer(r'<script src="([^"]+)"', html):
    scripts.append(m.group(1))
print("Script order:", scripts)

# 5. Check for site-footer-inject and ah-header-inject
print("\n=== Injection points check ===")
for tag in ['ah-header-inject', 'site-footer-inject', 'site-header-inject']:
    print(f"  {tag}: {'FOUND' if tag in html else 'MISSING'}")

print("\n=== Done ===")
