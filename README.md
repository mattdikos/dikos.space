# dikos.space

Personal static website. Plain HTML + CSS, no build step, no framework.

## Files

| File         | Purpose                                    |
|--------------|--------------------------------------------|
| `index.html` | The page.                                  |
| `style.css`  | Styles (light + dark).                     |
| `CNAME`      | Custom domain for GitHub Pages.            |

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
