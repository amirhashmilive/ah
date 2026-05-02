document.addEventListener('DOMContentLoaded', () => {
  // Load data
  fetch('data/book-content.json')
    .then(res => res.json())
    .then(data => {
      renderBook(data.chapters);
      updateContextMap();
    })
    .catch(err => console.error('Error loading book data:', err));

  // Progress Bar
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    document.getElementById('jg-progress-bar').style.width = scrolled + '%';
    document.getElementById('jg-progress').textContent = Math.round(scrolled);
  });

  // Context Map Modal
  const modal = document.getElementById('jg-context-modal');
  const btn = document.getElementById('jg-context-map-btn');
  const span = document.querySelector('.jg-modal-close');

  btn.onclick = function() {
    modal.style.display = "block";
  }

  span.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  function updateContextMap() {
    fetch('data/keywords.json')
      .then(res => res.json())
      .then(data => {
        let html = '';
        for (const [category, keywords] of Object.entries(data)) {
          html += `<h4 style="text-transform:uppercase; margin-top:1.5rem;">${category.replace('_', ' ')}</h4>`;
          html += `<div style="display:flex; flex-wrap:wrap; gap:8px;">`;
          keywords.forEach(kw => {
            html += `<span style="background:var(--jg-sidebar-bg); padding:4px 10px; border:1px solid var(--jg-border); border-radius:4px; font-size:0.9rem;">${kw}</span>`;
          });
          html += `</div>`;
        }
        document.getElementById('jg-context-results').innerHTML = html;
      });
  }

  function renderBook(chapters) {
    const container = document.getElementById('jg-main-content');
    let html = '';

    chapters.forEach(chapter => {
      html += `<article class="jg-chapter" id="chapter-${chapter.id}">`;
      html += `<h2 class="jg-chapter-title">${chapter.title}</h2>`;

      chapter.sections.forEach((section, sIndex) => {
        const secId = `sec-${chapter.id}-${sIndex}`;
        if (section.heading) {
          html += `<h3 class="jg-section-title" id="${secId}">${section.heading}</h3>`;
        }

        // Chunk paragraphs in groups of 3
        const paras = section.paragraphs;
        let pCount = 0;
        let chunkIndex = 0;
        let imgIndex = 0;

        for (let i = 0; i < paras.length; i++) {
          if (i > 0 && i % 3 === 0) {
            // End of a chunk, add 'Read More' button
            html += `<div class="jg-expand-container" id="expand-container-${chapter.id}-${sIndex}-${chunkIndex}">`;
            html += `<button class="jg-btn" onclick="jgExpandChunk(${chapter.id}, ${sIndex}, ${chunkIndex})">Read More &rarr;</button>`;
            html += `</div>`;
            
            // Start hidden container for next chunk
            html += `<div class="jg-hidden jg-chunk-hidden" id="chunk-${chapter.id}-${sIndex}-${chunkIndex}">`;
            chunkIndex++;
          }
          
          html += `<p class="jg-paragraph">${paras[i]}</p>`;
          pCount++;

          // Image Placeholder after this paragraph if matches
          const placeholders = chapter.imagePlaceholders.filter(ip => ip.position === `after_paragraph_${pCount}`);
          placeholders.forEach(ph => {
            html += `
              <div class="jg-image-placeholder">
                <span class="jg-image-path">${ph.path}</span>
                <strong>[Add Image]</strong><br>
                <em>Prompt: ${ph.prompt}</em>
              </div>
            `;
          });
        }

        // Close any open hidden container
        if (paras.length > 3) {
          html += `<div class="jg-expand-container">`;
          html += `<button class="jg-btn" onclick="jgCollapseSection(${chapter.id}, ${sIndex})">Show Less &uarr;</button>`;
          html += `</div>`;
          html += `</div>`; // Close jg-hidden
        }
      });
      html += `</article>`;
    });

    container.innerHTML = html;

    // Dispatch event so sidebar.js can build navigation
    document.dispatchEvent(new Event('bookRendered'));
  }

  // Global functions for inline onclicks
  window.jgExpandChunk = function(chapId, secId, chunkId) {
    document.getElementById(`expand-container-${chapId}-${secId}-${chunkId}`).style.display = 'none';
    const hiddenChunk = document.getElementById(`chunk-${chapId}-${secId}-${chunkId}`);
    if (hiddenChunk) {
      hiddenChunk.classList.remove('jg-hidden');
      // If there are inner hidden chunks, they remain hidden until their buttons are clicked
    }
  };

  window.jgCollapseSection = function(chapId, secId) {
    // Re-hide all chunks in this section
    const sectionContainer = document.getElementById(`sec-${chapId}-${secId}`);
    // Find parent chapter and re-render or just hide things using querySelectorAll
    // A simpler way: Find all elements with id starting with chunk-chapId-secId
    const chunks = document.querySelectorAll(`[id^="chunk-${chapId}-${secId}-"]`);
    chunks.forEach(c => c.classList.add('jg-hidden'));
    
    const btns = document.querySelectorAll(`[id^="expand-container-${chapId}-${secId}-"]`);
    btns.forEach(b => b.style.display = 'block');

    // Scroll back to section title
    if (sectionContainer) {
      sectionContainer.scrollIntoView({ behavior: 'smooth' });
    }
  };
});
