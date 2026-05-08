import os
import re
import json
import shutil
from pathlib import Path

working_dir = r'C:\Users\hashm\Desktop\Projects\Workplace AH'
images_dir = os.path.join(working_dir, 'assets', 'images')

hindi_consonants = {
    'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
    'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
    'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
    'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
    'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
    'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
    'क्ष': 'ksha', 'त्र': 'tra', 'ज्ञ': 'gya'
}
hindi_vowels = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au'
}
hindi_matras = {
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ः': 'h', 'ँ': 'n', '़': '', '्': ''
}

def transliterate_hindi(text):
    out = ""
    i = 0
    while i < len(text):
        c = text[i]
        if c in hindi_consonants:
            if i + 1 < len(text) and text[i+1] in hindi_matras:
                base = hindi_consonants[c][:-1] if hindi_consonants[c].endswith('a') else hindi_consonants[c]
                if text[i+1] == '्':
                    out += base
                else:
                    out += base + hindi_matras[text[i+1]]
                i += 1
            else:
                out += hindi_consonants[c]
        elif c in hindi_vowels:
            out += hindi_vowels[c]
        elif c in hindi_matras:
            out += hindi_matras[c]
        else:
            out += c
        i += 1
    out = out.replace('aa', 'a').replace('ee', 'i').replace('oo', 'u')
    return out

def clean_filename(name):
    name, ext = os.path.splitext(name)
    name = transliterate_hindi(name)
    name = name.replace(' ', '-')
    name = name.replace('(', '').replace(')', '')
    name = name.replace('[', '').replace(']', '')
    name = name.replace(',', '')
    name = name.replace('&', 'and')
    name = name.replace('%', 'percent')
    name = re.sub(r'[^a-zA-Z0-9_\-]', '', name)
    name = re.sub(r'-+', '-', name)
    name = name[:50].strip('-')
    return name.lower() + ext.lower()

report = {"files": [], "stats": {}}

for root, dirs, files in os.walk(images_dir):
    rel_folder = os.path.relpath(root, images_dir)
    parts = Path(rel_folder).parts
    
    if len(parts) > 1 and parts[0] == 'blog' and parts[1].isdigit():
        folder_key = parts[1]
    elif len(parts) > 0 and parts[0] != '.':
        folder_key = parts[0]
    else:
        folder_key = 'root'
        
    if folder_key not in report["stats"]:
        report["stats"][folder_key] = {"long_name": 0, "hindi": 0, "special": 0, "total": 0}

    for f in files:
        file_path = os.path.join(root, f)
        rel_path = os.path.relpath(file_path, working_dir).replace('\\', '/')
        name_no_ext = os.path.splitext(f)[0]
        
        is_long_name = len(name_no_ext) > 100
        is_long_path = len(os.path.abspath(file_path)) > 200
        has_hindi = bool(re.search(r'[\u0900-\u097F]', f))
        has_special = bool(re.search(r'[^a-zA-Z0-9_\-\.]', f))
        
        if is_long_name or is_long_path or has_hindi or has_special:
            report["files"].append({
                "old_rel_path": rel_path,
                "old_name": f,
                "folder_key": folder_key,
                "is_long": is_long_name or is_long_path,
                "has_hindi": has_hindi,
                "has_special": has_special,
                "old_abs_path": file_path
            })
            if is_long_name or is_long_path: report["stats"][folder_key]["long_name"] += 1
            if has_hindi: report["stats"][folder_key]["hindi"] += 1
            if has_special: report["stats"][folder_key]["special"] += 1
            report["stats"][folder_key]["total"] += 1

rename_log = []
files_to_update = [
    os.path.join(working_dir, 'data', 'posts.json'),
    os.path.join(working_dir, 'data', 'gallery.json')
]
for f in os.listdir(working_dir):
    if f.endswith('.html'):
        files_to_update.append(os.path.join(working_dir, f))

for item in report["files"]:
    old_name = item["old_name"]
    old_path = item["old_abs_path"]
    match = re.search(r'\\20\d{2}\\', old_path)
    year = match.group(0).strip('\\') if match else ''
    
    new_name = clean_filename(old_name)
    if year and year not in new_name:
        name_part, ext = os.path.splitext(new_name)
        new_name = f"{name_part[:45]}-{year}{ext}"
        
    dir_name = os.path.dirname(old_path)
    new_path = os.path.join(dir_name, new_name)
    counter = 1
    while os.path.exists(new_path) and new_path != old_path:
        name_part, ext = os.path.splitext(new_name)
        new_name_mod = f"{name_part[:46]}_{counter}{ext}"
        new_path = os.path.join(dir_name, new_name_mod)
        counter += 1
        
    if new_path != old_path:
        os.rename(old_path, new_path)
        rename_log.append({"old": item["old_rel_path"], "new": os.path.relpath(new_path, working_dir).replace('\\', '/')})

updated_files_list = []
for file_path in files_to_update:
    if not os.path.exists(file_path): continue
    try:
        with open(file_path, 'r', encoding='utf-8') as f: content = f.read()
    except: continue
        
    original_content = content
    for log in rename_log:
        content = content.replace(log["old"], log["new"])
        
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f: f.write(content)
        updated_files_list.append(os.path.basename(file_path))

verification = {"long_name": 0, "long_path": 0, "hindi": 0, "special": 0}
for root, dirs, files in os.walk(images_dir):
    for f in files:
        file_path = os.path.join(root, f)
        name_no_ext = os.path.splitext(f)[0]
        if len(name_no_ext) > 100: verification["long_name"] += 1
        if len(os.path.abspath(file_path)) > 200: verification["long_path"] += 1
        if bool(re.search(r'[\u0900-\u097F]', f)): verification["hindi"] += 1
        if bool(re.search(r'[^a-zA-Z0-9_\-\.]', f)): verification["special"] += 1

with open(os.path.join(working_dir, 'scratch', 'rename_report.json'), 'w', encoding='utf-8') as f:
    json.dump({
        "stats": report["stats"],
        "files_found": len(report["files"]),
        "renamed": rename_log,
        "updated_files": updated_files_list,
        "verification": verification
    }, f, indent=2, ensure_ascii=False)
