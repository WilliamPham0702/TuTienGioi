# AI Task Routing & Project Backlog — TuTienGioi

## Current operating rule
This file no longer assigns permanent task ownership to a specific AI. Use `00_PROJECT/AI_ORCHESTRATION.md` for routing and `00_PROJECT/AI_TASK_TEMPLATE.md` for every assignment. ChatGPT is the preferred dispatcher. Only ChatGPT, Claude, and GitHub Copilot participate in this project.

## Free-first AI routing defaults
- ChatGPT — Thinking: task breakdown, product specifications, orchestration, integration and final review.
- Claude — Claude Code/Agent when available: technical architecture, difficult implementation, cross-module integration and complex debugging.
- GitHub Copilot — Coding Agent/Agent mode: bounded repository implementation, edits, tests and focused review.
Mode labels vary by account UI. Every task must specify the actual mode available and fallback. Do not incur additional spend.

## Task list (ownership is dynamically assigned per task)
Task status labels: OPEN, CLAIMED, IN_PROGRESS, BLOCKED, REVIEW, DONE, CANCELLED. Check repository state and evidence before changing these statuses.

### Product/design tasks
- G-002 — Update GDD to v0.3 aligned with approved GAME_FLOW and decisions D-009..D-018.
- G-003 — Specify MVP and Phase 2 expansion features, engagement, anti-spam, gifts, UI flow, policy risks.
- G-004 — Write Vietnamese system announcements, short voice lines, variants by event.
- G-005 — Specify 9:16 art layout, chibi modular character system, outfits, VFX, and P0 asset list.
- G-006 — Create initial P0 assets after G-005 is approved, using existing no-additional-cost tools/assets.

### Technical tasks
- C-001 — Technical feasibility and architecture proposal: marked completed in project history; verify current artifact before reuse.
- C-002 — Economy simulation: v0.1 artifact exists; verify current acceptance status and inputs before continuing.
- C-003 — PoC 1–5: dependent on approved architecture/PoC gate; inspect current task status before claim.
- C-004 — Core game + simulation + SQLite: dependent on P1 PoC acceptance.
- C-005 — Phaser screen/effects/announcements/TTS: dependent on approved P1 and relevant product specs.
- C-006 — Challenge, assist, positions, opportunities, leaderboard: dependent on core and product specifications.
- C-007 — Real TikTok connection, operator console, operational testing: dependent on MVP readiness and explicit PO approval for real integration.

## Important project gates and constraints
- Product Owner approval required before implementing unapproved gameplay or locking major technical choices.
- 0 VND additional project spend; no paid services/APIs/assets.
- Local simulation must remain available.
- Do not connect real TikTok accounts or use unofficial connectors without explicit approval and policy/reliability checks.
- Do not merge to main or deploy without required review and PO approval.
- Task IDs are retained as references, not proof that tasks are currently open or complete. Confirm current status from repo, branches, issues, PRs and evidence before work.
