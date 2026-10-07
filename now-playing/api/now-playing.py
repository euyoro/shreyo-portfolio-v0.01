"""
Last played track from YouTube Music, as a tiny public JSON feed for the portfolio.

Reads your YouTube Music history with the unofficial `ytmusicapi` library, using
login headers that live ONLY in the YTM_HEADERS environment variable on the host
(never in this repo). Returns just the newest track: title, artist, cover, link and
a rough "when" label. Nothing else from your account is exposed.

Deploy: see README.md in this folder.
"""
import json
import os
from http.server import BaseHTTPRequestHandler

from ytmusicapi import YTMusic

ALLOW_ORIGIN = os.environ.get("ALLOW_ORIGIN", "*")   # set to https://your-site.com to lock it down


def pick(item):
    """Shape one history entry into what the site needs."""
    artists = item.get("artists") or []
    thumbs = item.get("thumbnails") or []
    vid = item.get("videoId")
    return {
        "title": item.get("title") or "",
        "artist": ", ".join(a.get("name", "") for a in artists if a.get("name")),
        "cover": thumbs[-1]["url"] if thumbs else None,
        "url": f"https://music.youtube.com/watch?v={vid}" if vid else None,
        # YouTube Music groups history as "Today", "Yesterday", "This week"...
        "when": item.get("played") or "",
    }


def latest():
    headers = os.environ.get("YTM_HEADERS")
    if not headers:
        raise RuntimeError("YTM_HEADERS is not set")
    history = YTMusic(auth=headers).get_history()
    if not history:
        raise RuntimeError("empty history")
    return pick(history[0])


class handler(BaseHTTPRequestHandler):
    def _send(self, code, body, cache):
        data = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", ALLOW_ORIGIN)
        self.send_header("Cache-Control", cache)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", ALLOW_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.end_headers()

    def do_GET(self):
        try:
            # cached at the edge for a minute so the site never hammers YouTube
            self._send(200, latest(), "public, s-maxage=60, stale-while-revalidate=300")
        except Exception:
            # no details on purpose: the page just hides the pill
            self._send(502, {"error": "unavailable"}, "public, s-maxage=30")
