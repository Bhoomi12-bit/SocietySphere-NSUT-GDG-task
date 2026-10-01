# SocietySphere — implementation plan

## Product approach
A static, mobile-first NSUT society discovery product built with semantic HTML, CSS variables, modular vanilla JavaScript, and JSON. `data/societies.json` is the single source for all society-specific copy, links, roles, activities, accents, and demo countdown settings. The UI explicitly distinguishes public-source summaries from official branding and uses text/icon fallbacks when reusable assets cannot be reliably established.

## Design direction
- **Design movement:** Editorial student platform with a subtle developer-tool / campus wayfinding aesthetic.
- **Core principles:** Evidence-led, airy but information-rich, society-specific accents, and interaction clarity.
- **Color philosophy:** Warm paper and ink create a campus-publication feeling; a sharp cobalt-lime signature accent suggests discovery and energy. Dark mode becomes ink-blue with soft paper surfaces rather than a simple inversion.
- **Layout paradigm:** Asymmetric editorial sections with a left rail of labels, oversized but purposeful type, and card clusters that feel like a printed programme index rather than a generic centered grid.
- **Signature elements:** Cobalt “signal” dot/wordmark, bracketed metadata labels, and a diagonal society accent stripe used sparingly in cards and detail headers.
- **Interaction philosophy:** Every interaction reveals context: filters announce result counts, quiz answers update progress, and detail pages preserve a clear route back to the society index.
- **Animation:** 180–320ms ease-out entrances, slight card lift/stripe movement, quiz slide transitions, and a subtle success pop. Respect `prefers-reduced-motion` by removing transforms and transitions.
- **Typography:** `Space Grotesk` for display/UI labels, `DM Sans` for body copy, with generous line-height and tabular numerals for countdowns.
- **Brand essence:** The NSUT society index for students choosing where to contribute — observant, welcoming, editorial.
- **Brand voice:** Direct and warm, never corporate. Examples: “Find your people. Find your society.” and “Six communities. Six different ways to create, perform, question and build.”
- **Wordmark/logo:** A compact `S·S` signal mark paired with the SocietySphere wordmark; the dot is the shared discovery signal.
- **Signature brand color:** Cobalt `#3157FF`, paired with acid-lime `#D7F36B` as a discovery highlight.

## Project structure
- `index.html` — semantic shell and route mount points.
- `styles.css` — responsive design system, light/dark tokens, card/detail/form states, motion rules.
- `app.js` — data loading, routing, rendering, search/filtering, quiz, countdown, form flow, theme persistence, mobile menu.
- `data/societies.json` — six researched societies and source metadata.
- `public/manus-routes.json` — route manifest for home, index, quiz, about, and dynamic society paths.
- `app.config.ts` — project logo metadata.

## Material constraints
No backend is needed. Public Instagram and official pages are linked as sources; unstable or permission-unclear image assets are not hotlinked. Society identity is represented with initials plus category-specific CSS marks and resilient fallback cover treatments. Recruitment deadlines are explicitly demo-configured and never presented as official.

## Serving
Use a minimal Node static server on port 3000, bound to `0.0.0.0`, with SPA fallback for dynamic society routes and a direct static response for `/manus-routes.json`.
