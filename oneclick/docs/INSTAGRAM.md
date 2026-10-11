# Instagram system

Status: profile assets **BUILT LOCALLY**; queue **BUILT LOCALLY (read-only in Admin)**;
publishing **PRODUCTION CONNECTION REQUIRES OWNER** (Meta Professional account + app review).

## Profile
- Avatar: `public/brand/oneclick-instagram-avatar.png` (white mark + saffron dot on Oasis, circle-safe).
- Name field: `One Click | ون كليك`
- Bio (AR first for GCC):
  ```
  جهد أقل. حياة أكثر.
  مخططات ومنظّمات ذكية ليومك
  عربي + English · من عُمان
  ```
- Link: product-specific UTM links, rotated per campaign (see `utmLink()` in `src/content/social.ts`).
- Highlights + covers (`public/brand/instagram-highlight-*.png`): Products, Bride, Grocery,
  Planner, Tips, Custom.

## Profile refresh (2026-10-11), awaiting the owner's pick
- Avatar options (1080×1080, circle-safe) in `docs/instagram/`:
  A: cream with a soft teal glow · B: brand teal with a white ring (stands out in the feed) · C: Clicky
  with the family around him. `avatar-options-preview.png` shows each at profile and feed size.
- Name field: `ون كليك | مخططات ومنظّمات رقمية`
- Bio options (all under 150 characters; no "free"):
  1. `جهد أقل، حياة أكثر ✨` / `مخططات ومنظّمات رقمية تسهّل يومك` / `👰 العروسة · 🌙 رمضان · 💰 الميزانية · 🧺 المقاضي` / `جرّبها قبل لا تشتريها 👇`
  2. `خلّي يومك أسهل بضغطة وحدة 🖱️` / `مفكّرة العروسة، مخطط رمضان، الميزانية والمزيد` / `عربي + English · من عُمان 🇴🇲` / `جرّبها قبل لا تشتريها 👇`
  3. `أدوات رقمية جميلة لكل يوم ✨` / `من الفوضى إلى الوضوح، بضغطة وحدة` / `عربي + English · من عُمان 🇴🇲` / `👇 تصفّح وجرّب`
- Link: `https://www.oneclick.computer/ar`
- Clicky family highlight covers (1080×1920, character centered for the circle crop) in `docs/instagram/highlights/`:
  Clicky = منتجاتنا, Warda = العروسة, Shams = نصايح, Marjan = أسئلتكم, Lilac = حسابك, all five = عائلتنا.

## Formats
- Reels 9:16, 7-20 s, hook in first 1-3 s, captions burned in, end card with mark + slogan.
- Carousels 4:5, max 7 slides, problem → steps → result → CTA.
- Stories: polls/questions + demo clips + link stickers.
- Posts: brand moments, launches, honest behind-the-scenes.
- Language: Arabic, English or bilingual per item; Arabic text right-aligned, never mixed in one line.

## Content mix (30-day plan)
Source of truth: `launchPlan` in `src/content/social.ts` (30 items, all `draft`, each with hook
AR/EN, CTA, link and campaign). Pillars: launch, problem, demo, before/after, tutorial, tips,
education, question, behind the scenes, offer. Roughly 1 in 6 posts asks for action; the rest
help or entertain.

## Workflow
Draft → Review → **Approved by owner** → Scheduled → Published (→ Failed → retried, never dropped).
Auto-publish stays off until the owner explicitly enables it.

## API integration (when authorized)
Research the current Meta Graph API (Instagram content publishing) at implementation time.
Expected requirements: Instagram Professional account linked to a Facebook Page, a Meta app with
the content-publishing permission approved, long-lived tokens stored as server secrets, media at
public HTTPS URLs, rate limits per 24 h. The `social_posts` table stores status, attempts and
last error so nothing is silently lost.
