import os
import re
import json
import glob

# Constants
ROOT_DIR = r"C:\Users\hashm\Desktop\Projects\Workplace AH"
html_files = glob.glob(os.path.join(ROOT_DIR, "*.html"))

# --- Phase 1: COMPLETE IJMEER REMOVAL ---

# Files to delete
journal_files = [
    # JSON
    "data/papers.json", "data/issues.json", "data/editors.json",
    "papers.json", "issues.json", "editors.json",
    # HTML
    "citations.html", "archive.html", "peer-review.html", "editorial-board.html", 
    "editorial-portfolio.html", "journal.html", "library.html", "open-access.html", 
    "open-access-policy.html", "publishing-ethics.html", "research-transparency.html", 
    "rights-permissions.html", "fees-pricing.html", "abstracting-indexing.html", 
    "book-reviews.html", "submission-guidelines.html", "ethical-guidelines.html", 
    "indexing.html", "metrics.html", "call-for-papers.html", "apc.html"
]

files_deleted = 0
for f in journal_files:
    path = os.path.join(ROOT_DIR, f)
    if os.path.exists(path):
        os.remove(path)
        files_deleted += 1

# Strings to remove/replace
ijmeer_strings = [
    r"IJMEER",
    r"International Journal of Multidisciplinary Explication and Emerging Research",
    r"International Journal of Multidisciplinary Engineering and Educational Research",
    r"ISSN(?:\s*\(Print\):\s*\S+)?(?:\s*\|\s*ISSN\s*\(Online\):\s*\S+)?",
    r"Editorial Board",
    r"Peer Review",
    r"Call for Papers",
    r"APC",
    r"Article Processing Charge(?:s)?",
    r"Publication Fee(?:s)?",
    r"Submit Paper",
    r"Current Issue",
    r"Archive Issue",
    r"Impact Factor",
    r"Citation Index",
    r"CC BY-NC",
    r"Published by Meer Foundation",
    r"Open Access"
]

