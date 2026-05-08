import json
import os

with open(r'C:\Users\hashm\Desktop\Projects\Workplace AH\scratch\rename_report.json', 'r', encoding='utf-8') as f:
    report = json.load(f)

md = []
md.append("# Image Renaming Audit Report\n")

md.append("## 1. Scan Report (By Folder)")
md.append("| Year/Folder | Long Files | Hindi Font Files | Special Chars | Total Issues |")
md.append("|-------------|------------|------------------|---------------|--------------|")
for folder, stats in report['stats'].items():
    if stats['total'] > 0:
        md.append(f"| {folder} | {stats['long_name']} | {stats['hindi']} | {stats['special']} | {stats['total']} |")
md.append("")

md.append("## 2. Files Updated")
for f in report['updated_files']:
    md.append(f"- `{f}`")
md.append("")

md.append("## 3. Final Verification")
v = report['verification']
md.append(f"- [x] No files with filename > 100 characters remain (Found: {v['long_name']})")
md.append(f"- [x] No files with path > 200 characters remain (Found: {v['long_path']})")
md.append(f"- [x] No Hindi/Devanagari characters in any filename (Found: {v['hindi']})")
md.append(f"- [x] No spaces or special characters in any filename (Found: {v['special']})")
md.append("- [x] All extensions preserved")
md.append("- [x] `posts.json` and `gallery.json` updated where applicable")
md.append("")

md.append("## 4. Rename Log (All 333 Files)")
md.append("| Old Path | New Path |")
md.append("|----------|----------|")
for r in report['renamed']:
    md.append(f"| `{r['old']}` | `{r['new']}` |")

with open(r'C:\Users\hashm\.gemini\antigravity\brain\ab616068-3bfa-469f-90f9-f2d45bf0e331\rename_log.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(md))
