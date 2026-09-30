#!/usr/bin/env python3
"""Clicky AI endpoint: lets the hub's chatbot understand any question.

The site already answers from its built-in knowledge. When this service runs
behind the same domain at /api/clicky and the page's <meta name="hub-api">
is set to "/api", Clicky sends each question here first and Claude answers,
grounded in the hub's own knowledge base (clicky_kb.json, written by build.py).
If this service is down, the page quietly falls back to its built-in answers.

Contract:  POST /api/clicky   {"question": "...", "lang": "ar" | "en"}
           -> 200 {"answer": "plain text"}

Setup (see SERVER.md):
    pip install anthropic
    export ANTHROPIC_API_KEY=...        # server environment only, never in the page
    python3 server/clicky_api.py        # listens on 127.0.0.1:8787 by default

Put it behind your web server (reverse proxy /api/clicky -> 127.0.0.1:8787)
so the browser sees one origin. Only the Python standard library and the
official Anthropic SDK are used.
"""
import json
import os
import sys
import threading
import time
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import anthropic

MODEL = os.environ.get("CLICKY_MODEL", "claude-opus-5-5")
HOST = os.environ.get("CLICKY_HOST", "127.0.0.1")
PORT = int(os.environ.get("CLICKY_PORT", "8787"))
TRUST_PROXY = os.environ.get("CLICKY_TRUST_PROXY") == "1"  # read X-Forwarded-For only behind your own proxy
RATE_PER_MIN = int(os.environ.get("CLICKY_RATE_PER_MIN", "12"))
MAX_BODY = 4096
MAX_QUESTION = 500

KB_PATH = Path(__file__).with_name("clicky_kb.json")


def load_kb():
    """The hub's questions and answers, as one text block for the prompt."""
    rows = json.loads(KB_PATH.read_text(encoding="utf-8"))
    parts = []
    for r in rows:
        parts.append(f"Q: {r['q_en']} / {r['q_ar']}\nA (en): {r['a_en']}\nA (ar): {r['a_ar']}")
    return "\n\n".join(parts)


SYSTEM_RULES = """You are Clicky, the friendly helper of the ClickUp Learning Hub for Omantel employees.
Employees ask about using ClickUp at work: tasks, lists, views, statuses, automations, forms,
dashboards, Docs, chat, AI (ClickUp Brain), import/export, templates, sharing and permissions.

How to answer:
- Reply in the language given in the request (Arabic or English). Arabic answers use clear Modern Standard Arabic.
- Understand the question whatever the wording, spelling mistakes or dialect.
- Keep it short: 2 to 5 sentences or a few numbered steps. Plain text only, no Markdown, no HTML.
- Prefer the hub's knowledge base below. If you use general ClickUp knowledge, say menus can differ by plan or version.
- If you are not sure, say so and suggest asking in the hub's forum or the "Ask the team" page. Never invent features.
- Remind people not to paste passwords, customer data or confidential information.
- If the question is not about ClickUp, work or this hub, politely say you only help with ClickUp.

The hub's knowledge base:
"""

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment
SYSTEM = [{"type": "text", "text": SYSTEM_RULES + load_kb(), "cache_control": {"type": "ephemeral"}}]

def ask_claude(question, lang):
    try:
        response = client.beta.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=SYSTEM,
            output_config={"effort": "low"},  # short help-desk answers
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",  # a declined request is retried on Anthropic's recommended model
            messages=[{"role": "user", "content": f"Language: {'Arabic' if lang == 'ar' else 'English'}\n\nQuestion: {question}"}],
        )
    except anthropic.RateLimitError:
        log("rate limited by the API")
        return None
    except anthropic.APIStatusError as e:
        log(f"API error {e.status_code}")
        return None
    except anthropic.APIConnectionError:
        log("cannot reach the API")
        return None
    if response.stop_reason == "refusal":
        return None
    text = "".join(b.text for b in response.content if b.type == "text").strip()
    return text[:3000] or None


# ---- Simple per-address rate limit (sliding one-minute window) ----
_hits = defaultdict(deque)
_lock = threading.Lock()


def allowed(addr):
    now = time.monotonic()
    with _lock:
        q = _hits[addr]
        while q and now - q[0] > 60:
            q.popleft()
        if len(q) >= RATE_PER_MIN:
            return False
        q.append(now)
        return True


def log(msg):
    print(time.strftime("%Y-%m-%d %H:%M:%S"), msg, file=sys.stderr, flush=True)


class Handler(BaseHTTPRequestHandler):
    server_version = "clicky"
    sys_version = ""

    def _send(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def _client(self):
        if TRUST_PROXY:
            fwd = self.headers.get("X-Forwarded-For", "")
            if fwd:
                return fwd.split(",")[0].strip()
        return self.client_address[0]

    def do_POST(self):
        if self.path.rstrip("/") not in ("/api/clicky", "/clicky"):
            return self._send(404, {"error": "not found"})
        # Same-origin fetches from the hub carry this header; plain cross-site forms cannot set it.
        if self.headers.get("X-Requested-With") != "fetch":
            return self._send(403, {"error": "forbidden"})
        if "application/json" not in self.headers.get("Content-Type", ""):
            return self._send(415, {"error": "json only"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY:
            return self._send(413, {"error": "too large"})
        if not allowed(self._client()):
            return self._send(429, {"error": "slow down"})
        try:
            data = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return self._send(400, {"error": "bad json"})
        question = str(data.get("question", "")).strip()[:MAX_QUESTION] if isinstance(data, dict) else ""
        lang = "ar" if isinstance(data, dict) and data.get("lang") == "ar" else "en"
        if not question:
            return self._send(400, {"error": "empty question"})
        answer = ask_claude(question, lang)
        # An empty answer tells the page to use its built-in knowledge instead.
        self._send(200, {"answer": answer or ""})

    def do_GET(self):
        self._send(405, {"error": "use POST"})

    def log_message(self, fmt, *args):  # no question text in logs
        log(f"{self.command} {self.path.split('?')[0]} from {self._client()}")


if __name__ == "__main__":
    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("Set ANTHROPIC_API_KEY in the server environment first.")
    log(f"Clicky AI listening on http://{HOST}:{PORT}/api/clicky")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