def clean_content(content):
    # Remove meta tags
    content = re.sub(r'<meta[^>]*name=["\']citation_[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta[^>]*property=["\']og:url["\'][^>]*content=["\'][^>]*ijmeer\.com[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\'][^>]*ijmeer\.com[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta[^>]*name=["\']google-site-verification["\'][^>]*>', '', content, flags=re.IGNORECASE)
    
    # Remove tracking scripts
    content = re.sub(r'<!-- Google Tag Manager -->.*?<!-- End Google Tag Manager -->', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<script[^>]*src=["\'][^>]*googletagmanager\.com[^>]*>[\s\S]*?</script>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'GTM-NWHDPZRK|G-2FNJ68WF8J', '', content)

    # Specific replacements that shouldn't just be deleted but replaced with nothing or a generic word if needed.
    # Actually, the prompt says "Search and remove ANY occurrence of these strings across ALL files".
    # For HTML, we might need to be careful to not break tags.
    for s in ijmeer_strings:
        # Avoid removing APC if it's part of a word? The prompt says "ANY occurrence". 
        # But APC might be tricky. Let's use word boundaries for short acronyms.
        if len(s) <= 4:
            content = re.sub(r'\b' + s + r'\b', '', content, flags=re.IGNORECASE)
        else:
            content = re.sub(s, '', content, flags=re.IGNORECASE)
    
    return content

# Clean all HTML, JS, CSS
for ext in ["*.html", "assets/js/*.js", "assets/css/*.css", "README.md"]:
    for file_path in glob.glob(os.path.join(ROOT_DIR, ext)):
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            new_content = clean_content(content)
            
            # Additional cleanup for specific copyright text
            new_content = re.sub(
                r'©\s*202\d.*?Amir Hashmi.*?(?=<)', 
                '© 2026 Amir Hashmi. All rights reserved. | events@amirhashmi.com', 
                new_content, flags=re.IGNORECASE
            )
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

# --- Phase 4: FILE CLEANUP ---
patterns_to_delete = [
    "**/*.mp4", "**/*.sql", "**/*.zip", "**/*-2.jpg", "**/*-3.jpg", "**/*-2.png", "**/*-3.png",
    "**/fb_img_*.jpg", "**/wp-image-*.jpg", "**/cropped-*.jpg"
]
for pattern in patterns_to_delete:
    for f in glob.glob(os.path.join(ROOT_DIR, pattern), recursive=True):
        if os.path.isfile(f):
            try:
                os.remove(f)
                files_deleted += 1
            except:
                pass

# Folder structure
folders = [
    "assets/css", "assets/js", "assets/images/blog", "assets/files/pdf", "assets/files/audio", "assets/fonts"
]
for folder in folders:
    os.makedirs(os.path.join(ROOT_DIR, folder), exist_ok=True)

# Delete empty folders
for dirpath, dirnames, filenames in os.walk(ROOT_DIR, topdown=False):
    if not dirnames and not filenames:
        try:
            os.rmdir(dirpath)
        except:
            pass

# --- Phase 3: SEO COMPLIANCE ---
seo_template = """
<!-- Primary SEO -->
<title>Amir Hashmi | {page_name} – National Award-Winning Filmmaker | Author | Philanthropist</title>
<meta name="description" content="{desc}">
<meta name="keywords" content="Amir Hashmi, National Award filmmaker, Bolti Nadi, Johar Gandhi, Hindustani classical singer, Chhattisgarh">
<meta name="author" content="Amir Hashmi">
<meta name="robots" content="{robots}">

<!-- Canonical URL -->
<link rel="canonical" href="https://amirhashmi.com/{filename}">

<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:type" content="website">
<meta property="og:title" content="Amir Hashmi | {page_name}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://amirhashmi.com/{filename}">
<meta property="og:image" content="https://amirhashmi.com/assets/images/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@amirhashmilive">
<meta name="twitter:title" content="Amir Hashmi | {page_name}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="https://amirhashmi.com/assets/images/og-image.jpg">
"""

schema_ld = """
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Amir Hashmi",
  "url": "https://amirhashmi.com",
  "sameAs": [
    "https://www.facebook.com/amirhashmilive",
    "https://www.instagram.com/amirhashmilive",
    "https://x.com/amirhashmilive",
    "https://www.youtube.com/@amirhashmilive",
    "https://www.linkedin.com/in/amirhashmilive",
    "https://www.imdb.com/name/nm11165013/"
  ],
  "jobTitle": "Filmmaker, Author, Philanthropist",
  "worksFor": {
    "@type": "Organization",
    "name": "Meer Foundation"
  },
  "award": "National Film Excellence Award",
  "knowsAbout": ["Filmmaking", "Hindustani Classical Music", "River Revival", "Tribal History Research"]
}
</script>
"""

descriptions = {
    "index.html": ("Home", "Official website of Amir Hashmi - National Award-winning filmmaker, author of Johar Gandhi, founder of Bolti Nadi river revival movement. Book for events."),
    "films.html": ("Films", "Explore the National Award-winning films, documentaries, and social cinema directed by Amir Hashmi."),
    "music.html": ("Music", "Listen to Hindustani classical music and original compositions by Sangeet Visharad Amir Hashmi."),
    "books.html": ("Books", "Read about Johar Gandhi and other published works by Amir Hashmi on tribal freedom fighters."),
    "initiative.html": ("Initiatives", "Discover Bolti Nadi river revival and other social initiatives by Amir Hashmi across Chhattisgarh."),
    "chronicle.html": ("Chronicle", "Read the personal chronicle, blog posts, and articles by Amir Hashmi spanning over a decade."),
    "news.html": ("News", "Latest updates, news, press coverage, and announcements about Amir Hashmi."),
    "book-now.html": ("Book Now", "Book Amir Hashmi for concerts, keynotes, film screenings, and bespoke collaborations.")
}

for html_file in glob.glob(os.path.join(ROOT_DIR, "*.html")):
    filename = os.path.basename(html_file)
    if filename == "404.html": continue
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove existing old SEO blocks (like <title>, <meta name="description">, etc.)
    content = re.sub(r'<title>.*?</title>', '', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<meta name="description".*?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta name="keywords".*?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta name="author".*?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta name="robots".*?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<link rel="canonical".*?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta property="og:.*?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<meta name="twitter:.*?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<script type="application/ld\+json">.*?</script>', '', content, flags=re.IGNORECASE | re.DOTALL)

    page_name, desc = descriptions.get(filename, ("Page", "Official website of Amir Hashmi - National Award-winning filmmaker."))
    robots = "index, follow"

    seo_block = seo_template.format(page_name=page_name, desc=desc, filename="" if filename == "index.html" else filename, robots=robots)
    
    if filename == "index.html":
        seo_block += schema_ld

    # Insert after <head>
    content = re.sub(r'<head>', f'<head>\n{seo_block}', content, flags=re.IGNORECASE)
    
    # Also add image lazy loading
    content = re.sub(r'<img(?![^>]*loading=)([^>]*)>', r'<img loading="lazy"\1>', content)
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)

# --- Phase 7: SITEMAP & ROBOTS.TXT ---
sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://amirhashmi.com/</loc><priority>1.0</priority><changefreq>weekly</changefreq></url>
  <url><loc>https://amirhashmi.com/films.html</loc><priority>0.9</priority><changefreq>monthly</changefreq></url>
  <url><loc>https://amirhashmi.com/music.html</loc><priority>0.9</priority><changefreq>monthly</changefreq></url>
  <url><loc>https://amirhashmi.com/books.html</loc><priority>0.9</priority><changefreq>monthly</changefreq></url>
  <url><loc>https://amirhashmi.com/initiative.html</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>
  <url><loc>https://amirhashmi.com/chronicle.html</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
  <url><loc>https://amirhashmi.com/news.html</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
  <url><loc>https://amirhashmi.com/book-now.html</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>
  <url><loc>https://amirhashmi.com/404.html</loc><priority>0.1</priority><changefreq>yearly</changefreq></url>
</urlset>"""

with open(os.path.join(ROOT_DIR, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write(sitemap_content)

robots_content = """User-agent: *
Allow: /
Disallow: /assets/js/
Disallow: /assets/css/
Sitemap: https://amirhashmi.com/sitemap.xml"""

with open(os.path.join(ROOT_DIR, "robots.txt"), "w", encoding="utf-8") as f:
    f.write(robots_content)

print(f"Files deleted: {files_deleted}")
