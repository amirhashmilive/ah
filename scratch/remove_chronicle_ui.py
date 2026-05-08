import os

html_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\chronicle.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove count text
html = html.replace('<p id="chronicle-count" class="reveal" aria-live="polite"></p>', '')

# Remove skeleton
skeleton_html = """      <div id="chronicle-skeleton" class="chronicle-skeleton" hidden>
        <div class="skeleton-card" aria-hidden="true"></div>
        <div class="skeleton-card" aria-hidden="true"></div>
        <div class="skeleton-card" aria-hidden="true"></div>
      </div>"""
html = html.replace(skeleton_html, '')

# Also remove CSS
css1 = """    .chronicle-skeleton {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;
      margin-bottom: 24px;
    }"""
css2 = """    #chronicle-count { font-size: 0.9rem; color: var(--text-3); margin-bottom: 20px; font-weight: 600; }"""

html = html.replace(css1, '')
html = html.replace(css2, '')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

js_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\assets\js\chronicle.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Remove JS
js_count_logic = """    if (elCount) {
      elCount.textContent = total === allPosts.length
        ? total + ' posts'
        : total + ' posts (filtered from ' + allPosts.length + ')';
    }"""
js = js.replace(js_count_logic, '')

js_skeleton_logic = """  function showSkeleton(show) {
    if (elSkeleton) elSkeleton.hidden = !show;
    if (elGrid) elGrid.style.opacity = show ? '0.5' : '1';
    if (show && elEmpty) {
      elEmpty.hidden = false;
      elEmpty.textContent = "Loading posts...";
    } else if (!show && elEmpty) {
      elEmpty.hidden = true;
    }
  }"""
js_skeleton_replacement = """  function showSkeleton(show) {
    if (elGrid) elGrid.style.opacity = show ? '0.5' : '1';
    if (show && elEmpty) {
      elEmpty.hidden = false;
      elEmpty.textContent = "Loading posts...";
    } else if (!show && elEmpty) {
      elEmpty.hidden = true;
    }
  }"""
js = js.replace(js_skeleton_logic, js_skeleton_replacement)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Files updated successfully.")
