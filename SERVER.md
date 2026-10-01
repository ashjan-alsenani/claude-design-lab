# Hosting the Learning Hub on your server

`index.html` is a single self-contained file: all code, styles and images are inside it. Upload it to any web server (IIS, Nginx, Apache) over **HTTPS**. Nothing else is required for the platform to work.

## 1. Security already built in

- **Content Security Policy** (in the page): only the page's own script can run (it is pinned by its SHA-256 hash, recalculated by `build.py`), no external scripts, no plugins, no frames, network calls only to the same site.
- **No unsafe HTML**: every piece of text a person types (forum, forms, lab, uploaded CSV) is escaped before it is shown. Tested with script-injection payloads.
- **CSV exports are formula-safe**: cells that start with `=`, `+`, `-` or `@` are prefixed so Excel does not run them.
- **Uploaded CSV files** are read in the browser only, limited to 2 MB and 50 rows.
- **External links** open with `rel="noopener noreferrer"`; referrer policy is `strict-origin-when-cross-origin`.
- **No secrets, keys or passwords** are stored in the file. The browser only remembers the language, progress, sounds on/off and the learner's name and employee ID for the forms.
- The test hook (`window.__hub`) exists only when the file is opened locally (`file://`), never on a server.

## 2. Add these response headers on the server

These cannot be set from inside a page, so add them in the web server configuration:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Cache-Control: no-cache
```

If the site should be for employees only, put it behind your company sign-in (for example Azure AD / Entra ID single sign-on, or the intranet reverse proxy).

## 3. Turn on shared forum, ideas, support and Clicky (optional)

Out of the box, forum posts, ideas and questions are kept in each person's browser. To share them across all employees, provide a small JSON API on the **same domain** and set its address in `index.html`:

```html
<meta name="hub-api" content="/api">
```

Requests are same-origin, send cookies (`credentials: same-origin`), JSON bodies, and the header `X-Requested-With: fetch` (use it with your CSRF protection). The server must **identify the user from the sign-in session**, validate and length-limit every field, store text as plain text, and apply rate limits.

| Method and path | Body | Response |
| --- | --- | --- |
| `GET /api/forum` | | `{ "posts": [ { "id", "type": "q" \| "tip" \| "idea", "part", "at" (ms), "by": { "name", "emp" }, "text", "likes", "agrees", "mine": true/false, "comments": [ { "id", "by", "at", "text", "likes" } ] } ] }` |
| `POST /api/forum` | `{ "type", "part", "text", "by" }` | any 2xx |
| `POST /api/forum/{id}/like` or `/agree` | `{ "on": true/false }` | any 2xx |
| `POST /api/forum/{id}/comments` | `{ "text", "by" }` | any 2xx |
| `POST /api/forum/{id}/delete` | `{}` | any 2xx (only the author or a moderator) |
| `POST /api/ideas` | `{ "id", "name", "emp", "cat", "level", "subject", "body", "at" }` | any 2xx |
| `POST /api/support` | same fields as ideas | any 2xx |
| `GET /api/clicky/status`, `POST /api/clicky` | see section 4 | see section 4 |

`/api/clicky` is Clicky Chatbot's AI service (next section). It is switched on separately with `<meta name="clicky-api">`.

The `connect-src 'self'` rule in the page allows these calls only on the same domain. If the API lives on another domain, add that https address to `connect-src` in `build.py` and rebuild.

## 4. Clicky Chatbot's AI (needs a model before it gives real AI answers)

Clicky Chatbot (كليكي تشات بوت) is the site's one chat widget. Its AI path is fully built:

- understanding of natural questions, Gulf dialect, English, mixed language and typos;
- conversation memory for follow-ups like «وين ألقاه؟» or «بسطها», kept when the language changes;
- answers in the chosen language, with ClickUp's English labels kept;
- answers grounded in the site's lessons, with numbered source links to real lessons and official ClickUp articles;
- honest errors with a Retry button.

**It gives real AI answers only once a language model is connected.** Until then it says so plainly ("AI not connected · lesson search only"). It still lets people search the lessons, labelled "Lesson search · not an AI answer". Nothing is presented as live AI when no model is configured.

### The remaining decision: which model, where it runs, who pays

| Option | Where inference runs | What it needs | Cost |
| --- | --- | --- | --- |
| **A. Hosted model through this backend** (built in: Claude by Anthropic) | Anthropic's cloud, called from your server | An approved Anthropic account and API key, plus security and privacy approval to send employee questions there | Pay per use, usually a small amount per question. Set a monthly limit in the Anthropic console |
| B. Self-hosted open model | Your own GPU servers | Persistent compute, hosting and maintenance. Arabic quality must be checked. Needs a small adapter class in `clicky_api.py` | Hardware and running costs; not free |
| C. Model in the browser | Each employee's device | Large model downloads and capable devices; Arabic quality varies widely | No per-question fee, but heavy and unreliable on ordinary laptops and phones |

Option A is implemented and ready. Nothing is activated or paid for until someone with authority sets the key on the server. For B, add a class next to `AnthropicEngine` in `server/clicky_api.py`; the page does not change.

### Switch it on (option A)

1. On the server: `pip install -r server/requirements.txt`.
2. Set these environment variables on the server. Never put them in the page, in this repository or in browser storage.

   | Variable | Meaning |
   | --- | --- |
   | `ANTHROPIC_API_KEY` | The API key (required for real answers) |
   | `CLICKY_ENGINE` | `anthropic` (default) or `none` |
   | `CLICKY_MODEL` | Model ID; default `claude-opus-5-5` |
   | `CLICKY_AUTH_HEADER` | Header your SSO proxy sets for signed-in staff, for example `X-Remote-User`. Requests without it get 401. The proxy must strip any copy sent by the browser |
   | `CLICKY_TRUST_PROXY` | `1` when behind your reverse proxy, so limits use the real visitor address |
   | `CLICKY_RATE_PER_MIN` | Questions per minute per address (default 12) |
   | `CLICKY_MAX_CONCURRENT` | Answers generated at the same time (default 4) |
   | `CLICKY_TIMEOUT` | Seconds before a model call is abandoned (default 60) |
   | `CLICKY_HOST`, `CLICKY_PORT` | Listen address (default 127.0.0.1:8787) |

3. Run `python3 server/clicky_api.py` as a service. For a trial, `python3 server/clicky_api.py --site` also serves the site with the AI switched on at `http://127.0.0.1:8787/`.
4. In the web server, forward `/api/clicky` and `/api/clicky/status` to it. Turn off response buffering for those paths so answers stream (nginx: `proxy_buffering off;`). Put them behind your staff sign-in. A hidden address is not access control.
5. In `src/template.html` set `<meta name="clicky-api" content="/api/clicky">`, run `python3 build.py`, and upload `index.html`.
6. Ask a real question and check that the header says "AI Assistant · online" and the answer shows sources. That is the live end-to-end test. Everything before it was tested only with a stand-in engine.

