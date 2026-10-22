# NexMusic — Landing Page

Landing page for **NexMusic**, a desktop music streaming app by **NexApp**.
Static site — no build step, no dependencies. Just HTML, CSS, and JS.

## Structure
```
index.html                  → home page
privacy-policy.html         → Privacy Policy
terms-and-conditions.html   → Terms & Conditions
style.css                   → design system + styles (light + dark theme)
script.js                   → theme toggle, nav, 3D tilt, pinned-player scroll scene, live player (no libraries)
assets/                     → optimized logo, cover art, favicon, icons
assets/fonts/               → Sora + Inter, self-hosted & subset (no Google Fonts request)
vercel.json                 → cache + security headers
```

The "Get NexMusic" / "Get the app" buttons link out to
`https://nexappog.vercel.app/nexmusic`. Update that URL in `index.html`,
`privacy-policy.html`, and `terms-and-conditions.html` if it ever changes.

The Privacy Policy and Terms & Conditions are original starting-point drafts —
have them reviewed before relying on them for App Store / Play Store submission
or other legal compliance.

## What's new (v2)
- **Speed:** removed GSAP (~115 KB) and Google Fonts; fonts are self-hosted (31 KB total), images resized, total first load ≈ 160 KB. CLS 0.
- **Animation:** aurora hero, word-by-word headline, smoothed 3D tilt, animated bento feature cards with cursor spotlight, scroll progress bar, pinned 3D "Now playing" scene, live player (waveform, timer, lyrics, click-to-seek), CTA section.
- **Dark mode:** toggle in the nav; follows the system setting by default and remembers the choice.
- Infinite animations pause when off-screen; `prefers-reduced-motion` is respected; mobile gets a flat static player.

## Deploy on Vercel (from GitHub)

1. Push this folder to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "NexMusic landing page"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework preset: **Other** (static site) — no build command, no output directory needed.
4. Click **Deploy**. Your site goes live at `https://<repo-name>.vercel.app`.

That's it — every future push to `main` auto-deploys.

## Local preview
Just open `index.html` in a browser, or run a tiny local server:
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080`.

## Customize
- Replace the download button `href="#"` in `index.html` (Download section) with your real installer link once it's hosted somewhere.
- Social links in the footer are placeholders — update the `href="#"` values.
- Colors, type, and spacing are all defined as CSS variables at the top of `style.css`.
