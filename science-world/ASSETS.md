# Optional illustrations (AI image placeholders)

The website is **complete without these files**. Every visual already has a hand-drawn SVG diagram or an emoji fallback.
If you generate any of the images below, they replace the fallback on the lesson's opening screen.

## How to add an image
1. Generate the image using the description below. Use the shared style.
2. Export it as `.webp`, about 1200×900 px, under 150 KB.
3. Save it to `science-world/public/<path>`, for example `public/assets/lesson-1-1-body-organs.webp`.
4. Add the same path to `readyAssets` in `src/data/assets.ts`.

## Shared style (use in every prompt)
> Soft 3D cartoon illustration for children aged 10–12. Rounded shapes, friendly faces, bright but gentle palette: sky blue #E6F2FF, indigo #5B5BF7, sunny yellow #FFC83D, coral #FF6B6B, leaf green #2FBF71, grape #9B5DE5.
> Soft studio lighting, subtle shadows, clean light background, no text, no logos.
> Omani children wear a white dishdasha and kumma (boys), or a white hijab with a blue school uniform (girls).
> The images must stay scientifically accurate to the Grade 6 Oman science book.

## Image list

| Path | Lesson | What the image should show |
|---|---|---|
| `assets/lesson-1-1-body-organs.webp` | 1-1 أعضاء الجسم | A friendly child silhouette with a see-through torso. It shows the brain in the head, two lungs on either side of the heart in the chest, the heart slightly to the body's left, the liver on the body's right of the upper abdomen, the stomach on the body's left, the coiled small intestine framed by the large intestine, and two kidneys at the back. |
| `assets/lesson-1-3-football.webp` | 1-3 دقات القلب والنبض | Omani boys playing football on grass with hills behind. One boy pauses to feel the pulse on his wrist, and a small glowing heart shows near his chest. |
| `assets/lesson-1-5-family-meal.webp` | 1-5 الجهاز الهضمي | An overhead view of an Omani family sharing a meal: rice dish, salad, grilled food and bread. |
| `assets/lesson-2-1-farm.webp` | 2-1 السلاسل الغذائية | Mohammed (an Omani boy) waters spinach, corn and pumpkins on his father's farm in Sohar. Small details: a caterpillar on a spinach leaf, a dark corn-borer beetle on a corn stalk, a bird and a lizard nearby. |
| `assets/lesson-2-2-plant-sun.webp` | 2-2 السلاسل الغذائية تبدأ بالنباتات | A young plant in soil. Sunlight comes from the sun, air arrows enter the leaves, and water arrows rise into the roots. |
| `assets/lesson-2-3-owl.webp` | 2-3 المستهلكات | An owl (predator) holding a mouse (prey). Keep it friendly and not scary. |
| `assets/lesson-2-4-habitats.webp` | 2-4 المواطن الطبيعية | A split scene. On one side, an African savanna with grass, a scattered acacia tree, a giraffe, a zebra and a lion. On the other side, the ocean with plankton, small fish, a seagull and a shark. |
| `assets/lesson-2-5-rainforest.webp` | 2-5 إزالة الغابات | A lush rainforest with butterflies and birds. On the right edge, a cleared patch with tree stumps and a log truck. |
| `assets/lesson-2-6-city-air.webp` | 2-6 تلوث الهواء | A city with a traffic jam giving off exhaust smoke and a factory with smokestacks. On a hill, a wind turbine and solar panels as clean energy. |
| `assets/lesson-2-7-acid-rain.webp` | 2-7 الأمطار الحمضية | A factory sends smoke into grey clouds. Rain falls on a hill of leafless trees and onto a lake. |
| `assets/lesson-2-8-recycling.webp` | 2-8 إعادة التدوير | An Omani girl sorts items into recycling bins for paper, glass, aluminium cans and plastic, with a compost bag beside them. |
| `assets/lesson-2-9-care.webp` | 2-9 الاعتناء بالبيئة | Children turning off a tap and switching off a lamp, a boy riding a bicycle, a rainwater barrel and a solar garden light. |
| `assets/lesson-3-1-ice.webp` | 3-1 التغيرات القابلة للعكس | Ice cubes melting into a puddle on a plate in the sun. Next to it, a glass of water inside a freezer turning back into ice. |
| `assets/lesson-3-2-mixture.webp` | 3-2 خلط المواد الصلبة | A girl in a hijab and a blue apron stirring jars: rice + flour, salt + sand, tea leaves + sugar, beans + coloured beads. |
| `assets/lesson-3-3-coffee.webp` | 3-3 الذوبان | Two clear glasses of water: one clear (sugar dissolved) and one cloudy with sand settling at the bottom. |
| `assets/lesson-3-4-filter.webp` | 3-4 الترشيح | Two Omani boys pouring a cloudy sand-and-water mixture into a filter funnel with filter paper. Clear water drips into a glass below. |
| `assets/lesson-3-5-sea.webp` | 3-5 المحاليل | Sea waves under a sky. A magnifying-glass inset shows salt particles spread evenly between water particles. |
| `assets/lesson-3-6-tea.webp` | 3-6 الذوبان أسرع | Mohammed serving tea to his grandmother, who sits in a purple armchair. A spoon stirs the tea. |
| `assets/lesson-3-7-sugar-cubes.webp` | 3-7 حجم الحبيبات | Two glasses side by side: sugar cubes (large pieces) and granulated sugar (small grains). |

## Mascot
نوري (Nouri) is drawn as an SVG in `src/components/Mascot.tsx`. It has six moods (happy, excited, thinking, surprised, celebrating, encouraging) and three unlockable outfits. You don't need image files for it.
