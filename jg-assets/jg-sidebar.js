document.addEventListener('bookRendered', () => {
  buildSidebar();
});

function buildSidebar() {
  const chapterList = document.getElementById('jg-chapter-list');
  const sectionList = document.getElementById('jg-section-nav');
  
  // Clear lists
  chapterList.innerHTML = '';
  sectionList.innerHTML = '';

  const chapters = document.querySelectorAll('.jg-chapter');
  
  chapters.forEach(chapter => {
    // Left Sidebar: Chapter
    const titleEl = chapter.querySelector('.jg-chapter-title');
    const title = titleEl ? titleEl.textContent : 'Chapter';
    
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + chapter.id;
    a.textContent = title;
    
    a.addEventListener('click', (e) => {
      e.preventDefault();
      chapter.scrollIntoView({ behavior: 'smooth' });
    });
    
    li.appendChild(a);
    chapterList.appendChild(li);

    // Right Sidebar: Sections
    const sections = chapter.querySelectorAll('.jg-section-title');
    sections.forEach(sec => {
      const sLi = document.createElement('li');
      const sA = document.createElement('a');
      sA.href = '#' + sec.id;
      sA.textContent = sec.textContent;
      
      sA.addEventListener('click', (e) => {
        e.preventDefault();
        sec.scrollIntoView({ behavior: 'smooth' });
      });
      
      sLi.appendChild(sA);
      sectionList.appendChild(sLi);
    });
  });

  // Highlight active item on scroll
  window.addEventListener('scroll', () => {
    let fromTop = window.scrollY + 100;

    const navLinks = document.querySelectorAll('#jg-chapter-list a, #jg-section-nav a');
    
    navLinks.forEach(link => {
      let section = document.querySelector(link.hash);
      
      if (section && section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
}
