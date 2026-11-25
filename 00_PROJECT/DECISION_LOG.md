# Decision Log — TuTienGioi

Record only decisions explicitly approved by the Product Owner. Proposals must not be treated as final decisions.

| ID | Topic | Decision / status | Owner | Date |
|---|---|---|---|---|
| D-001 | Project repository | Repository is `WilliamPham0702/TuTienGioi` | Product Owner | 2026-11-24 |
| D-002 | Product concept | Interactive TikTok LIVE cultivation game; viewers are cultivators in a sect grand hall | Product Owner | 2026-11-24 |
| D-003 | Progression fantasy | Watch time contributes cultivation; likes may contribute spiritual energy; gifts may map to pills/items, subject to platform rules | Product Owner | 2026-11-24 |
| D-004 | Visual progression | Higher realms should produce more impressive effects and better outfits | Product Owner | 2026-11-24 |
| D-005 | Technical stack | **Preferred, not locked (C-002):** Phaser 4 + TypeScript (game client); Node.js + TypeScript (game core & LIVE bridge); SQLite running locally on the PC; OBS Browser Source, 9:16, design resolution 1080×1920. Final lock only after the C-002 PoC comparison with Godot 4. Proposal: `08_TECHNICAL/TECHNICAL_ARCHITECTURE_PROPOSAL.md` (PR #2). | Product Owner | 2026-11-24 (preferred); final lock pending PoC |
| D-006 | Visual style and rendering | Approved direction: attractive chibi xianxia characters; beautiful, atmospheric sect environments; polished effects; prioritize fast delivery and reliable LIVE operation. Prefer a 2D/2.5D production approach as the starting hypothesis. Do not assume full 3D. | Product Owner | 2026-11-24 |
| D-007 | LIVE integration method | **Approved direction:** adapter-based architecture with a Local Simulation Mode for development and testing independent of TikTok. Specific TikTok connector **not approved**: no unofficial connector may be used on a real account without explicit Product Owner permission; no TikTok passwords, cookies, or session tokens may be requested or stored. | Product Owner | 2026-11-24 (direction); connector pending |
| D-008 | Budget constraint | 0 VND additional project spend. No paid APIs, subscriptions, cloud hosting, VPS, paid plugins, paid assets, or services that can incur charges without explicit prior approval. Prefer local execution and free/open-source tools. Existing computer, internet, electricity, and current AI subscriptions are outside this project-spend constraint. | Product Owner | 2026-11-24 |
| D-019 | C-002 proof of concept | **Authorized:** PoC-1 visual & animation (same hall scene in Phaser 4 and Godot 4, same assets, ~60 chibi characters); PoC-2 runtime & performance in OBS Browser Source 1080×1920 at 40/60/80 characters, 30 FPS target; PoC-3 game core & data with a local simulation adapter (500–1,000 simulated players, dedup, spam limits, SQLite persistence and recovery). 0 VND; no paid tools/assets/services; no real TikTok connector; no full product build; no merge to main or deploy without explicit approval. PoC assets: original vector chibi drawn by Claude. Godot measured both as Web export (Browser Source) and native exe (Window Capture). Performance runs executed by the Product Owner on their Windows PC using a prepared measurement kit. | Product Owner | 2026-11-24 |

## Change-control rule
Before changing an approved product decision, record the proposed change, rationale, impact, and obtain Product Owner approval.

## Clarification
D-006 is the approved art direction. 2D/2.5D is the preferred starting hypothesis, not a locked engine or implementation decision. Technical stack and LIVE integration remain open.
