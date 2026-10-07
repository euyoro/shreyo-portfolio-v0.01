# Now playing (YouTube Music)

A tiny serverless function that returns your most recent YouTube Music track as JSON:

```json
{ "title": "…", "artist": "…", "cover": "https://…", "url": "https://music.youtube.com/watch?v=…", "when": "Today" }
```

The portfolio's Xtras section calls it and shows a small pill. YouTube Music has no
public API, so this uses the unofficial `ytmusicapi` library with **your login headers**.
Those headers are a key to your whole Google account: keep them in the host's secret
settings only, never in this repo or in a chat.

## Set up (about 10 minutes)

1. **Export your login headers** (on your own computer, in a terminal):
   ```
   pip install ytmusicapi
   ytmusicapi browser
   ```
   It asks you to paste the request headers from a logged-in music.youtube.com tab
   (the steps are printed: open DevTools → Network → filter `/browse` → right-click a
   POST request → Copy → Copy request headers). It writes `browser.json`.
2. **Create a free Vercel project** from this `now-playing` folder
   (Vercel → Add New → Project → import the repo → set *Root Directory* to `now-playing`).
3. **Add the secret.** Project → Settings → Environment Variables:
   - `YTM_HEADERS` = the full contents of `browser.json`
   - optional `ALLOW_ORIGIN` = your site, e.g. `https://yourdomain.com`
4. **Deploy**, then open `https://<your-project>.vercel.app/api/now-playing`: you should
   see your latest track as JSON.
5. **Point the site at it:** in `index.html` set
   `const NOW_PLAYING_URL = 'https://<your-project>.vercel.app/api/now-playing';`
6. Delete `browser.json` from your computer afterwards (or keep it somewhere private).

## Things to know

- This is unofficial and against YouTube's terms. It can break whenever YouTube changes
  something; the pill simply hides when that happens.
- It shows your *last played* track and a rough "Today / Yesterday / This week", not a
  live "now playing": history has no exact timestamps.
- The login can expire (sign-outs, password changes, Google security checks). If the pill
  disappears, repeat step 1 and update the secret.
- If the headers ever leak, sign out of all sessions in your Google account to invalidate them.
