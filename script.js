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

// Section 01 — staggered headline + paragraph animation (fires once, never repeats)
const s1Section = document.querySelector('.s1');

if (s1Section) {
  const s1Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('s1-triggered');
        s1Observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  s1Observer.observe(s1Section);
}
