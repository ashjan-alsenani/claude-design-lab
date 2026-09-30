# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JavaScript. The deliverable is one self-contained `index.html` with embedded CSS, JavaScript and SVG. Supplied logo files, and any media that must stay separate, go in an `assets/` folder with working relative paths. No build step, no framework, no API keys. Core features do not depend on external services.

## Users

Omantel employees learning ClickUp. Their technical skill varies, and many are complete beginners. They use the product during or around the working day and want to be confident with ClickUp in real tasks such as weekly reporting, internal requests, audit follow-up, meeting preparation, knowledge transfer, service-improvement initiatives and project follow-up. Many sessions will be long.

## Product Purpose

**Omantel | ClickUp Learning Hub**. Tagline: *Learn. Practice. Achieve.*

A working, interactive learning platform. It takes employees from ClickUp fundamentals to advanced everyday workflows. Each lesson follows WATCH → UNDERSTAND → PRACTICE → CHECK. Success means a learner can do real ClickUp work (create and manage tasks, use views, read dashboards, collaborate, set sharing correctly) without help, and can show it in practical exercises and assessments.

## Positioning

The platform does not just describe ClickUp; learners practice in it. Its animated step-by-step demonstrations have synchronized Arabic captions and full playback control. Learners practice in a simulated ClickUp workspace where one shared data model drives every view and chart. Challenges check what the learner actually did. All content is written in Arabic first for an Omantel workplace, with English ClickUp interface terms kept alongside.

## Operating Context

- Employees open `index.html` in a desktop, tablet or mobile browser.
- Progress is saved locally when the browser allows it, and it belongs to that browser and device only. There is no central reporting, cross-device sync or account system, and the product must not imply any.
- Learners check the real ClickUp alongside the platform. Every lesson links to official ClickUp help (help.clickup.com, clickup.com) and shows the content review date.

## Capabilities and Constraints

**Screens:**
- Home
- Learning Library (search, topic and difficulty filters, completion status, bookmarks, time estimates labeled as estimates)
- Lesson Player
- Practice Lab (simulated ClickUp workspace)
- Dashboard Learning Studio (interactive charts with explanations, exercises and data-table alternatives)
- Assessments (module quizzes, a final assessment and a practical end-to-end challenge)
- My Progress (resume, and reset with confirmation)
- Glossary & Help

**Curriculum:** 12 modules.
1. Getting Started
2. Hierarchy
3. Managing Tasks
4. Views
5. Custom Fields and Formula Fields
6. Collaboration
7. Planning and Time
8. Dashboards and Reporting
9. Automations
10. Forms and Goals
11. Sharing, Privacy and Permissions
12. Advanced Productivity

**What every lesson contains:** objective, workplace scenario, explanation, animated demonstration, interactive exercise, a common mistake, a knowledge check with feedback, a summary and an official reference link.

**Animated demonstrations:**
- Original HTML/CSS/SVG/JS, labeled "Educational Simulation" and never presented as a real ClickUp recording.
- Controls: play, pause (which really stops playback), replay (which resets), previous and next step, speed, and step-by-step mode.
- No autoplaying audio, and each demonstration makes sense without sound.

**Practice Lab:**
- Create and edit tasks, and set assignee, priority, due date and status.
- Add checklist items and comments.
- Filter and sort tasks.
- Drag between Board columns, with click-based and keyboard alternatives.
- Switch views and reset the workspace.

**Accuracy:**
- Check interface labels, steps, availability and permissions against current official ClickUp sources, and mark anything that cannot be verified.
- Keep three kinds of content distinct: general guidance, simplified simulation, and behavior that depends on the plan or settings.
- Separate what employees do from what administrators do.
- Write original explanations; do not copy help articles.

**Must not include:**
- Fake login.
- Inactive buttons.
- "Coming Soon" content presented as finished.
- Artificial loading delays.
- Invented metrics.
- Accreditation or "official certification" claims.

**Also required:**
- Handle unavailable local storage gracefully.
- Support desktop, tablet and mobile layouts.

**Open decision:** A full English interface and content mode. It is allowed only if everything is translated. A toggle that changes only a few labels is not allowed. Arabic is the primary teaching language.

## Brand Commitments

- Product name "Omantel | ClickUp Learning Hub" and tagline "Learn. Practice. Achieve."
- Creator credit, with exact spelling, in the footer and the About section, readable on mobile: "Designed by Ashjan Al Sinani".
- The official Omantel and ClickUp logos sit side by side in the header ([Omantel] | [ClickUp]). They get balanced weight and keep their original proportions. They are not redrawn, recolored, distorted or cropped.
- The logos are the user's own supplied assets. Until they arrive, clearly labeled text placeholders stand in.
- The interface is familiar from ClickUp but is its own educational product. It must not imply that ClickUp certifies or endorses it.
- Omantel appears through branding and fictional workplace examples only.

## Evidence on Hand

- **Logos:** Not supplied yet (no `assets/` folder). Do not redraw or approximate them.
- **Omantel data:** No real Omantel policies, procedures, employee data or operational data. None may be invented. All people, tasks and numbers are fictional training data.
- **Testimonials, statistics and customer claims:** None exist. Home shows real lesson previews instead.
- **ClickUp facts:** These come from help.clickup.com and clickup.com, and each lesson records its review date.

## Product Principles

1. **Practice over presentation.** Every concept leads to something the learner does, and completion is checked against what they actually did.
2. **Truthful by construction.** Simulations are labeled as simulations, dependencies on plan or role are stated, uncertainty is marked, and numbers come from the shared training data.
3. **Arabic first, precise with English.** The explanations use clear, simple Arabic. ClickUp terms, shortcuts and formulas keep their English form and left-to-right direction.
4. **Calm enough for long sessions.** Show the essentials first and disclose more on request. Motion explains; it does not decorate.
5. **Nothing inert.** Every visible control works; otherwise it is not shipped.

## Accessibility & Inclusion

- Correct RTL layout, with isolated LTR runs for English terms.
- Full keyboard operation with visible focus.
- Adequate contrast.
- `prefers-reduced-motion` support.
- An accessible data table for every chart.
- Demonstrations that make sense without sound.
- A layout that suits beginners with little technical experience.
