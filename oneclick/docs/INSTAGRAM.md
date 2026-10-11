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
  2. `خلّي يومك أسهل بضغطة وحدة 🖱️` / `مفكّرة العروسة، مخطط رمضان، الميزانية والمزيد` / `من عُمان لكل الخليج والعرب 🇴🇲` / `جرّبها قبل لا تشتريها 👇`
  3. `أدوات رقمية جميلة لكل يوم ✨` / `من الفوضى إلى الوضوح، بضغطة وحدة` / `من عُمان لكل الخليج والعرب 🇴🇲` / `👇 تصفّح وجرّب`
- Link: `https://www.oneclick.computer/ar`
- Clicky family highlight covers (1080×1920, no text, character centered for the circle crop) in `docs/instagram/highlights/`:
  Clicky = منتجاتنا, Toot = المفضلة, Shams = نصايح, Marjan = أسئلتكم, Lilac = حسابك, all five = عائلتنا.

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

## Launch row captions (post in this order: post-1, post-2, post-3; images in `docs/instagram/launch/site/`)
1. جهد أقل. ✨ / يومك فيه مهام كثيرة: مقاضي، ميزانية، دراسة، رمضان، ترتيب البيت، مهام الأطفال… والقائمة تطول. / في ون كليك سوّينا لكل مهمة أداة رقمية مرتبة، تفتحها من جوالك وتخلّصها بضغطة وحدة. / وهذي البداية بس، والكثير جاي 💚 / #ون_كليك #OneClick #تنظيم #مخطط #الخليج #العالم_العربي
2. هلا والله 👋 أنا كليكي، وهذي ون كليك. / علامة رقمية من سلطنة عُمان 🇴🇲 لكل بيت في الخليج والعالم العربي. نصمم مخططات ومنظّمات تفاعلية بالعربي والإنجليزي، عشان يومك يصير أسهل وأحلى. / جرّب العرض المباشر قبل لا تشتري، والرابط في البايو 🔗 / #ون_كليك #OneClick #صنع_في_عمان #مخططات_رقمية #الخليج #السعودية #الإمارات #الكويت #قطر #البحرين #عمان
3. حياة أكثر 💛 / لما تخف عليك المهام، يصير عندك وقت أكثر لك ولأهلك. / تعرّفوا على عائلة كليكي، كل واحد منهم يساعدك في جزء من الموقع: 💚 كليكي يعرّفك على المنتجات · 💗 توت تحفظ لك المفضلة وتفرح معك وقت الشراء · 💛 شمس تشاركك النصايح والأدلة · ❤️ مرجان يساعدك إذا احتجت شي · 💜 ليلك يحمي حسابك / مين فيهم عجبك أكثر؟ قولوا لنا في التعليقات 👇 / #ون_كليك #OneClick #عائلة_كليكي #تنظيم_الوقت #الخليج #العالم_العربي

## Bio, final options (2026-10-11; all ≤150 characters; Gulf + Arab world, not only Oman)
1. (recommended) `✨ يومك، صار أحلى` / `📋 مخططات ومنظّمات رقمية بالعربي` / `🌙 رمضان · 🧺 المقاضي · 💰 الميزانية · 📚 الدراسة` / `🇴🇲 من عُمان لكل الخليج والعرب` / `👇 تصفّح المنتجات`
2. `جهد أقل. حياة أكثر 💚` / `مخططات رقمية لكل يومك 🖱️` / `رمضان · مقاضي · ميزانية · دراسة · والكثير` / `🇴🇲 من عُمان لكل الخليج والعرب` / `👇 جرّب العرض المباشر`
3. `هلا! أنا كليكي 👋` / `أرتّب يومك بمخططات رقمية بالعربي ✨` / `🌙 🧺 💰 📚 🏋️ وأكثر` / `🇴🇲 من عُمان لكل الخليج والعرب` / `👇 تعرّف علينا`
Name: `ون كليك | مخططات ومنظّمات رقمية` · Link: `https://www.oneclick.computer/ar` · Category: Digital creator or Product/service.
