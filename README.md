# dikos.space

Personal static website. Plain HTML + CSS + a little JS, no build step, no framework.
Terminal theme, cyan accent, light + dark (follows the OS).

## Files

| File          | Purpose                                                  |
|---------------|---------------------------------------------------------|
| `index.html`  | The page.                                               |
| `style.css`   | Terminal styles (light + dark).                         |
| `terminal.js` | Types the "commands" out on load. Add more via `steps`. |
| `CNAME`       | Custom domain for GitHub Pages.                         |

## Adding content

Edit the `steps` array in `terminal.js`. Each entry is one command + its output:

```js
{ cmd: "cat about.txt", out: ["line one", "line two"] }
```

`out` lines may contain HTML (e.g. links). Reduced-motion and no-JS both
fall back to plain text.

## Run locally

Just open `index.html` in a browser. Or serve it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Hosted on **GitHub Pages** (Settings → Pages → deploy from branch `dev`, root).
Every push to `dev` publishes automatically. No build step.

Custom domain: `dikos.space` — registered at websupport.sk, apex DNS
pointed at GitHub Pages' IPs. The `CNAME` file tells Pages which domain to serve.
