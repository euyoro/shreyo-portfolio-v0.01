# Changelog

All notable changes to this portfolio will be documented here.
Format: version · date · what changed and why.

---

## v0.01 — 2026-09-02

**Initial deploy**

- First public release of portfolio to `euyoro.github.io`
- 7 pages: index, about, Competitor Hub, Rent Reporting, Identity Protection, Bright Blueprint, Sauron & Bright Naming
- Self-hosted HK Grotesk (Medium + SemiBold), inlined as base64 — works on `file://` and deployed
- Local assets only: no external requests, no CDN, no framework
- Dark-default with light theme via `prefers-color-scheme` + `data-theme` toggle
- Lightbox, section deep links, scroll-reveal, print stylesheet
- Video: Sauron (autoplay loop), Atlas (click-to-play) — VP9/WebM + H.264/MP4

**Open items carried into v0.02**
- og:image URLs are relative — need absolute URL once custom domain is set
- "3 days" vs "3 weeks" Competitor Hub timeline — needs Shreyo to confirm
- Second credit bureau name (EFX = Equifax or Experian?)
- Figma plugin community links (currently 404, org-scoped)
- SOT "~70% incorrect" measurement context
- canonical links not yet added (domain was unknown at build time)
