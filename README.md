# NexMusic — Landing Page

Landing page for **NexMusic**, a desktop music streaming app by **NexApp**.
Static site — no build step, no dependencies. Just HTML, CSS, and JS.

## Structure
```
index.html                  → home page
privacy-policy.html         → Privacy Policy
terms-and-conditions.html   → Terms & Conditions
style.css                   → design system + styles (light theme)
script.js                   → nav, 3D tilt, GSAP ScrollTrigger scroll sequence, player controls
assets/                     → logo, cover art, favicon
assets/vendor/               → GSAP + ScrollTrigger, vendored locally (no external CDN calls)
```

The "Get NexMusic" / "Get the app" buttons link out to
`https://nexappog.vercel.app/nexmusic`. Update that URL in `index.html`,
`privacy-policy.html`, and `terms-and-conditions.html` if it ever changes.

The Privacy Policy and Terms & Conditions are original starting-point drafts —
have them reviewed before relying on them for App Store / Play Store submission
or other legal compliance.

## About the 3D scroll effect
The "Now Playing" section pins in place while you scroll and rotates from an angled
3D perspective into a flat, face-on card, with small info chips popping out in depth
around it. It's built with GSAP ScrollTrigger driving CSS 3D transforms — no WebGL
or 3D models needed. On touch devices (phones/tablets) it gracefully falls back to a
flat, static card so it stays fast and doesn't fight with normal scrolling.

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
