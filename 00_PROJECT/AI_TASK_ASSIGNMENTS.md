# AI Task Assignments — TuTienGioi

## Governance
- Product Owner: WilliamPham0702. Final authority on scope, priorities, visual direction, budget, acceptance, and production release.
- ChatGPT: Product Design & Creative Direction.
- Claude: Lead Developer & Technical Architect.

## Non-overlapping ownership

### ChatGPT — Product / Creative
Owns product vision, gameplay and UX specifications, art direction, visual references, scene composition, chibi character/costume design, VFX direction, UI layout, and product-side acceptance review.

### Claude — Engineering
Owns technical feasibility, architecture, engine/rendering evaluation, local data and event systems, implementation, automated tests, performance, bug fixing, and engineering documentation.

Neither AI may independently incur costs, change approved product decisions, merge to main, or deploy to production. Product Owner approval is required.

## Approved constraints and direction
- Visual direction: chibi tiên hiệp characters, beautiful atmospheric environments, polished and eye-catching effects.
- Prefer a 2D/2.5D production approach for the first release. Full 3D is not required.
- Optimize for attractive 9:16 LIVE presentation and fast time-to-live.
- Additional project spend must remain 0 VND: no paid APIs, cloud/VPS, subscriptions, paid assets, plugins, or services that may incur charges.
- Local simulation mode must be available while TikTok LIVE integration is unavailable.
- See `00_PROJECT/DECISION_LOG.md`, `00_PROJECT/PROJECT_BRIEF.md`, `01_GAME_DESIGN/GDD_v0.1.md`, and `02_ART_DIRECTION/ART_DIRECTION_BRIEF_v0.1.md`.

## Current phase: discovery and foundation; no production implementation yet

### Task C-001 — Claude: Free/local-first technical feasibility
Prepare `08_TECHNICAL/TECHNICAL_ARCHITECTURE_PROPOSAL.md` covering:
1. Compare 2D and 2.5D approaches and suitable free engines/frameworks for a vertical LIVE game. Do not assume a 3D game.
2. Recommend a stack that is maintainable by an AI-assisted, non-programmer Product Owner.
3. Evaluate local persistence, event processing, operator controls, OBS capture, and local simulation.
4. Investigate TikTok LIVE event access, account/region constraints, platform terms, reliability, and whether the candidate connector requires an external signing service or subscription.
5. Classify every component as free by license, free with limits, unverified, or paid/unacceptable.
6. Estimate MVP phases and performance risks; propose a small proof of concept and measurable acceptance criteria.
7. Explicitly identify anything that prevents a reliable 0 VND launch.

Constraints: no implementation code, no secrets, no paid service signup, no recurring costs, no changes to approved product documents, no merge/deploy. Use a feature branch and PR if supported; otherwise provide the report for review.

### Task G-001 — ChatGPT: Product and visual foundation
Deliver:
1. Refine the MVP experience and 9:16 LIVE screen zones.
2. Specify the sect hall composition, chibi character roster, roles, costume progression, and VFX language.
3. Define player lifecycle and feedback for watch time, likes, gifts/pills, breakthrough, and reconnects.
4. Prioritize a small reusable P0 asset set suitable for rapid production.
5. Ensure designs remain readable at actual livestream size and are feasible under the zero-additional-spend constraint.

Constraints: do not lock the technical stack; do not finalize unapproved economy values or gift mappings; do not claim assets are integrated until implemented.

## Handoff and release protocol
Every task handoff includes task ID, owner, source versions/commit, deliverables and changed paths, assumptions, decisions needed, test/review evidence, risks, and next action.

Claude submits technical proposals; ChatGPT reviews product implications; Product Owner approves. ChatGPT submits product/visual specifications; Claude reviews feasibility; Product Owner approves. Implementation starts only after these gates. Use feature branches and PRs. No merge, deployment, paid service, or external commitment without explicit approval. Never claim tests passed without recorded evidence.
