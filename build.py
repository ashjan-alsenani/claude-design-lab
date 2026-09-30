#!/usr/bin/env python3
"""Assemble the self-contained index.html from src/.

Usage: python3 build.py
Only the Python standard library is used. The output inlines all CSS and JS.
"""
import base64
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"

CSS_FILES = ["styles.css"]
JS_FILES = [
    "i18n/core.js",
    "content/core.js",
    "content/lessons-1.js",
    "content/lessons-2.js",
    "content/lessons-3.js",
    "content/quizzes.js",
    "content/en/core.js",
    "content/en/lessons-1.js",
    "content/en/lessons-2.js",
    "content/en/lessons-3.js",
    "content/en/quizzes.js",
    "app/util.js",
    "app/store.js",
    "app/icons.js",
    "app/fx.js",
    "app/demo.js",
    "app/exercises.js",
    "app/lab.js",
    "app/charts.js",
    "app/views.js",
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


def main():
    template = read("template.html")
    css = "\n".join(read(f) for f in CSS_FILES)
    js = "\n;\n".join(f"/* ---- {f} ---- */\n" + read(f) for f in JS_FILES)
    js = "(function(){\n'use strict';\n" + js + "\n})();"
    if "</script" in js.lower():
        raise SystemExit("A source file contains a literal </script> tag; escape it.")
    out = template.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
    out = inline_assets(out)
    (ROOT / "index.html").write_text(out, encoding="utf-8")
    print(f"index.html written ({len(out.encode('utf-8')) / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
