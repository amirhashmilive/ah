#!/usr/bin/env python3
"""
One-off WordPress WXR -> Amir Hashmi Chronicle (posts.json + chronicle/*.html + images).
"""
from __future__ import annotations

import html as html_module
import json
import os
import re
import shutil
import unicodedata
import urllib.parse
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import datetime
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
WORKSPACE = Path(r"C:\Users\hashm\Desktop\Projects\Workplace AH")
XML_PATH = Path(r"C:\Users\hashm\Desktop\Projects\Plan Mode\AH\Wordpress\XML\amirhashmi.wordpress.com.2026-05-02.000.xml")
MEDIA_ROOT = Path(r"C:\Users\hashm\Desktop\Projects\Plan Mode\AH\Wordpress\Media Backup")

OUT_DATA = WORKSPACE / "data"
OUT_POSTS = WORKSPACE / "chronicle"
OUT_IMG = WORKSPACE / "assets" / "images" / "blog"
PLACEHOLDER = WORKSPACE / "assets" / "images" / "blog-placeholder.jpg"

NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "wp": "http://wordpress.org/export/1.2/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
    "dc": "http://purl.org/dc/elements/1.1/",
}

URL_PATTERNS = [
    re.compile(
        r'(https?://i[0-9]+\.wp\.com/[^/\s"]+/wp-content/uploads/(\d{4})/\d{2}/([^?\s"\'\)]+))',
        re.I,
    ),
    re.compile(
        r'(https?://amirhashmi\.wordpress\.com/wp-content/uploads/(\d{4})/\d{2}/([^?\s"\'\)]+))',
        re.I,
    ),
    re.compile(
        r'(https?://amirhashmi\.files\.wordpress\.com/(\d{4})/\d{2}/([^?\s"\'\)]+))',
        re.I,
    ),
]


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9]+", "-", s.lower())
    s = s.strip("-")
    return s or "post"


def strip_tags(html: str) -> str:
    t = re.sub(r"<[^>]+>", " ", html or "")
    t = html_module.unescape(t)
    return re.sub(r"\s+", " ", t).strip()


def sanitize_html(html: str) -> str:
    if not html:
        return ""
    html = re.sub(
        r"<script\b[^<]*(?:(?!</script>)<[^<]*)*</script>",
        "",
        html,
        flags=re.I | re.DOTALL,
    )
    html = re.sub(r"\s*on\w+\s*=\s*\"[^\"]*\"", "", html, flags=re.I)
    html = re.sub(r"\s*on\w+\s*=\s*'[^']*'", "", html, flags=re.I)
    html = re.sub(
        r"\s*href\s*=\s*[\"']javascript:[^\"']*[\"']",
        ' href="#"',
        html,
        flags=re.I,
    )
    return html


def gettext(elem: ET.Element, path: str) -> str:
    e = elem.find(path, NS)
    if e is None or e.text is None:
        return ""
    return e.text.strip()


def postmeta_dict(item: ET.Element) -> dict[str, str]:
    d: dict[str, str] = {}
    for pm in item.findall("wp:postmeta", NS):
        k = pm.find("wp:meta_key", NS)
        v = pm.find("wp:meta_value", NS)
        if k is not None and k.text:
            d[k.text] = (v.text if v is not None and v.text else "") or ""
    return d


def categories_and_tags(item: ET.Element) -> tuple[list[str], list[str]]:
    cats, tags = [], []
    for cat in item.findall("category"):
        domain = (cat.get("domain") or "").lower()
        name = (cat.text or "").strip()
        if not name:
            continue
        if domain == "category":
            cats.append(name)
        elif domain == "post_tag":
            tags.append(name)
    return cats, tags


def build_year_file_index() -> dict[str, list[Path]]:
    year_files: dict[str, list[Path]] = defaultdict(list)
    if not MEDIA_ROOT.is_dir():
        return year_files
    for ydir in MEDIA_ROOT.iterdir():
        if not ydir.is_dir() or not ydir.name.isdigit():
            continue
        for p in ydir.rglob("*"):
            if p.is_file():
                year_files[ydir.name].append(p)
    return year_files


def find_media_file(
    year_files: dict[str, list[Path]], prefer_year: str | None, filename: str
) -> tuple[str | None, Path | None]:
    fname = urllib.parse.unquote(filename)
    fl = fname.lower()
    stem = Path(fname).stem.lower()

    def rank_for(path: Path) -> int | None:
        pl = path.name.lower()
        if pl == fl:
            return 0
        if stem and stem in pl:
            return 1
        if fl in pl:
            return 2
        return None

    order: list[str] = []
    if prefer_year and prefer_year in year_files:
        order.append(prefer_year)
    order.extend(sorted(year_files.keys(), key=int))
    seen: set[str] = set()
    order = [y for y in order if y not in seen and not seen.add(y)]

    best: tuple[int, str, Path] | None = None
    for y in order:
        for p in year_files[y]:
            r = rank_for(p)
            if r is None:
                continue
            cand = (r, y, p)
            if best is None:
                best = cand
                continue
            if r < best[0]:
                best = cand
            elif r == best[0] and len(p.name) < len(best[2].name):
                best = cand
        if best is not None and best[0] == 0:
            break
    if best is None:
        return None, None
    return best[1], best[2]


