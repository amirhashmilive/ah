# IJMEER Website

## International Journal of Multidisciplinary Explication and Emerging Research

A world-class, production-ready academic journal website built with pure HTML, CSS, and JavaScript.

### Features

- ✅ **Automatic Quarterly Timeline** - All deadlines calculated client-side, no manual updates ever needed
- ✅ **Premium Academic Design** - Nature/Elsevier/Science level quality
- ✅ **Fully Responsive** - Mobile-first approach
- ✅ **Fast Loading** - Static site, optimized for Lighthouse 90+
- ✅ **All 25+ Pages** - Complete navigation structure
- ✅ **DOAJ Integration** - Search widget included
- ✅ **Citation Management** - APA, MLA, Chicago formats with copy functionality
- ✅ **Google Analytics & Tag Manager** - Integrated on all pages
- ✅ **Social Media Links** - All active profiles linked

### Deployment

#### GitHub Pages (Recommended)

1. Fork or clone this repository
2. Go to repository Settings → Pages
3. Select "main" branch and "/ (root)" folder
4. Click Save
5. Your site will be live at `https://yourusername.github.io/ijmeer/`

#### Traditional Hosting

Upload all files to your web server's public_html or www directory.

### Updating Content

#### Adding New Papers (papers.json)

Edit `data/papers.json`:

```json
{
  "id": 16,
  "title": "Your Paper Title",
  "authors": ["Author Name 1", "Author Name 2"],
  "year": 2025,
  "volume": 1,
  "issue": 3,
  "subject": "Physics",
  "citation_count": 0,
  "pdf_url": "#",
  "abstract": "Paper abstract here..."
}
```

#### Adding New Issues (issues.json)

Edit `data/issues.json`:

```json
{
  "id": 5,
  "volume": 2,
  "issue": 1,
  "quarter": "Jan-Mar",
  "year": 2025,
  "title": "Volume 2, Issue 1",
  "theme": "Theme for this issue",
  "description": "Issue description",
  "publication_date": "2025-04-25",
  "status": "published",
  "papers": [16, 17, 18]
}
```

### Quarterly Timeline (Automatic)

| Quarter | Deadline | Publication |
|---------|----------|-------------|
| Jan-Mar | March 15 | April 25-30 |
| Apr-Jun | June 15 | July 25-31 |
| Jul-Sep | September 15 | October 25-31 |
| Oct-Dec | December 15 | January 25-31 |

The website automatically:
- Shows current submission status (Open/Late/Closed)
- Displays countdown to deadline
- Applies late fee warning after deadline
- Updates all dates based on server date

### File Structure

```
ijmeer/
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

- Email: ijmeerj@gmail.com
- Editor: editor@ijmeer.com
- WhatsApp: +91 98261 21177

### Publisher

Published by **Meer Foundation**  
https://www.meerfoundation.co.in/

---

© 2025 IJMEER - International Journal of Multidisciplinary Explication and Emerging Research
