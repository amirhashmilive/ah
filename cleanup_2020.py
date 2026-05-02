import os
import json
import shutil

base_dir = r"C:\Users\hashm\Desktop\Projects\Workplace AH\assets\images\gallery"
json_path = r"C:\Users\hashm\Desktop\Projects\Workplace AH\data\gallery.json"

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

events = data.get('events', [])

new_events = []
for ev in events:
    year = ev.get('year')
    if year == 2020:
        folder_path = os.path.join(base_dir, ev.get('slug', ''))
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)
    else:
        new_events.append(ev)

data['events'] = new_events

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Removed 2020 events.")
