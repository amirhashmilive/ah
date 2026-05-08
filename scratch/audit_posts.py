import json
import os
import sys
from datetime import datetime

file_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\data\posts.json'
project_root = r'C:\Users\hashm\Desktop\Projects\Workplace AH'
report_path = r'C:\Users\hashm\Desktop\Projects\Workplace AH\scratch\audit_report.txt'

def audit():
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"JSON invalid: No. Error: {e}")
        return

    posts = data.get('posts', [])
    total_posts = len(posts)
    
    if not posts:
        print("No posts found in JSON.")
        return

    # 1. Date range and sorting
    dated_posts = []
    missing_dates = []
    for p in posts:
        d_str = p.get('date')
        if d_str:
            try:
                dt = datetime.strptime(d_str, '%Y-%m-%d')
                dated_posts.append((dt, p))
            except:
                missing_dates.append(p.get('id'))
        else:
            missing_dates.append(p.get('id'))

    dated_posts.sort(key=lambda x: x[0])
    
    oldest = dated_posts[0][0].strftime('%Y-%m-%d') if dated_posts else "N/A"
    newest = dated_posts[-1][0].strftime('%Y-%m-%d') if dated_posts else "N/A"

    # 2. Categories
    categories_count = {}
    for p in posts:
        cats = p.get('categories', [])
        if not cats:
            categories_count['[Missing]'] = categories_count.get('[Missing]', 0) + 1
        for cat in cats:
            categories_count[cat] = categories_count.get(cat, 0) + 1

    # 3. Missing/Empty Data
    missing_titles = [p.get('id') for p in posts if not p.get('title')]
    empty_content = [p.get('id') for p in posts if not p.get('content') or len(p.get('content').strip()) == 0]
    missing_images = [p.get('id') for p in posts if not p.get('featuredImage') or p.get('featuredImage') == "assets/images/blog-placeholder.jpg"]
    
    # Broken image paths check
    broken_images = []
    for p in posts:
        img = p.get('featuredImage')
        if img:
            # Strip query params if present (e.g. ?w=1024)
            path_part = img.split('?')[0]
            full_path = os.path.join(project_root, path_part.replace('/', os.sep))
            if not os.path.exists(full_path):
                broken_images.append((p.get('id'), img))

    # 4. Sample Posts
    first_3 = [p[1] for p in dated_posts[:3]]
    last_3 = [p[1] for p in dated_posts[-3:]]
    
    # Most recent in each category
    recent_per_cat = {}
    for dt, p in reversed(dated_posts):
        for cat in p.get('categories', []):
            if cat not in recent_per_cat:
                recent_per_cat[cat] = p

    # Report Generation
    report = []
    report.append("## POSTS SUMMARY")
    report.append(f"- Total posts: {total_posts}")
    report.append(f"- Date range: {oldest} to {newest}")
    if missing_dates:
        report.append(f"- Posts with missing/invalid dates: {len(missing_dates)}")
    if missing_titles:
        report.append(f"- Posts with missing titles: {len(missing_titles)}")
    
    report.append("\n## CATEGORIES SUMMARY")
    report.append("| Category | Post Count |")
    report.append("|----------|------------|")
    for cat, count in sorted(categories_count.items(), key=lambda x: x[1], reverse=True):
        report.append(f"| {cat} | {count} |")

    report.append("\n## MISSING DATA")
    report.append(f"- Posts with empty content: {len(empty_content)}")
    report.append(f"- Posts with missing/placeholder featured images: {len(missing_images)}")
    report.append(f"- Broken image paths (file not found): {len(broken_images)}")
    if broken_images:
        report.append("  Samples of broken paths:")
        for pid, path in broken_images[:5]:
            report.append(f"    - Post ID {pid}: {path}")

    report.append("\n## SAMPLE POSTS")
    report.append("### First 3 (Oldest)")
    for p in first_3:
        report.append(f"- [{p.get('date')}] {p.get('title')[:100]}")
    
    report.append("\n### Last 3 (Newest)")
    for p in reversed(last_3):
        report.append(f"- [{p.get('date')}] {p.get('title')[:100]}")

    report.append("\n### Most recent in each major category")
    for cat, p in sorted(recent_per_cat.items()):
        report.append(f"- {cat}: [{p.get('date')}] {p.get('title')[:100]}")

    report.append("\n## STATUS")
    report.append("- JSON valid: Yes")
    report.append("- Ready for category cleanup: Yes")

    output_report = "\n".join(report)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(output_report)
    
    print("Report written to scratch/audit_report.txt")

if __name__ == "__main__":
    audit()
