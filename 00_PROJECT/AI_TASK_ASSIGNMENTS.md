# AI Task Assignments — TuTienGioi

## Governance
- Product Owner: WilliamPham0702. Final authority on scope, priorities, visual direction, budget, acceptance, and production release.
- ChatGPT: Product Design & Creative Direction.
- Claude: Lead Developer & Technical Architect.

## Non-overlapping ownership

### ChatGPT — Product / Creative
Owns:
- Product vision, player experience, gameplay specifications, GDD and UX requirements.
- Visual art direction, reference imagery, scene composition, character and costume direction, VFX direction, UI layout.
- Acceptance criteria from the player-facing/product perspective.
- Design review of implementation against approved specifications.

Does not independently:
- Choose or change the technical stack without a technical proposal and Product Owner approval.
- Modify production code or merge/deploy changes without an explicit task and review.
- Change approved game economy or progression rules without approval.

### Claude — Engineering
Owns:
- Technical feasibility analysis and architecture proposals.
- Engine/rendering, client, backend, database, event pipeline, build and deployment recommendations.
- Implementation, automated tests, performance profiling, bug fixing, and engineering documentation.
- TikTok LIVE integration investigation using currently supported and policy-compliant approaches.

Does not independently:
- Redesign approved gameplay, visual identity, or monetization rules.
- Select paid services or incur costs without approval.
- merge to main or deploy to production without explicit Product Owner approval.

## Current phase: Discovery and foundation (no production code yet)

### Task C-001 — Claude: Technical feasibility and architecture report
Deliver a report covering:
1. Compare suitable rendering/game approaches for a vertical 3D LIVE scene (e.g. Unity, Unreal, web-based 3D) with trade-offs.
2. Recommend client/rendering architecture, backend, database, realtime/event processing, operator console, streaming/OBS integration, and hosting.
3. Investigate current supported TikTok LIVE event access options, account/region constraints, platform terms, reliability, and fallback/manual test mode. Clearly distinguish official/approved access from unofficial libraries.
4. Estimate practical MVP scope, development phases, risks, operating costs, and hardware requirements. State assumptions and ranges, not false precision.
5. Propose a small technical proof of concept and measurable acceptance criteria.
6. List decisions that require Product Owner approval.

Constraints:
- Do not write game implementation code yet.
- Do not add credentials, tokens, or secrets to the repository.
- Do not choose paid services or create recurring costs.
- Do not modify approved product documents. Put the report in `08_TECHNICAL/TECHNICAL_ARCHITECTURE_PROPOSAL.md` on a feature branch and open a PR, or provide the report for review if the connector cannot create branches/PRs.
- Do not merge or deploy.

### Task G-001 — ChatGPT: Product and visual foundation
Deliver:
1. Refine the GDD into an MVP experience specification, preserving unresolved choices as open questions.
2. Define the vertical LIVE screen zones and readability rules for a busy sect hall.
3. Create an art direction brief for the sect grand hall, Sect Master, Elders, Deacons, and disciple crowd.
4. Define realm-based visual progression: outfit silhouettes, materials, color language, aura, and breakthrough/tribulation VFX.
5. Define player lifecycle and interaction feedback for watch time, likes, gifts/pills, breakthrough, and reconnects.
6. Produce a visual asset list with dimensions/formats and priority; do not claim assets are integrated into the game until implemented.

Constraints:
- Do not finalize the technical stack.
- Do not treat proposed realm names, economy values, or gift mappings as approved until Product Owner confirms them.
- Keep monetization optional and progression viable for free viewers.
- Keep TikTok integration subject to platform policy and supported access methods.

## Handoff protocol
Every task handoff must include:
- Task ID, objective, owner, source document versions/commit.
- Deliverables and changed paths.
- Assumptions and decisions needed.
- Test/review evidence, where applicable.
- Risks, limitations, and next action.

## Review and release gates
1. Claude submits technical proposal; ChatGPT reviews product implications; Product Owner decides.
2. ChatGPT submits product/visual specification; Claude reviews technical feasibility; Product Owner decides.
3. Only after both proposals are approved may implementation tasks be created.
4. Work on feature branches and use pull requests. Protect `main`.
5. No merge, production deployment, paid subscription, or external service commitment without explicit Product Owner approval.
6. Do not report tests as passed unless they were run and evidence is recorded.
