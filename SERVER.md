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

**It gives real AI answers only once a language model is connected; see below for what is missing and the measured options.** Until then it says so plainly ("AI not connected · lesson search only"). It still lets people search the lessons, labelled "Lesson search · not an AI answer". Nothing is presented as live AI when no model is configured.

### Why it says "AI not connected" today

Three things are missing, and all three are outside the page:

1. **No model server.** No language model is running anywhere for this site.
2. **No AI service.** `server/clicky_api.py` is not running, so nothing answers `/api/clicky`.
3. **No address in the page.** `<meta name="clicky-api">` is empty, so the page does not call any AI. It shows the honest "not connected" state and offers the lesson search only. The search is keyword matching, which is why a question like "Can I share sensitive data in ClickUp?" can come back as "I'm not sure what you mean".

### Free options, measured (2026-10-01)

Measured in the development container: 4 CPU cores, 15 GB RAM, no GPU. Every answer went through the real chat widget and `clicky_api.py`, except the in-browser test.

| Option | Model and size | Speed here | Quality |
| --- | --- | --- | --- |
| In the browser (Transformers.js, CPU/WASM) | Qwen2.5-0.5B-Instruct, 757 MB download | 31 s to load from local disk; 16–20 s to the first word; about 0.5 tokens/s; 43–73 s per answer | **Unsafe and unusable.** Said "Yes, you can share sensitive data in ClickUp." The Arabic answer was incoherent. |
| In the browser, larger | Qwen2.5-1.5B: 1.2–1.8 GB download, and needs a WebGPU-capable graphics chip | Not measurable here (no GPU) | The same 1.5B model failed the safety check on the server (next row), so a faster device does not fix it |
| Self-hosted, small (llama.cpp, CPU) | Qwen2.5-1.5B-Instruct Q4, 1.1 GB | 28–53 s per answer | **Unsafe.** Said customer phone numbers in a task were "allowed". Lost the topic on follow-ups. |
| **Self-hosted, 7B (llama.cpp, CPU)** | **Qwen2.5-7B-Instruct Q4_K_M, 4.7 GB file, about 6 GB RAM** | 3–6.5 minutes per answer on 4 CPU cores | **Usable with review.** Good Gulf-dialect understanding and Arabic; grounded comparisons; simplified on request. Sent data questions to the security team and did not say sharing was allowed. Mistakes seen: it once invented a web link (the chat now removes all links the model writes); it missed one English follow-up; it overstated "your colleague will only see this task". With the stricter data instructions it opened with "You cannot confirm an Omantel policy…" and refused to give a password. It still added Custom Field tips for storing customer phone numbers, against the rule. |
| Hosted Claude (paid) | n/a | not tested (no key) | n/a |

**Conclusion.**

- **A model in the browser is not suitable for this site.**
  - Models small enough to download (0.5–1.5B) gave unsafe answers about company data and weak Arabic.
  - Models good enough (7B and up) are 4–5 GB downloads and need a strong graphics chip that employee laptops and phones usually do not have.
- **The free route is a self-hosted open model on a server.** Qwen2.5-7B-Instruct is released under the Apache 2.0 licence: no licence fee and no per-question charges. It needs a server.
  - On CPUs only, it is too slow for a chat (minutes per answer).
  - On a server with an NVIDIA GPU with 16 GB or more of memory, it should be fast enough to chat. That expectation is not yet measured; check it on the real server with `tests/live-ai.js`.
  - Larger open models (14B and up) should be more accurate, but need more GPU memory.

### Connect the free self-hosted model (exact steps)

1. **IT provides one server inside the company network** that can run the model (GPU recommended, see above). It must be allowed to hold the questions employees type.
2. Install a model server and load the model. Example with llama.cpp's Python server:

   ```
   pip install "llama-cpp-python[server]"
   python3 -m llama_cpp.server --model Qwen2.5-7B-Instruct-Q4_K_M.gguf --n_ctx 8192 --host 127.0.0.1 --port 8080
   ```

   Ollama, vLLM or LM Studio work too; any server with an OpenAI-style `/v1/chat/completions` endpoint.
3. Start the Clicky service and point it at the model server (it needs only Python's standard library):

   ```
   CLICKY_ENGINE=openai-compatible CLICKY_LLM_URL=http://127.0.0.1:8080/v1 python3 server/clicky_api.py
   ```

4. In the web server, forward `/api/clicky` and `/api/clicky/status` to `127.0.0.1:8787`, turn off response buffering for them (nginx: `proxy_buffering off;`), and put them behind staff sign-in. A hidden address is not access control.
5. Set `<meta name="clicky-api" content="/api/clicky">` in `src/template.html`, run `python3 build.py`, and upload `index.html`.
6. **Live test:** run `node tests/live-ai.js https://your-site`. It asks the acceptance questions in the real chat and prints each answer, its sources and how long it took. A person must read the answers. The chatbot is complete only when this test passes on the real server.

To use the paid Claude option instead: `pip install -r server/requirements.txt`, set `CLICKY_ENGINE=anthropic` and `ANTHROPIC_API_KEY` (with approval for the cost).

For a trial on one machine, `python3 server/clicky_api.py --site` also serves the site with the AI switched on at `http://127.0.0.1:8787/`.

### Environment variables

Set these on the server only, never in the page or the repository:

| Variable | Meaning |
| --- | --- |
| `CLICKY_ENGINE` | `openai-compatible` (self-hosted open model), `anthropic` (paid Claude API) or `none` (default: AI off) |
| `CLICKY_LLM_URL` | Address of the self-hosted model server, for example `http://127.0.0.1:8080/v1` |
| `CLICKY_LLM_KEY` | Only if your internal model gateway requires a key |
| `ANTHROPIC_API_KEY` | Only for the Claude option |
| `CLICKY_MODEL` | Model name; empty means the server's default |
| `CLICKY_AUTH_HEADER` | Header your SSO proxy sets for signed-in staff, for example `X-Remote-User`. Requests without it get 401 |
| `CLICKY_TRUST_PROXY` | `1` when behind your reverse proxy |
| `CLICKY_RATE_PER_MIN` | Questions per minute per address (default 12) |
| `CLICKY_MAX_CONCURRENT` | Answers generated at the same time (default 4) |
| `CLICKY_TIMEOUT` | Seconds before a model call is abandoned (default 60; raise it for slow hardware) |
| `CLICKY_HOST`, `CLICKY_PORT` | Listen address (default 127.0.0.1:8787) |

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

- `GET /api/clicky/status` returns `{ "engine": "openai-compatible" | "anthropic" | "none", "ready": true | false }`. For the self-hosted engine, "ready" also checks that the model server answers.
- `POST /api/clicky` takes `{ "question", "lang": "ar" | "en", "history": [{ "role": "user" | "assistant", "text" }], "sources": ["lesson:l3-2", ...], "stream": true }`.
- The reply is `application/x-ndjson`, one JSON object per line:
  1. `{ "sources": [{ "n", "id" }] }`
  2. `{ "t": "text" }`, repeated for each piece of the answer; `{ "wait": true }` every 15 s while the model has not started yet
  3. `{ "done": true }`, or `{ "error": kind }` instead
- Error kinds:
  - `not_configured` and `busy` arrive as HTTP 503;
  - `rate_limited` arrives as HTTP 429;
  - `unauthorized` arrives as HTTP 401;
  - `service`, `network`, `timeout` and `refused` arrive in the stream.

## 5. Updating the site

Edit files in `src/`, run `python3 build.py`, and upload the new `index.html`. The build recalculates the script hash in the security policy automatically.
