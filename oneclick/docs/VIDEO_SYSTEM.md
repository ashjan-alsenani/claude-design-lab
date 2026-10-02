# Video system

Status: **DESIGNED**. When the owner asks for a video, Claude picks tools automatically.

## Tool routing (cost-first)
1. **Product demos, UI walkthroughs, motion graphics** → HTML/CSS motion compositions built from
   the real product UI (the live demos in this repo), rendered with HyperFrames (connected) or
   recorded with Playwright (free) and finished in an editor. Brand fonts/colors are already code.
2. **Captions, voiceover, music, timing, final edit** → Descript (connected) or equivalent.
3. **Generative AI footage** (people, lifestyle, environments) → only when the concept truly needs
   it; expected cost stated before any paid render.
4. **Repurposing** long videos into clips → OpusClip/VideoDB (connected), check usage first.

## Defaults
9:16, 1080×1920, 30 fps, 7-20 s, hook in 1-3 s, subtitles in safe area (top 15% / bottom 20% clear),
brand colors and fonts, one message, CTA, One Click Digital Hub end card (mark draw-on + bilingual slogan),
cover frame exported as PNG.

## Workflow checklist
Concept → hook → script (AR/EN) → scene list/storyboard → shot list (UI states to capture) →
assets (screens from live demos, brand shapes) → animation → voiceover plan → captions → timing →
CTA → music direction (licensed/royalty-free) → end screen → cover → export (MP4 H.264) → upload
to `video_assets` → queue in social plan (owner approval).

## Example: "20-second awareness video about One Click Bride"
| Time | Visual | Text (AR / EN) |
|---|---|---|
| 0-2 s | Stack of chat bubbles shaking | ٤٠ محادثة… / 40 chats… |
| 2-5 s | Bubbles collapse, mark draws on | خلّيها مكان واحد / Make it one place |
| 5-12 s | Bride demo: ticking tasks, ring fills to 57% | المهمة الجاية واضحة / Always know what's next |
| 12-16 s | Budget tab, bars animate | الميزانية تحت السيطرة / Budget under control |
| 16-20 s | End card | جهد أقل. حياة أكثر. · ون كليك عروس |
