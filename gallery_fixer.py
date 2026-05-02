import json
import os
import shutil
import glob
from PIL import Image

def compress_image(src, dst):
    try:
        with Image.open(src) as img:
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            quality = 75
            img.save(dst, 'JPEG', quality=quality)
            while os.path.getsize(dst) > 200 * 1024 and quality > 10:
                quality -= 5
                img.save(dst, 'JPEG', quality=quality)
        return True
    except Exception as e:
        print(f"Error compressing {src}: {e}")
        return False

with open('data/gallery.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

events = data.get('events', [])

# Map titles to find existing ones
event_map = {e['title'].lower(): e for e in events}
max_id = max([e['id'] for e in events]) if events else 0

# Helper to add or get event
def get_or_create_event(title, description, category, year, slug):
    global max_id
    title_lower = title.lower()
    if title_lower in event_map:
        return event_map[title_lower]
    
    max_id += 1
    new_event = {
        "id": max_id,
        "title": title,
        "slug": slug,
        "year": year,
        "date": f"{year}-01-01",
        "description": description,
        "category": category,
        "isFeatured": False,
        "coverImage": "",
        "imageCount": 0,
        "images": []
    }
    events.append(new_event)
    event_map[title_lower] = new_event
    return new_event

target_dir = r"C:\Users\hashm\Desktop\Projects\Workplace AH\assets\images\gallery"
source_dir = r"C:\Users\hashm\Desktop\Projects\Plan Mode\AH\Events"

def process_event_images(event, source_folder):
    slug = event['slug']
    dest_folder = os.path.join(target_dir, slug)
    os.makedirs(dest_folder, exist_ok=True)
    
    if os.path.exists(source_folder):
        for ext in ('*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG'):
            for img_path in glob.glob(os.path.join(source_folder, ext)):
                filename = os.path.basename(img_path)
                dest_path = os.path.join(dest_folder, filename)
                if compress_image(img_path, dest_path):
                    if filename not in event['images']:
                        event['images'].append(filename)
    
    event['imageCount'] = len(event['images'])
    if event['imageCount'] > 0 and not event['coverImage']:
        event['coverImage'] = f"assets/images/gallery/{slug}/{event['images'][0]}"


# Problem 3: Youth Festival with IAS OP Chaudhary is Blank
youth_event = get_or_create_event(
    "Youth Festival with IAS OP Chaudhary",
    "Youth Festival with IAS OP Chaudhary from 2018.",
    "Workshop",
    2018,
    "youth-festival-ias-op-chaudhary"
)
process_event_images(youth_event, os.path.join(source_dir, "2018 - Youth Festival with IAS OP Chaudhary"))


# Problem 4: Split Johar Gandhi
johar_source = os.path.join(source_dir, "2022 - Johar Gandhi")
johar_subdirs = [
    ("Fan Movements", "2022-johar-gandhi-fan-movements"),
    ("Images DPRO Cover Picture", "2022-johar-gandhi-dpro-cover"),
    ("Images Shahid Smarak  Main Events", "2022-johar-gandhi-shahid-smarak"),
    ("Images Vrindavan Hall Secondary Evening Event", "2022-johar-gandhi-vrindavan-hall")
]
for subdir, slug in johar_subdirs:
    title = f"Johar Gandhi - {subdir.replace('Images ', '').replace('  ', ' ')}"
    e = get_or_create_event(title, f"{title} from 2022.", "Event", 2022, slug)
    process_event_images(e, os.path.join(johar_source, subdir))


# Problem 7: Add 18 New Events (if found in source folder, else placeholder)
new_events_list = [
    ("Workshop To Bring About Change In The Society", "Initiative", 2019, "workshop-bring-change-society"),
    ("15-km Long Tiranga Drapes Raipur", "Initiative", 2019, "15km-tiranga-raipur"),
    ("Bolti Nadi Conclave 2019", "Initiative", 2019, "bolti-nadi-conclave-2019"),
    ("Sakri River Basin 90 km River Walk", "Initiative", 2019, "sakri-river-walk"),
    ("Gory Nala Shramdaan Activity", "Initiative", 2019, "gory-nala-shramdaan"),
    ("Village Interaction & Public Dialogue", "Initiative", 2019, "village-interaction-public-dialogue"),
    ("Documentary Screening & Public Discussion", "Initiative", 2019, "documentary-screening-discussion"),
    ("Public Representatives Interaction", "Initiative", 2019, "public-representatives-interaction"),
    ("Poetry & Cultural Expression Sessions", "Concert", 2019, "poetry-cultural-expression"),
    ("Music Album Launch – \"Kyu Aisa Hota Hain\"", "Concert", 2015, "kyu-aisa-hota-hain-launch"),
    ("News Coverage & Media Highlights", "Guest Appearance", 2019, "news-coverage-media-highlights"),
    ("Bhartiya Chitra Sadhna Film Festival (2018)", "Event", 2018, "bhartiya-chitra-sadhna-2018"),
    ("Workshops & Training Programs (Various Locations)", "Workshop", 2019, "workshops-training-programs"),
    ("Mirror of the Clean India – Recognition & News", "Award", 2016, "mirror-clean-india-recognition"),
    ("Gangrel Dam Documentary Coverage (2017)", "Initiative", 2017, "gangrel-dam-documentary-2017"),
    ("Bolti Nadi Initiative News (2016)", "Initiative", 2016, "bolti-nadi-initiative-news-2016"),
    ("Anti-Drug Awareness Campaign (2016 – #SharabBandi108)", "Initiative", 2016, "anti-drug-awareness-2016"),
    ("Nepal Earthquake Tribute Initiative (2015)", "Initiative", 2015, "nepal-earthquake-tribute-2015")
]

# We will just try matching folders containing keywords
def find_matching_folder(title):
    for entry in os.listdir(source_dir):
        if entry.lower() in title.lower() or title.lower() in entry.lower():
            return os.path.join(source_dir, entry)
    return None

for title, category, year, slug in new_events_list:
    e = get_or_create_event(title, f"{title} from {year}.", category, year, slug)
    match_folder = find_matching_folder(title)
    if match_folder:
        process_event_images(e, match_folder)


# Also ensure we compress EXISTING images if needed (Problem 8)
for e in events:
    slug = e.get('slug')
    images = e.get('images', [])
    if slug and images:
        dest_folder = os.path.join(target_dir, slug)
        for img in images:
            img_path = os.path.join(dest_folder, img)
            if os.path.exists(img_path):
                if os.path.getsize(img_path) > 200 * 1024:
                    compress_image(img_path, img_path)


data['events'] = events
with open('data/gallery.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Done python script")