def discover_urls(text: str) -> list[tuple[str, str, str]]:
    found: list[tuple[str, str, str]] = []
    for pat in URL_PATTERNS:
        for m in pat.finditer(text):
            found.append((m.group(1), m.group(2), urllib.parse.unquote(m.group(3))))
    return found


def ensure_placeholder():
    OUT_IMG.parent.mkdir(parents=True, exist_ok=True)
    if PLACEHOLDER.exists():
        return
    try:
        from PIL import Image

        img = Image.new("RGB", (1200, 630), (37, 99, 235))
        img.save(PLACEHOLDER, "JPEG", quality=85)
    except Exception:
        PLACEHOLDER.write_bytes(
            b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9"
        )


def copy_mapped_image(
    src: Path, year: str, url_cache: dict[str, str], source_url: str
) -> str:
    """Copy to assets/images/blog/{year}/{name}; return site-relative posix path."""
    if source_url in url_cache:
        return url_cache[source_url]
    dest_dir = OUT_IMG / year
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_name = src.name
    dest = dest_dir / dest_name
    if not dest.exists():
        shutil.copy2(src, dest)
    elif dest.stat().st_size != src.stat().st_size:
        stem, suf = os.path.splitext(dest_name)
        n = 2
        while True:
            alt = dest_dir / f"{stem}-{n}{suf}"
            if not alt.exists():
                shutil.copy2(src, alt)
                dest = alt
                break
            n += 1
    rel = f"assets/images/blog/{year}/{dest.name}".replace("\\", "/")
    url_cache[source_url] = rel
    return rel


def rewrite_content(html: str, url_cache: dict[str, str], placeholder: str) -> str:
    keys = sorted(url_cache.keys(), key=len, reverse=True)
    for u in keys:
        html = html.replace(u, url_cache[u])
    for pat in URL_PATTERNS:
        for m in list(pat.finditer(html)):
            full = m.group(1)
            if full not in url_cache:
                html = html.replace(full, placeholder)
    return html


def parse_xml():
    attachments: dict[str, str] = {}
    raw_posts: list[dict] = []

    for event, elem in ET.iterparse(XML_PATH, events=("end",)):
        if not elem.tag.endswith("item"):
            continue

        pt = gettext(elem, "wp:post_type")
        if pt == "attachment":
            pid = gettext(elem, "wp:post_id")
            url = None
            au = elem.find("wp:attachment_url", NS)
            if au is not None and au.text:
                url = au.text.strip()
            if not url:
                guid = elem.find("guid")
                if guid is not None and guid.text:
                    url = guid.text.strip()
            if pid and url:
                attachments[pid] = url
            elem.clear()
            continue

        if pt != "post":
            elem.clear()
            continue

        status = gettext(elem, "wp:status")
        if status != "publish":
            elem.clear()
            continue

        title_el = elem.find("title")
        title_text = (
            title_el.text.strip()
            if title_el is not None and title_el.text
            else "Untitled"
        )

        content_el = elem.find("content:encoded", NS)
        content_raw = content_el.text if content_el is not None and content_el.text else ""

        excerpt_el = elem.find("excerpt:encoded", NS)
        excerpt_raw = excerpt_el.text if excerpt_el is not None and excerpt_el.text else ""

        post_id = gettext(elem, "wp:post_id")
        post_date = gettext(elem, "wp:post_date")
        raw_name = gettext(elem, "wp:post_name")
        post_name = urllib.parse.unquote(raw_name)

        meta = postmeta_dict(elem)
        thumb_id = meta.get("_thumbnail_id", "").strip()
        thumb_url = attachments.get(thumb_id) if thumb_id.isdigit() else None

        cats, tags = categories_and_tags(elem)

        raw_posts.append(
            {
                "post_id": post_id,
                "title": title_text,
                "post_name": post_name,
                "post_date": post_date,
                "content_raw": content_raw,
                "excerpt_raw": excerpt_raw,
                "thumb_url": thumb_url,
                "categories": cats,
                "tags": tags,
            }
        )
        elem.clear()

    return attachments, raw_posts


