// NexMusic landing page interactions

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- sticky nav shadow ---------- */
const nav = document.getElementById('nav');
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 8);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- mobile menu ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

/* ---------- player preview: toggle play state ---------- */
const playBtn = document.querySelector('.play-btn');
if (playBtn) {
  let playing = true;
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.innerHTML = playing
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l12-7z"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    document.querySelectorAll('.player-eq span').forEach(bar => {
      bar.style.animationPlayState = playing ? 'running' : 'paused';
    });
  });
}

/* ---------- like button toggle ---------- */
const likeBtn = document.querySelector('.player-like');
if (likeBtn) {
  likeBtn.addEventListener('click', () => {
    likeBtn.classList.toggle('liked');
    likeBtn.style.color = likeBtn.classList.contains('liked') ? 'var(--pink)' : '';
  });
}
