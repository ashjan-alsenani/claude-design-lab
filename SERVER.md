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
| `POST /api/clicky` | `{ "question", "lang", "history", "stream" }` | streamed lines or `{ "answer" }` (see section 4) |

`/api/clicky` is where you connect AI (next section). If it is missing or fails, Clicky answers from the platform's built-in knowledge, so the chatbot always works.

The `connect-src 'self'` rule in the page allows these calls only on the same domain. If the API lives on another domain, add that https address to `connect-src` in `build.py` and rebuild.

## 4. Make Clicky a ChatGPT-style AI assistant for ClickUp (optional, uses Claude)

Without AI, Clicky matches questions against about 140 prepared answers. That handles typos, follow-ups and Arabic, but not every possible wording. With the AI service switched on, Clicky works like ChatGPT, but only for ClickUp:

- he understands any wording, spelling mistakes, dialect and mixed Arabic/English;
- he remembers the conversation, so "and on the phone?" makes sense;
- his answer appears word by word as it is written, with numbered steps;
- he asks a short question back when a request is unclear;
- he politely declines anything that is not about ClickUp or this hub.

`server/clicky_api.py` is the ready-made service that does this with Claude, Anthropic's AI model.

**Try it in one step** (on a test machine):

```
pip install -r server/requirements.txt
export ANTHROPIC_API_KEY=...          # from console.anthropic.com, server only
python3 server/clicky_api.py --site   # open http://127.0.0.1:8787/
```

`--site` serves `index.html` with Clicky's AI switched on and the security headers above.

**On your real server:**

1. Install and set the key as above. Never put the key in the page or in this repository.
2. Run `python3 server/clicky_api.py` as a service (systemd or similar). It listens on `127.0.0.1:8787`.
3. In the web server, forward `/api/clicky` to `http://127.0.0.1:8787/api/clicky`. Turn off response buffering for that path so answers stream (nginx: `proxy_buffering off;`). Set `CLICKY_TRUST_PROXY=1` so rate limits use the real visitor address.
4. In `src/template.html` set `<meta name="clicky-api" content="/api/clicky">`, run `python3 build.py`, and upload `index.html`. This switches on only the AI chat. The forum, ideas and support pages still use `hub-api`, which is set separately.

**What the service does:**

- It uses the model `claude-opus-5-5` (change it with `CLICKY_MODEL`). Its instructions are cached, so repeat questions cost less.
- It grounds answers in `server/clicky_kb.json`, which `build.py` writes from `src/content/kb.js`. Rebuild and restart after you edit the questions.
- It receives the last 10 messages of the conversation. Nothing is stored on the server, and question text is never written to the log.
- If Claude declines a request, it is retried automatically on Anthropic's recommended fallback model (server-side fallbacks). If anything still fails, the page quietly shows its built-in answer instead.
- Safety limits:
  - questions up to 800 characters and 16 KB per request;
  - JSON only, and the `X-Requested-With: fetch` header is required;
  - 12 questions a minute per address (`CLICKY_RATE_PER_MIN`);
  - answers are shown as plain text: only steps, bullets and bold are formatted, so HTML in an answer is shown as text and never runs.
- Cost: you pay Anthropic per question, usually a small amount per answer. Set a monthly spending limit in the Anthropic console.
- Company rules on sending staff questions to an external AI service still apply. Check with your security team before you switch it on.

**Contract** (if IT prefers its own implementation): `POST /api/clicky` with `{ "question", "lang", "history": [{ "role": "user" | "assistant", "text" }], "stream": true }`. Reply either as `application/x-ndjson`, one line per piece (`{"t": "..."}`, then `{"done": true}`, or `{"error": "..."}` to use the built-in answer), or as JSON `{ "answer": "text" }`.

## 5. Updating the site

Edit files in `src/`, run `python3 build.py`, and upload the new `index.html`. The build recalculates the script hash in the security policy automatically.