def main():
    ensure_placeholder()
    OUT_DATA.mkdir(parents=True, exist_ok=True)
    OUT_POSTS.mkdir(parents=True, exist_ok=True)

    print("Parsing XML…")
    attachments, raw_posts = parse_xml()
    print(f"  Published posts: {len(raw_posts)}")

    year_files = build_year_file_index()
    total_media_files = sum(len(v) for v in year_files.values())
    print(f"  Media index: {total_media_files} files across {len(year_files)} years")

    url_cache: dict[str, str] = {}
    missing_urls: list[str] = []
    PLACEHOLDER_REL = "assets/images/blog-placeholder.jpg".replace("\\", "/")

    def resolve_url(source_url: str, year_hint: str | None, fname: str) -> str:
        if source_url in url_cache:
            return url_cache[source_url]
        y, pth = find_media_file(year_files, year_hint, fname)
        if pth is None:
            missing_urls.append(source_url)
            url_cache[source_url] = PLACEHOLDER_REL
            return PLACEHOLDER_REL
        assert y is not None
        return copy_mapped_image(pth, y, url_cache, source_url)

    # Collect all URLs
    all_url_tuples: list[tuple[str, str, str]] = []
    for p in raw_posts:
        all_url_tuples.extend(discover_urls(p["content_raw"]))
        if p["thumb_url"]:
            all_url_tuples.extend(discover_urls(p["thumb_url"]))

    seen_resolve: set[str] = set()
    print("Resolving media URLs…")
    for u, y, fn in all_url_tuples:
        if u in seen_resolve:
            continue
        seen_resolve.add(u)
        resolve_url(u, y, fn)

    # Format dates & slugs
    used_slugs: set[str] = set()
    posts_out: list[dict] = []
    duplicate_slug_notes: list[str] = []

    for i, rp in enumerate(
        sorted(
            raw_posts,
            key=lambda x: x["post_date"] or "",
            reverse=True,
        ),
        start=1,
    ):
        base = slugify(rp["post_name"]) or slugify(rp["title"])
        if not base:
            base = "post"
        slug = base
        if slug in used_slugs:
            pid = (rp["post_id"] or str(i)).strip() or str(i)
            slug = f"{base}-{pid}"
        n = 2
        while slug in used_slugs:
            slug = f"{base}-{n}"
            n += 1
        if slug != base:
            duplicate_slug_notes.append(f"{rp['title'][:80]} -> {slug}")
        used_slugs.add(slug)

        dt = None
        formatted = ""
        date_iso = ""
        try:
            dt = datetime.strptime(rp["post_date"], "%Y-%m-%d %H:%M:%S")
            formatted = dt.strftime("%B %d, %Y")
            date_iso = dt.strftime("%Y-%m-%d")
        except Exception:
            formatted = rp["post_date"][:10] if rp["post_date"] else ""
            date_iso = formatted[:10] if formatted else ""

        excerpt_text = strip_tags(rp["excerpt_raw"])
        if excerpt_text:
            card_excerpt = excerpt_text[:150] + ("…" if len(excerpt_text) > 150 else "")
        else:
            plain = strip_tags(rp["content_raw"])
            card_excerpt = plain[:150] + ("…" if len(plain) > 150 else "")

        content_sanitized = sanitize_html(rp["content_raw"])
        content_local = rewrite_content(
            content_sanitized, url_cache, PLACEHOLDER_REL
        )

        feat = PLACEHOLDER_REL
        has_img = False
        if rp["thumb_url"]:
            for u, y, fn in discover_urls(rp["thumb_url"]):
                if u in url_cache:
                    feat = url_cache[u]
                    has_img = feat != PLACEHOLDER_REL
                    break
            if feat == PLACEHOLDER_REL and rp["thumb_url"]:
                # try resolve thumb URL directly
                for pat in URL_PATTERNS:
                    m = pat.search(rp["thumb_url"])
                    if m:
                        resolve_url(m.group(1), m.group(2), m.group(3))
                        feat = url_cache.get(m.group(1), PLACEHOLDER_REL)
                        has_img = feat != PLACEHOLDER_REL
                        break

        if feat == PLACEHOLDER_REL:
            # first img in content
            m = re.search(
                r'src=["\'](assets/images/blog/[^"\']+)["\']',
                content_local,
                re.I,
            )
            if m:
                feat = m.group(1)
                has_img = True

        posts_out.append(
            {
                "id": i,
                "slug": slug,
                "title": rp["title"],
                "date": date_iso,
                "formattedDate": formatted,
                "excerpt": card_excerpt,
                "content": content_local,
                "categories": rp["categories"],
                "tags": rp["tags"],
                "featuredImage": feat,
                "hasImage": has_img,
            }
        )

    posts_json = OUT_DATA / "posts.json"
    print(f"Writing {posts_json}…")
    with open(posts_json, "w", encoding="utf-8") as f:
        json.dump({"posts": posts_out}, f, ensure_ascii=False, separators=(",", ":"))

    POST_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="../">
  <title>{title_esc} | Chronicle | Amir Hashmi</title>
  <meta name="description" content="{desc_esc}">
  <link rel="canonical" href="https://amirhashmi.com/chronicle/{slug}.html">
  <link rel="stylesheet" href="assets/css/style.css">
  <meta name="theme-color" content="#2563EB">
  <style>
    .blog-post-wrap {{ max-width: 820px; margin: 0 auto; }}
    .blog-post-meta {{ font-size: 0.9rem; color: var(--amber); font-weight: 600; margin-bottom: 16px; }}
    .blog-post-hero-img {{ width: 100%; border-radius: var(--r-xl); margin-bottom: 28px; border: 1px solid var(--border); }}
    .blog-content {{ font-size: 1rem; color: var(--text-2); line-height: 1.8; }}
    .blog-content img {{ max-width: 100%; height: auto; border-radius: var(--r); }}
    .blog-content iframe {{ max-width: 100%; }}
    .blog-badges {{ display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0; }}
    .blog-badge {{ display: inline-block; padding: 4px 12px; border-radius: var(--r-full); font-size: 0.72rem; font-weight: 700; background: rgba(37,99,235,0.08); color: var(--blue); border: 1px solid var(--border); }}
    .blog-back {{ margin-top: 40px; }}
  </style>
