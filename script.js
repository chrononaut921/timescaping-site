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

  function setFace(card, flipped) {
    card.classList.toggle('is-flipped', flipped);
    const front = card.querySelector('.tc-front'), back = card.querySelector('.tc-back');
    if (!front || !back) return;
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
    const f = front.querySelector('.tc-flip'), u = back.querySelector('.tc-unflip');
    if (f) { f.setAttribute('aria-expanded', String(flipped)); f.tabIndex = flipped ? -1 : 0; }
    if (u) u.tabIndex = flipped ? 0 : -1;
  }
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function turn(card, flipped) {
    if (still) { setFace(card, flipped); focusFace(card, flipped); return; }
    card.classList.remove('turn-in');
    card.classList.add('turn-out');
    setTimeout(() => {
      card.classList.remove('turn-out');
      setFace(card, flipped);
      void card.offsetWidth;
      card.classList.add('turn-in');
      focusFace(card, flipped);
    }, 180);
  }
  function focusFace(card, flipped) {
    const el = card.querySelector(flipped ? '.tc-unflip' : '.tc-flip');
    if (el) el.focus({ preventScroll: true });
  }
  cards.forEach(card => {
    setFace(card, false);
    const f = card.querySelector('.tc-flip'), u = card.querySelector('.tc-unflip');
    if (f) f.addEventListener('click', () => turn(card, true));
    if (u) u.addEventListener('click', () => turn(card, false));
  });

  function show(i, animate) {
    setFace(cards[i], false);
    cards[current].classList.remove('is-active', 'is-in', 'is-hit');
    cards[current].setAttribute('aria-hidden', 'true');
    cards[i].classList.add('is-active');
    cards[i].removeAttribute('aria-hidden');
    if (animate) { void cards[i].offsetWidth; cards[i].classList.add('is-in'); }
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
    btn.addEventListener('click', () => show(randomOther(), true));
  }
  // used by the what-if trailer: draw a specific card and mark it
  window.tsDrawCard = function (i) {
    if (!cards[i]) return;
    if (i !== current) show(i, true);
    cards[i].classList.add('is-hit');
    setTimeout(() => cards[i].classList.remove('is-hit'), 1600);
  };
})();

// What if / then what trailer: rotates through the card pairs, first pair fixed, never two tech cards in a row
(function () {
  const box = document.querySelector('.wi');
  const deck = document.querySelector('.tc-deck');
  if (!box || !deck) return;
  const cards = Array.from(deck.querySelectorAll('.tc'));
  if (cards.length < 2 || !cards[0].dataset.if) return;
  const A = box.querySelector('.wi-a'), B = box.querySelector('.wi-b');
  const L2 = box.querySelector('.wi-line2'), L3 = box.querySelector('.wi-line3');
  const see = box.querySelector('.wi-see'), btn = box.querySelector('.wi-pause');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GLYPHS = '·:/_<>=+*01';
  let cur = 0, timers = [], paused = false, hold = false;

  function later(f, ms) { timers.push(setTimeout(f, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function scramble(el, txt) {
    if (still) { el.textContent = txt; return; }
    const t0 = performance.now(), ms = 450;
    (function step(now) {
      const p = Math.min(1, (now - t0) / ms), n = Math.floor(p * txt.length);
      let s = txt.slice(0, n);
      for (let j = n; j < txt.length && j < n + 10; j++) s += txt[j] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.textContent = p < 1 ? s : txt;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function isTech(i) { return cards[i].dataset.tech === '1'; }
  function nextIndex() {
    let i, tries = 0;
    do { i = Math.floor(Math.random() * cards.length); tries++; }
    while ((i === cur || (isTech(i) && isTech(cur))) && tries < 60);
    return i;
  }
  function schedule() {
    later(() => { if (!paused && !hold && !document.hidden) show(nextIndex()); else schedule(); }, still ? 9000 : 7000);
  }
  function show(i) {
    clear();
    cur = i;
    const c = cards[i];
    L2.classList.remove('on'); L3.classList.remove('on');
    B.textContent = '';
    scramble(A, c.dataset.if);
    later(() => { L2.classList.add('on'); scramble(B, c.dataset.then); }, still ? 0 : 1300);
    later(() => L3.classList.add('on'), still ? 0 : 2600);
    schedule();
  }

  box.classList.add('js');
  L2.classList.add('on'); L3.classList.add('on');
  schedule();

  box.addEventListener('mouseenter', () => { hold = true; });
  box.addEventListener('mouseleave', () => { hold = false; });
  box.addEventListener('focusin', () => { hold = true; });
  box.addEventListener('focusout', () => { hold = false; });
  if (btn) {
    btn.hidden = false;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      paused = !paused;
      btn.textContent = paused ? 'Play' : 'Pause';
      btn.setAttribute('aria-pressed', String(paused));
    });
  }
  if (see) see.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.tsDrawCard) window.tsDrawCard(cur);
    document.getElementById('card').scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
  });
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

// From 2126 hub: a different object and message on each visit; objects change slowly
(function () {
  function pick(sel) {
    const items = Array.from(document.querySelectorAll(sel));
    if (items.length < 2) return null;
    let current = Math.floor(Math.random() * items.length);
    items.forEach((el, i) => el.classList.toggle('is-active', i === current));
    return {
      next() {
        items[current].classList.remove('is-active');
        current = (current + 1) % items.length;
        items[current].classList.add('is-active');
      }
    };
  }
  const arts = pick('.hub-art-item');
  pick('.hub-disp');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panel = document.querySelector('.hub-art');
  if (arts && !still && panel) {
    let paused = false;
    panel.addEventListener('mouseenter', () => { paused = true; });
    panel.addEventListener('mouseleave', () => { paused = false; });
    setInterval(() => { if (!paused && !document.hidden) arts.next(); }, 5000);
  }
})();

// Session photo strip: arrow buttons scroll by most of a screen
(function () {
  const track = document.querySelector('.gallery-track');
  const btns = document.querySelector('.gallery-btns');
  if (!track || !btns) return;
  btns.hidden = false;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  btns.querySelectorAll('.gallery-btn').forEach(b => b.addEventListener('click', () => {
    track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.75, behavior: still ? 'auto' : 'smooth' });
  }));
})();

// Session arc: draw the line from today to 2126 and back once, when it comes into view
(function () {
  const sec = document.querySelector('.s-arc');
  if (!sec || !('IntersectionObserver' in window)) return;
  sec.classList.add('js');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { sec.classList.add('is-drawn'); io.disconnect(); } });
  }, { threshold: 0.35 });
  io.observe(sec);
})();
