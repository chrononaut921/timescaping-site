// Make everything visible before printing
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  document.querySelectorAll('.anim-line, .anim-para').forEach(el => el.classList.add('is-visible'));
  document.querySelectorAll('.fade-up').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
});

// Intersection Observer for scroll reveal (all sections)
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

// Section 01 — staggered headline + paragraph animation
// Double rAF ensures initial hidden styles are painted before observer checks visibility
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const s1Section = document.querySelector('.s1');
    if (s1Section) {
      const lines = Array.from(s1Section.querySelectorAll('.anim-line'));
      const paras = Array.from(s1Section.querySelectorAll('.anim-para'));

      const s1Observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            lines.forEach((el, i) => {
              setTimeout(() => el.classList.add('is-visible'), i * 150);
            });
            paras.forEach((el, i) => {
              setTimeout(() => el.classList.add('is-visible'), 550 + i * 200);
            });
            s1Observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      s1Observer.observe(s1Section);
    }
  });
});

// Draw a Timescape card: one card at a time, random on load, never the same twice in a row
(function () {
  const deck = document.querySelector('.tc-deck');
  if (!deck) return;
  const cards = Array.from(deck.querySelectorAll('.tc'));
  const btn = document.querySelector('.tc-draw');
  let current = 0;

  function show(i) {
    cards[current].classList.remove('is-active');
    cards[current].setAttribute('aria-hidden', 'true');
    cards[i].classList.add('is-active');
    cards[i].removeAttribute('aria-hidden');
    current = i;
  }
  function randomOther() {
    let i;
    do { i = Math.floor(Math.random() * cards.length); } while (i === current && cards.length > 1);
    return i;
  }

  deck.setAttribute('aria-live', 'off');
  show(randomOther());
  deck.setAttribute('aria-live', 'polite');
  if (btn) {
    btn.hidden = false;
    btn.addEventListener('click', () => show(randomOther()));
  }
})();

// Artefacts lightbox (from-2126 page)
(function () {
  const dialog = document.querySelector('.lightbox');
  const links = Array.from(document.querySelectorAll('.art-link'));
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;
  const img = dialog.querySelector('.lightbox-img');
  const title = dialog.querySelector('.lightbox-title');
  const caption = dialog.querySelector('.lightbox-caption');
  let index = 0;
  let opener = null;

  function render(i) {
    index = (i + links.length) % links.length;
    const a = links[index];
    img.src = a.getAttribute('href');
    img.alt = a.querySelector('img').alt;
    title.textContent = a.dataset.title || '';
    caption.textContent = a.dataset.caption || '';
  }
  links.forEach((a, i) => a.addEventListener('click', (e) => {
    e.preventDefault();
    opener = a;
    render(i);
    dialog.showModal();
    dialog.querySelector('.lightbox-close').focus();
  }));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click', () => render(index - 1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => render(index + 1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') render(index - 1);
    if (e.key === 'ArrowRight') render(index + 1);
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { img.src = ''; if (opener) opener.focus(); });
})();
