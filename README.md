## Amir Hashmi — Official Website

Static site for Amir Hashmi (Actor, Singer, Filmmaker, Author, Philanthropist).

### Pages

- `index.html` — homepage
- `films.html` — films & videos
- `music.html` — music
- `books.html` — books
- `initiative.html` — Bolti Nadi / initiatives
- `chronicle.html` — blog archive (modal-based, loads `data/posts.json`)
- `news.html` — news / updates
- `book-now.html` — booking
- `404.html` — not found

### Local development

Because the Chronicle page fetches JSON, run a local server from the project folder (opening `file://` may block fetch):

```bash
npx serve
```

### Deployment

Upload the entire folder to your web host’s public directory, or deploy via GitHub Pages. Ensure `data/posts.json` and `assets/images/blog/` are included in whatever you publish.
| Oct-Dec | December 15 | January 25-31 |

The website automatically:
- Shows current submission status (Open/Late/Closed)
- Displays countdown to deadline
- Applies late fee warning after deadline
- Updates all dates based on server date

### File Structure

```
/
├── index.html
├── about.html
├── editorial-board.html
├── most-cited.html
├── contact.html
├── all-issues.html
├── latest-issue.html
├── fees.html
├── submitting.html
├── review-process.html
├── ethics.html
├── open-access.html
├── privacy.html
├── data/
│   ├── papers.json
│   ├── issues.json
│   └── config.json
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── main.js
└── README.md
```

### Technologies Used

- HTML5 (semantic markup)
- CSS3 (custom properties, Grid, Flexbox)
- JavaScript (ES6+, vanilla)
- Google Fonts (Inter, Playfair Display)
- SVG icons (inline)

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

### Contact

- Email: j@gmail.com
- Editor: editor@.com
- WhatsApp: +91 98261 21177

### Publisher

Published by **Meer Foundation**  
https://www.meerfoundation.co.in/

---

### Backup System

**⚠️ MANDATORY: Run backup before any significant change (12-hour rule).**

**Run backup:**
```powershell
.\backup.ps1 -CommitMessage "description-of-change"
```

**Storage location:**
```
C:\Users\hashm\Desktop\Projects\backup\ah\
```

**Filename format:** `YYYY-MM-DD_HHMM_commit-message.zip`  
Example: `2026-05-09_0215_homepage-update.zip`

**Restore:**  
Extract the desired `.zip` file from the backup folder and copy its contents back into the project root.

**12-Hour Rule:**  
If the last backup in `backup\ah\` is older than 12 hours, run `backup.ps1` before proceeding with any edits.

**For AI Agents:** Check `backup\ah\` for a zip file dated within the last 12 hours. If none exists, run `backup.ps1` first, then proceed with the requested task.

---

© 2025  - 