### How it works

- **Grounding.** `build.py` runs `tools/export-knowledge.js`, which writes `server/knowledge.json`. It holds 217 records (29 lessons, 12 tour parts, 29 common questions, 108 saved answers and 39 glossary terms). Each record has a stable ID, Arabic and English text, its page on the site, its official ClickUp sources and its review date.
- **Retrieval.** The page picks the most relevant record IDs for each question, adding the previous topic for follow-ups. The server adds its own matches. Excerpts are always taken from the server's trusted copy, never from the browser.
- **Answering.** The model receives the rules, the last 10 messages and the numbered excerpts. It cites them as [1], [2]. The page links only numbers that match a real record, so citations cannot be invented.
- **Privacy.** Conversations live only in the open browser tab and disappear on Clear conversation or reload. Each tab is separate. The server stores nothing and logs no question or answer text.
- **Safety.**
  - Questions are limited to 800 characters, 10 history messages and 24 KB per request.
  - JSON only, and the `X-Requested-With: fetch` header is required.
  - Requests are rate- and concurrency-limited, with timeouts. Clear conversation cancels a running answer.
  - Model output is shown as escaped text with only steps, bullets and bold formatted. HTML and links in answers never run.
  - User text and excerpts are passed to the model as data, not instructions.
  - The model is told not to invent Omantel policies, not to reveal secrets, and that it cannot change real ClickUp data.
  - Declined requests are retried on Anthropic's recommended fallback model (server-side fallbacks). If still declined, the chat says it can't help, rather than "I don't understand".

### Contract

- `GET /api/clicky/status` returns `{ "engine": "anthropic" | "none", "ready": true | false }`.
- `POST /api/clicky` takes `{ "question", "lang": "ar" | "en", "history": [{ "role": "user" | "assistant", "text" }], "sources": ["lesson:l3-2", ...], "stream": true }`.
- The reply is `application/x-ndjson`, one JSON object per line:
  1. `{ "sources": [{ "n", "id" }] }`
  2. `{ "t": "text" }`, repeated for each piece of the answer
  3. `{ "done": true }`, or `{ "error": kind }` instead
- Error kinds:
  - `not_configured` and `busy` arrive as HTTP 503;
  - `rate_limited` arrives as HTTP 429;
  - `unauthorized` arrives as HTTP 401;
  - `service`, `network`, `timeout` and `refused` arrive in the stream.

## 5. Updating the site

Edit files in `src/`, run `python3 build.py`, and upload the new `index.html`. The build recalculates the script hash in the security policy automatically.
