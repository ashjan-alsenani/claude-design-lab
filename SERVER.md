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
| `POST /api/clicky` | `{ "question", "lang": "ar" \| "en" }` | `{ "answer": "plain text" }` |

`/api/clicky` is where you connect AI (next section). If it is missing or fails, Clicky answers from the platform's built-in knowledge, so the chatbot always works.

The `connect-src 'self'` rule in the page allows these calls only on the same domain. If the API lives on another domain, add that https address to `connect-src` in `build.py` and rebuild.

## 4. Let Clicky understand any question (optional, uses Claude)

Built in, Clicky matches questions against about 140 prepared answers. That covers typos, follow-up questions and Arabic, but not every possible wording. `server/clicky_api.py` is a small ready-made service that sends each question to Claude, together with the hub's own questions and answers, so Clicky understands any wording.

1. On the server: `pip install -r server/requirements.txt` (the official `anthropic` library).
2. Put the API key in the server environment only: `export ANTHROPIC_API_KEY=...`. Never put it in the page or in this repository.
3. Run `python3 server/clicky_api.py`. It listens on `127.0.0.1:8787`. Run it as a service (systemd or similar) so it restarts.
4. In your web server, forward `/api/clicky` to `http://127.0.0.1:8787/api/clicky`. If it sits behind that proxy, set `CLICKY_TRUST_PROXY=1` so rate limits use the real visitor address.
5. In `src/template.html` set `<meta name="hub-api" content="/api">`, run `python3 build.py`, and upload `index.html`.

What the service does:

- It uses the model `claude-opus-5-5` (change it with `CLICKY_MODEL`) and answers in the visitor's language, in plain text.
- Its instructions contain `server/clicky_kb.json`, which `build.py` writes from `src/content/kb.js`. Rebuild and restart after you edit the questions. The instructions are cached, so repeat questions cost less.
- If Claude declines a question, the request is retried automatically on Anthropic's recommended fallback model (server-side fallbacks). If that fails too, the page shows its built-in answer.
- Safety limits: questions up to 500 characters, JSON only, the `X-Requested-With: fetch` header is required, and each address can ask 12 questions a minute (`CLICKY_RATE_PER_MIN`). Question text is never written to the log.
- Company rules on sending staff questions to an external AI service still apply. Check with your security team before you turn it on.

## 5. Updating the site

Edit files in `src/`, run `python3 build.py`, and upload the new `index.html`. The build recalculates the script hash in the security policy automatically.
