# NexMusic — Landing Page

Landing page for **NexMusic**, a desktop music streaming app by **NexApp**.
Static site — no build step, no dependencies. Just HTML, CSS, and JS.

## Structure
```
index.html    → page markup
style.css     → design system + styles
script.js     → nav, scroll reveal, player preview interactions
assets/       → logo, cover art, favicon
```

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
"# NexMusic-Website" 
