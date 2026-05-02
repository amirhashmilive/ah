import json
import os

filepath = r"C:\Users\hashm\Desktop\Projects\Workplace AH\data\gallery.json"

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for ev in data.get('events', []):
    title = ev.get('title', '').lower()
    slug = ev.get('slug', '').lower()
    
    # Categorize
    if any(k in slug or k in title for k in ['rajyotsav', 'rajim', 'bhoramdev', 'cicasa', 'sufi', 'concert']):
        ev['category'] = 'Concert'
    elif any(k in slug or k in title for k in ['acting', 'art of performing', 'music', 'youth', 'workshop']):
        ev['category'] = 'Workshop'
    elif any(k in slug or k in title for k in ['cnbc', 'r3', 'kabir', 'irs', 'mcai', 'guest']):
        ev['category'] = 'Guest Appearance'
    elif any(k in slug or k in title for k in ['chhattisgarh ki shaan', 'star of the year', 'award']):
        ev['category'] = 'Award'
    elif any(k in slug or k in title for k in ['bolti nadi', 'tiranga', 'kopalwani', 'disabled', 'disability']):
        ev['category'] = 'Initiative'
    elif any(k in slug or k in title for k in ['johar gandhi', 'book']):
        ev['category'] = 'Book Launch'
    else:
        # Default fallback
        ev['category'] = 'Event'

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Updated gallery.json categories.")
