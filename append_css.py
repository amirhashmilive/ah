css_to_append = """
/* Gallery Grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 992px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: 1fr; }
}

.featured-album {
  grid-column: span 2;
}
@media (max-width: 768px) {
  .featured-album { grid-column: span 1; }
}
"""

with open('assets/css/style.css', 'a', encoding='utf-8') as f:
    f.write("\n" + css_to_append)

print("CSS appended to style.css")
