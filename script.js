/* NexMusic landing page — tiny, dependency-free interactions (≈6 KB).
   No GSAP: scroll scenes run on one rAF-throttled scroll handler,
   reveals use IntersectionObserver, and infinite CSS animations are
   paused automatically when their section is off-screen. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);

  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- theme toggle ---------- */
  const themeBtn = $('#themeToggle');
  const themeMeta = $('#themeColor');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    if (themeMeta) themeMeta.content = next === 'dark' ? '#07070f' : '#f6f7fd';
    try { localStorage.setItem('nx-theme', next); } catch (e) {}
  });

  /* ---------- mobile menu ---------- */
  const navToggle = $('#navToggle'), navLinks = $('#navLinks');
  const setMenu = open => {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
    $$('a', navLinks).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- reveal on scroll + pause off-screen animations ---------- */
  if ('IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver((entries, io) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('[data-fade]').forEach(el => revealIO.observe(el));

    const pauseIO = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('is-off', !e.isIntersecting));
    }, { rootMargin: '120px 0px' });
    $$('[data-pause]').forEach(el => pauseIO.observe(el));

    /* active nav link */
    const links = navLinks ? $$('a[href*="#"]', navLinks) : [];
    const map = new Map();
    links.forEach(a => { const id = a.getAttribute('href').split('#')[1]; const s = id && document.getElementById(id); if (s && a.pathname === location.pathname) map.set(s, a); });
    if (map.size) {
      const navIO = new IntersectionObserver(entries => {
        entries.forEach(e => { const a = map.get(e.target); if (a) a.classList.toggle('is-active', e.isIntersecting); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      map.forEach((_, s) => navIO.observe(s));
    }
  } else {
    $$('[data-fade]').forEach(el => el.classList.add('in'));
  }

  /* ---------- hero 3D tilt (smoothed) ---------- */
  const tiltInner = $('#tiltInner');
  if (tiltInner && finePointer && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, heroVisible = true;
    const step = () => {
      cx = lerp(cx, tx, 0.08); cy = lerp(cy, ty, 0.08);
      tiltInner.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      raf = (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) ? requestAnimationFrame(step) : 0;
    };
    const kick = () => { if (!raf && heroVisible) raf = requestAnimationFrame(step); };
    addEventListener('mousemove', e => {
      tx = (e.clientX / innerWidth - 0.5) * 30;
      ty = (0.5 - e.clientY / innerHeight) * 30;
      kick();
    }, { passive: true });
    document.addEventListener('mouseleave', () => { tx = ty = 0; kick(); });
    const hero = $('.hero');
    if (hero && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
  }

  /* ---------- bento spotlight ---------- */
  const bento = $('#bento');
  if (bento && finePointer) {
    let pend = null, raf = 0;
    bento.addEventListener('pointermove', e => {
      const card = e.target.closest('.bcard'); if (!card) return;
      pend = { card, x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0; const r = pend.card.getBoundingClientRect();
        pend.card.style.setProperty('--mx', (pend.x - r.left) + 'px');
        pend.card.style.setProperty('--my', (pend.y - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ---------- player: live playback simulation ---------- */
  const card = $('#playerCard');
  const playBtn = $('#pcPlayBtn');
  const DUR = 222;                 // 3:42
  let t = 74, playing = false, userPaused = false, inView = false, last = 0, lastTick = -1, rafP = 0;
  const played = $('#pcPlayed'), thumb = $('#pcThumb'), cur = $('#pcCur'), scrub = $('#pcScrub');
  const lyrics = $$('.lyric');
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  const paint = () => {
    const p = t / DUR;
    played.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`;
    thumb.style.left = (p * 100).toFixed(2) + '%';
    cur.textContent = fmt(t);
    if (lyrics.length) {
      const idx = Math.floor(t / 3.2) % lyrics.length;
      lyrics.forEach((l, i) => l.classList.toggle('is-active', i === idx));
    }
  };
  const loop = now => {
    if (!playing) { rafP = 0; return; }
    t += Math.min((now - last) / 1000, 0.1); last = now;
    if (t >= DUR) t = 0;
    const k = Math.floor(t * 10);
    if (k !== lastTick) { lastTick = k; paint(); }
    rafP = requestAnimationFrame(loop);
  };
  const setPlaying = on => {
    playing = on;
    card.classList.toggle('is-playing', on);
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    if (on && !rafP) { last = performance.now(); rafP = requestAnimationFrame(loop); }
  };

  if (card && playBtn && played && thumb && cur) {
    paint();
    playBtn.addEventListener('click', () => { userPaused = playing; setPlaying(!playing); });
    scrub.addEventListener('pointerdown', e => {
      const seek = ev => { const r = scrub.getBoundingClientRect(); t = clamp((ev.clientX - r.left) / r.width, 0, 1) * DUR; paint(); };
      seek(e);
      const move = ev => seek(ev);
      const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
      addEventListener('pointermove', move); addEventListener('pointerup', up);
    });

    /* auto-play (visually) while the player is on screen, unless the visitor paused it */
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (inView && !userPaused) setPlaying(true); else if (!inView) setPlaying(false);
      }, { threshold: 0.35 }).observe(card);
    }
  }

  const like = $('#pcLike');
  if (like) like.addEventListener('click', () => {
    const on = like.classList.toggle('liked'); like.setAttribute('aria-pressed', on);
  });
  const lyricsBtn = $('#lyricsToggle'), visual = $('#pcVisual');
  if (lyricsBtn && visual) lyricsBtn.addEventListener('click', () => {
    const on = visual.classList.toggle('show-lyrics'); lyricsBtn.setAttribute('aria-pressed', on);
  });
  $$('[data-toggle]').forEach(b => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  }));

  /* ---------- one scroll handler: progress bar, nav shadow, pinned 3D scene ---------- */
  const bar = $('#progress'), nav = $('#nav');
  const pinWrap = $('#playerPinWrap'), halo = $('#playerHalo');
  const chips = [[$('.chip-queue'), -40, -50], [$('.chip-quality'), 40, -24], [$('.chip-device'), -30, 40]];
  const sceneOn = () => pinWrap && card && innerWidth > 720 && !reduce;
  let cardH = 0, ticking = false;
  const measure = () => { if (card) cardH = card.offsetHeight; };

  const update = () => {
    ticking = false;
    const y = scrollY, max = root.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0})`;
    if (nav) nav.classList.toggle('scrolled', y > 12);

    if (!sceneOn()) return;
    const r = pinWrap.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return;       // far away: skip work
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    const k = ease(clamp(p * 1.7, 0, 1));
    const fit = cardH ? Math.min(1, (innerHeight - 40) / cardH) : 1;
    card.style.transform = `rotateY(${lerp(-24, 0, k).toFixed(2)}deg) rotateX(${lerp(8, 0, k).toFixed(2)}deg) scale(${(lerp(.9, 1, k) * fit).toFixed(4)})`;
    if (halo) {
      halo.style.opacity = clamp(p * 2.2, 0, 1).toFixed(3);
      halo.style.transform = `scale(${lerp(.7, 1.12, k).toFixed(3)}) rotate(${(p * 120).toFixed(1)}deg)`;
    }
    const cp = ease(clamp((p - 0.3) / 0.45, 0, 1));
    chips.forEach(([el, dx, dy]) => {
      if (!el) return;
      el.style.opacity = cp.toFixed(3);
      el.style.transform = `translate3d(${((1 - cp) * dx).toFixed(1)}px,${((1 - cp) * dy).toFixed(1)}px,0) scale(${lerp(.9, 1, cp).toFixed(3)})`;
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { measure(); if (!sceneOn() && card) { card.style.transform = ''; chips.forEach(([el]) => { if (el) { el.style.opacity = ''; el.style.transform = ''; } }); } onScroll(); });
  measure(); update();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); update(); });
})();
