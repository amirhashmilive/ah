import os

js_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\assets\js\chronicle.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace("  var elCount = document.getElementById('chronicle-count');\n", "")
js = js.replace("  var elSkeleton = document.getElementById('chronicle-skeleton');\n", "")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
print("Variables removed.")
