// NexMusic landing page — interactions + 3D scroll

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- sticky nav shadow ---------- */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
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

/* ---------- player card: play/pause, like, lyrics toggle ---------- */
const pcPlayBtn = document.getElementById('pcPlayBtn');
if (pcPlayBtn) {
  const iconPlay = pcPlayBtn.querySelector('.icon-play');
  const iconPause = pcPlayBtn.querySelector('.icon-pause');
  let playing = true;
  pcPlayBtn.addEventListener('click', () => {
    playing = !playing;
    iconPlay.style.display = playing ? '' : 'none';
    iconPause.style.display = playing ? 'none' : '';
  });
}

const pcLike = document.getElementById('pcLike');
if (pcLike) {
  pcLike.addEventListener('click', () => pcLike.classList.toggle('liked'));
}

const lyricsToggle = document.getElementById('lyricsToggle');
const pcVisual = document.querySelector('.pc-visual');
if (lyricsToggle && pcVisual) {
  lyricsToggle.addEventListener('click', () => {
    const showing = pcVisual.classList.toggle('show-lyrics');
    lyricsToggle.setAttribute('aria-pressed', showing ? 'true' : 'false');
  });
}

/* ---------- reduced motion check ---------- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

/* =========================================================
   3D HERO TILT — logo reacts to mouse anywhere on the page
   ========================================================= */
const tiltStage = document.getElementById('tiltStage');
const tiltInner = document.getElementById('tiltInner');

if (tiltStage && tiltInner && !prefersReducedMotion && !isCoarsePointer) {
  const maxTilt = 16;

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;   // 0..1 across the whole page
    const y = e.clientY / window.innerHeight;  // 0..1 across the whole page
    const ry = (x - 0.5) * maxTilt * 2;   // rotateY
    const rx = (0.5 - y) * maxTilt * 2;   // rotateX
    tiltInner.style.setProperty('--rx', rx.toFixed(2) + 'deg');
    tiltInner.style.setProperty('--ry', ry.toFixed(2) + 'deg');
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    tiltInner.style.setProperty('--rx', '0deg');
    tiltInner.style.setProperty('--ry', '0deg');
  });
}

/* =========================================================
   3D TILT ON PLATFORM CARDS (download section)
   ========================================================= */
const tiltCards = document.querySelectorAll('[data-tilt]');
if (!prefersReducedMotion && !isCoarsePointer) {
  tiltCards.forEach(card => {
    const maxTilt = 8;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const ty = (x - 0.5) * maxTilt * 2;
      const tx = (0.5 - y) * maxTilt * 2;
      card.style.setProperty('--tx', tx.toFixed(2) + 'deg');
      card.style.setProperty('--ty', ty.toFixed(2) + 'deg');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--tx', '0deg');
      card.style.setProperty('--ty', '0deg');
    });
  });
}

/* =========================================================
   GSAP SCROLLTRIGGER — reveals + pinned 3D player
   ========================================================= */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  /* simple fade-ins */
  document.querySelectorAll('[data-fade]').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => el.classList.add('in'),
      once: true
    });
  });

  /* 3D flip-in feature cards — plays on scroll down, reverses on scroll up */
  const flipCards = gsap.utils.toArray('[data-flip]');
  flipCards.forEach(card => {
    gsap.set(card, { opacity: 0, rotateX: 55, transformOrigin: '50% 100%', y: 30 });
    gsap.to(card, {
      opacity: 1, rotateX: 0, y: 0,
      duration: 0.8, ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play reverse play reverse'
      }
    });
  });

  /* pinned 3D "now playing" scroll sequence — signature interaction */
  const pinWrap = document.getElementById('playerPinWrap');
  const playerStage = document.getElementById('playerStage');
  const playerCard = document.getElementById('playerCard');
  const chipQueue = document.querySelector('.chip-queue');
  const chipQuality = document.querySelector('.chip-quality');
  const chipDevice = document.querySelector('.chip-device');

  if (pinWrap && playerStage && playerCard && window.innerWidth > 720) {
    gsap.set(playerCard, { '--py': '-22deg', '--px': '6deg' });
    gsap.set([chipQueue, chipQuality, chipDevice], { opacity: 0 });

    ScrollTrigger.create({
      trigger: pinWrap,
      start: 'top top',
      end: 'bottom bottom',
      pin: playerStage,
      scrub: 0.6,
      onUpdate: self => {
        const p = self.progress;
        const py = gsap.utils.interpolate(-22, 0, Math.min(p * 1.6, 1));
        const px = gsap.utils.interpolate(6, 0, Math.min(p * 1.6, 1));
        playerCard.style.setProperty('--py', py.toFixed(2) + 'deg');
        playerCard.style.setProperty('--px', px.toFixed(2) + 'deg');

        const chipP = gsap.utils.clamp(0, 1, (p - 0.35) / 0.5);
        [ [chipQueue, -30, -40], [chipQuality, 30, -20], [chipDevice, -20, 30] ].forEach(([chip, dx, dy]) => {
          if (!chip) return;
          chip.style.opacity = chipP;
          chip.style.transform = `translate3d(${(1 - chipP) * dx}px, ${(1 - chipP) * dy}px, 0)`;
        });
      }
    });
  } else if (playerCard) {
    // static fallback for small screens / no GSAP
    playerCard.style.setProperty('--py', '0deg');
    playerCard.style.setProperty('--px', '0deg');
    [chipQueue, chipQuality, chipDevice].forEach(c => { if (c) c.style.opacity = 1; });
  }
}
