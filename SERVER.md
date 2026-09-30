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

`/api/clicky` is where you can connect an AI service later. If it is missing or fails, Clicky answers from the platform's built-in knowledge, so the chatbot always works.

The `connect-src 'self'` rule in the page allows these calls only on the same domain. If the API lives on another domain, add that https address to `connect-src` in `build.py` and rebuild.

## 4. Updating the site

Edit files in `src/`, run `python3 build.py`, and upload the new `index.html`. The build recalculates the script hash in the security policy automatically.
