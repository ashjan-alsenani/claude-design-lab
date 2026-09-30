# Bilingual checks

Run after `python3 build.py`. They need Node and Playwright with Chromium.

```bash
node tests/audit.js   # every Arabic content string has an English counterpart; answer keys match
node tests/crawl.js   # every screen in both languages at 1280px and 390px: no overflow, no page errors, no Arabic left in English mode
node tests/behave.js  # language screen, remembered choice, state kept when switching, exercises in English, storage blocked
```

Every line of `behave.js` should read PASS, and the other two should report 0 issues.
