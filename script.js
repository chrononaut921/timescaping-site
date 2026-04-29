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
const s1Section = document.querySelector('.s1');

if (s1Section) {
  const lines = Array.from(s1Section.querySelectorAll('.anim-line'));
  const paras = Array.from(s1Section.querySelectorAll('.anim-para'));

  const s1Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Headline: 150ms between each line
        lines.forEach((el, i) => {
          setTimeout(() => el.classList.add('is-visible'), i * 150);
        });
        // Paragraphs: start after headline finishes, 200ms stagger
        paras.forEach((el, i) => {
          setTimeout(() => el.classList.add('is-visible'), 550 + i * 200);
        });
        s1Observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  s1Observer.observe(s1Section);
}
