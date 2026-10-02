#!/usr/bin/env python3
"""Assemble the self-contained index.html from src/.

Usage: python3 build.py
Only the Python standard library is used. The output inlines all CSS and JS.
"""
import base64
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"

CSS_FILES = ["styles.css", "tour.css", "home.css", "pages.css", "fun.css", "workshops.css", "community.css", "clicky.css", "course.css", "cx.css"]
JS_FILES = [
    "i18n/core.js",
    "content/core.js",
    "content/lessons-1.js",
    "content/lessons-2.js",
    "content/lessons-3.js",
    "content/quizzes.js",
    "content/tour.js",
    "content/kb.js",
    "content/course.js",
    "content/c4-deep-1.js",
    "content/c4-deep-2.js",
    "content/c4-deep-3.js",
    "content/adv-1.js",
    "content/adv-2.js",
    "content/adv-3.js",
    "content/courses.js",
    "content/en/core.js",
    "content/en/lessons-1.js",
    "content/en/lessons-2.js",
    "content/en/lessons-3.js",
    "content/en/quizzes.js",
    "app/util.js",
    "app/store.js",
    "app/icons.js",
    "app/api.js",
    "app/sound.js",
    "app/fx.js",
    "app/demo.js",
    "app/exercises.js",
    "app/lab.js",
    "app/charts.js",
    "app/views.js",
    "app/tour.js",
    "app/home.js",
    "app/automations.js",
    "app/workshops.js",
    "app/feedback.js",
    "app/forum.js",
    "app/cx.js",
    "app/courses.js",
    "app/knowledge.js",
    "app/clicky.js",
    "app/main.js",
]


def read(rel):
    return (SRC / rel).read_text(encoding="utf-8")


MIME = {".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml"}


def inline_assets(html):
    """Embed files from assets/ as data URIs so index.html works on its own."""
    def repl(m):
        path = ROOT / "assets" / m.group(2)
        if not path.exists():
            return m.group(0)
        data = base64.b64encode(path.read_bytes()).decode("ascii")
        return f'{m.group(1)}="data:{MIME[path.suffix]};base64,{data}"'
    return re.sub(r'(src|href)="assets/([\w.-]+\.(?:png|webp|jpg|svg))"', repl, html)


def export_knowledge():
    """Write server/knowledge.json (the AI server's trusted lesson excerpts) with Node, if installed."""
    import shutil
    import subprocess
    if not shutil.which("node"):
        print("note: Node.js not found; server/knowledge.json was not refreshed")
        return
    subprocess.run(["node", str(ROOT / "tools" / "export-knowledge.js")], check=True)


def main():
    template = read("template.html")
    css = "\n".join(read(f) for f in CSS_FILES)
    js = "\n;\n".join(f"/* ---- {f} ---- */\n" + read(f) for f in JS_FILES)
    js = "(function(){\n'use strict';\n" + js + "\n})();"
    if "</script" in js.lower():
        raise SystemExit("A source file contains a literal </script> tag; escape it.")
    out = template.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
    # Content Security Policy: only this exact inline script may run (hash),
    # no plugins, no frames, no foreign scripts. Styles allow inline because
    # the page colours elements with style attributes; fonts come from Google.
    digest = base64.b64encode(hashlib.sha256(("\n" + js + "\n").encode("utf-8")).digest()).decode("ascii")
    csp = ("default-src 'self'; script-src 'sha256-" + digest + "'; "
           "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; "
           "img-src 'self' data: blob:; connect-src 'self'; media-src 'none'; object-src 'none'; frame-src 'none'; "
           "worker-src 'none'; base-uri 'none'; form-action 'self'")
    out = out.replace("<!--__CSP__-->", '<meta http-equiv="Content-Security-Policy" content="' + csp + '">')
    out = inline_assets(out)
    (ROOT / "index.html").write_text(out, encoding="utf-8")
    export_knowledge()
    print(f"index.html written ({len(out.encode('utf-8')) / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
