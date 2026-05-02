import os
from PIL import Image

base_dir = r"C:\Users\hashm\Desktop\Projects\Workplace AH\assets\images\gallery"
total_compressed = 0
bytes_saved = 0

for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png')) and not f.startswith('thumb_'):
            filepath = os.path.join(root, f)
            orig_size = os.path.getsize(filepath)
            
            try:
                with Image.open(filepath) as img:
                    if img.mode in ('RGBA', 'P'):
                        img = img.convert('RGB')
                    
                    temp_path = filepath + ".tmp"
                    quality = 75
                    img.save(temp_path, format="JPEG", quality=quality)
                    
                    # Ensure under 150KB
                    while os.path.getsize(temp_path) > 150 * 1024 and quality > 10:
                        quality -= 5
                        img.save(temp_path, format="JPEG", quality=quality)
                        
                    new_size = os.path.getsize(temp_path)
                    
                    if new_size < orig_size:
                        os.replace(temp_path, filepath)
                        bytes_saved += (orig_size - new_size)
                        total_compressed += 1
                    else:
                        os.remove(temp_path)
                        
            except Exception as e:
                print(f"Error compressing {filepath}: {e}")

print(f"Total compressed: {total_compressed}")
print(f"Total MB saved: {bytes_saved / (1024 * 1024):.2f}")
