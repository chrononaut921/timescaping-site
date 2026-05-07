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
