# dikos.space

Personal static website. Plain HTML + CSS, no build step, no framework.

## Files

| File         | Purpose                          |
|--------------|----------------------------------|
| `index.html` | The page.                        |
| `style.css`  | Styles (light + dark).           |

## Run locally

Just open `index.html` in a browser. Or serve it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Hosted on **Cloudflare Pages**, connected to this GitHub repo.
Every push to `dev` publishes automatically. No config file needed —
Cloudflare serves the repo root as-is.

Custom domain: `dikos.space` (registered at websupport.sk, DNS pointed at Cloudflare Pages).