</head>
<body>
<div id="progress-bar"></div>
<div id="site-header-inject"></div>

<main id="main-content">
  <section class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>
        <span class="breadcrumb-sep">&gt;</span>
        <a href="chronicle.html">Chronicle</a>
        <span class="breadcrumb-sep">&gt;</span>
        <span aria-current="page">Post</span>
      </nav>
      <div class="blog-post-wrap">
        <h1 class="page-title" style="text-align:left;">{title_esc}</h1>
        <p class="blog-post-meta">{date_esc}</p>
        {hero_img}
        <div class="blog-badges">{cat_badges}{tag_badges}</div>
        <div class="card" style="margin-top:8px;">
          <div class="card-body blog-content">
{content_html}
          </div>
        </div>
        <p class="blog-back"><a href="chronicle.html" class="btn btn-outline btn-lg">&larr; Back to Chronicle</a></p>
      </div>
    </div>
  </section>
</main>

<div id="site-footer-inject"></div>
<script src="assets/js/components.js"></script>
<script src="assets/js/core.js"></script>
</body>
</html>
"""

    print("Writing post HTML files…")
    for old in OUT_POSTS.glob("*.html"):
        old.unlink()
    for p in posts_out:
        slug = p["slug"]
        content_html = p["content"]
        # Indent content for readability inside div
        body_lines = "\n".join(
            "            " + line if line.strip() else ""
            for line in content_html.splitlines()
        )
        cat_badges = "".join(
            f'<span class="blog-badge">{html_module.escape(c)}</span>'
            for c in p["categories"]
        )
        tag_badges = "".join(
            f'<span class="blog-badge" style="opacity:0.9;">{html_module.escape(t)}</span>'
            for t in p["tags"][:12]
        )
        hero = ""
        fi = p["featuredImage"]
        if fi and fi != PLACEHOLDER_REL:
            src = fi
            hero = (
                f'<img class="blog-post-hero-img reveal" src="{html_module.escape(src)}" '
                f'alt="" loading="lazy" width="1200" height="630">'
            )

        desc = strip_tags(p["excerpt"])[:160]
        html_page = POST_TEMPLATE.format(
            title_esc=html_module.escape(p["title"]),
            desc_esc=html_module.escape(desc),
            slug=html_module.escape(slug),
            date_esc=html_module.escape(p["formattedDate"]),
            hero_img=hero,
            cat_badges=cat_badges,
            tag_badges=tag_badges,
            content_html=body_lines,
        )
        (OUT_POSTS / f"{slug}.html").write_text(html_page, encoding="utf-8")

    report = {
        "postCount": len(posts_out),
        "imagesCopiedUnique": len(url_cache),
        "missingImageUrls": sorted(set(missing_urls)),
        "postsWithNonDefaultSlug": len(duplicate_slug_notes),
        "placeholderRelative": PLACEHOLDER_REL,
    }
    (OUT_DATA / "chronicle-import-report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )

    # Sitemap fragment
    lines = [
        "  <url>\n    <loc>https://amirhashmi.com/chronicle.html</loc>\n"
        "    <lastmod>2026-05-02</lastmod>\n    <changefreq>weekly</changefreq>\n"
        "    <priority>0.85</priority>\n  </url>"
    ]
    for p in posts_out:
        lines.append(
            f"  <url>\n    <loc>https://amirhashmi.com/chronicle/{p['slug']}.html</loc>\n"
            f"    <lastmod>{p['date']}</lastmod>\n"
            f"    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>"
        )
    (OUT_DATA / "chronicle-sitemap-snippet.xml").write_text(
        "\n".join(lines), encoding="utf-8"
    )

    print("Done.")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
