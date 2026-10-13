"""Serve the working tree for browser checks, including GitHub Pages' 404 flow."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent.parent
PRODUCTION_BASE = '<base href="https://samobrienolinger.github.io/saggart-and-citywest-together/">'


class SiteTestHandler(SimpleHTTPRequestHandler):
    def send_site_404(self, status):
        html = (ROOT / "404.html").read_text(encoding="utf-8")
        # Keep the real content, CSS and scripts, resolving assets to this checkout.
        assert html.count(PRODUCTION_BASE) == 1
        content = html.replace(PRODUCTION_BASE, '<base href="/">').encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(content)

    def do_GET(self):
        if urlsplit(self.path).path == "/404.html":
            self.send_site_404(200)
        else:
            super().do_GET()

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.send_site_404(404)
        else:
            super().send_error(code, message, explain)


if __name__ == "__main__":
    handler = partial(SiteTestHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", 4180), handler) as server:
        print("Serving browser test files on http://127.0.0.1:4180", flush=True)
        server.serve_forever()
