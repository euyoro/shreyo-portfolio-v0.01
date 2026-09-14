# Shreyo Debnath — Portfolio

Personal portfolio for **Shreyo Debnath**, product designer at Bright Money.
Static multi-page HTML. No build step, no framework, no external requests.

**Live:** [euyoro.github.io](https://euyoro.github.io)

---

## Structure

```
index.html                   Home
about.html                   About
work-competitor-hub.html     Case study — Competitor Hub
work-rent-funnel.html        Case study — Rent Reporting
work-identity-protection.html  Case study — Identity Protection
work-bright-blueprint.html   Case study — Bright Blueprint
work-screen-naming-plugin.html Case study — Sauron & Bright Naming

assets/
  styles.css                 All styles
  app.js                     Theme toggle, scroll reveal, lightbox, video
  favicon.svg
  og.png
  fonts/                     HK Grotesk (self-hosted, base64 inlined)
  shots/                     Case study screenshots
  video/                     Demo clips (WebM + MP4)
```

## Running locally

Open any `.html` file directly in a browser — no server needed.
Fonts and video are self-contained and work over `file://`.

For video encoding or contrast testing, serve with a Range-capable server:
```
node rangeserve.js
```

## Deploying

Hosted on GitHub Pages from `main` branch, root folder.
Push to `main` → deploys automatically.

Active work happens on `v0.02` — merge to `main` to publish.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Live, deployed to `euyoro.github.io` |
| `v0.02` | Active development |

## Versioning

See [CHANGELOG.md](CHANGELOG.md) for a full history of changes.
