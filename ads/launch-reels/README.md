# One Click launch reels

Three opening reels for Instagram (9:16, 1080×1920, 30 fps, H.264 + AAC), drawn in the site's own design: cream background, Rubik, the flat Clicky, product chips exactly like the home page parade, soft blobs and the colored hand-drawn underline.

| Reel | Length | Story | Final line |
|---|---|---|---|
| `01-opening` | 15 s | Clicky drops in and says hi → the logo → products burst out → «يومك، صار أحلى.» → «افتتحنا!» with confetti | oneclick.computer · الرابط في البايو |
| `02-less-effort` | 14 s | «مهامك كثيرة؟» tasks fall in a pile → Clicky taps once → they line up → «والكثير غيرها +» → «جهد أقل. حياة أكثر.» | same end card |
| `03-family` | 16 s | «تعرّف على عائلة كليكي» → each member in their color (Clicky, Toot, Shams, Marjan, Lilac) → all dance → «حياة أكثر.» | same end card |

- Music: original, synthesized by `tools/music.py` (marimba, bass, light drums, a chime on the celebration moments), owned outright.
- No voice-over; every message is on screen, so the reels work muted.
- No prices, no "free", no claim that every product has a demo.

Rebuild: `tools/build.sh` (or `ONLY="02-less-effort" tools/build.sh`). Sources: `video/<reel>/index.html` + `video/lib.js`.

## Captions

**01 الافتتاح**
افتتحنا! 🎉 / هلا والله، أنا كليكي 👋 وهذي ون كليك. / مخططات ومنظّمات رقمية بالعربي تسهّل يومك: رمضان، المقاضي، الميزانية، الدراسة، اللياقة، والكثير غيرها. / من سلطنة عُمان 🇴🇲 لكل بيت في الخليج والعالم العربي. / يومك، صار أحلى ✨ / الرابط في البايو 🔗 / #ون_كليك #OneClick #افتتاح #مخططات_رقمية #تنظيم #الخليج #السعودية #الإمارات #الكويت #قطر #البحرين #عمان

**02 جهد أقل**
مهامك كثيرة؟ 😮‍💨 / مقاضي، ميزانية، دراسة، أطفال، ترتيب بيت… كلها تبي تنعمل. / في ون كليك لكل مهمة أداة مرتبة، تفتحها من جوالك وتخلّصها بضغطة وحدة ✓ / جهد أقل. حياة أكثر 💚 / أي مهمة تاخذ من وقتك أكثر؟ قولوا لنا في التعليقات 👇 / الرابط في البايو 🔗 / #ون_كليك #OneClick #تنظيم_الوقت #تنظيم #مخطط #إنتاجية #الخليج #العالم_العربي

**03 عائلة كليكي**
تعرّفوا على عائلة كليكي 💛 / 💚 كليكي: قائد العائلة، يعرّفك على كل المنتجات · 💗 توت: رفيقة التسوّق، تحفظ لك المفضلة وتفرح معك وقت الشراء · 💛 شمس: صاحبة الأفكار، تشاركك النصايح والأدلة · ❤️ مرجان: المساعد، معك إذا احتجت أي شي · 💜 ليلك: الحارس، يحمي حسابك وبياناتك / مين فيهم يشبهك؟ 👀 قولوا لنا في التعليقات 👇 / #ون_كليك #OneClick #عائلة_كليكي #كليكي #الخليج #العالم_العربي
