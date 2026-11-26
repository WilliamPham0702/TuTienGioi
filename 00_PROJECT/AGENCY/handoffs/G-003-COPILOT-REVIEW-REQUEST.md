# G-003 — Copilot Review Request

- **Task:** G-003 — MVP and Phase 2 product specification
- **Reviewer:** GitHub Copilot
- **Mode:** Agent mode (review-only; do not modify the specification)
- **Branch:** task/G-003-mvp-phase2-spec
- **Starting commit:** 446390196bbdb4dd4495d17af4efea742fe7e553
- **Specification:** 01_GAME_DESIGN/MVP_PHASE2_SPEC_v0.1.md
- **Task record:** 00_PROJECT/AGENCY/tasks/G-003.md

## Review instructions
Read the specification directly from this branch and compare it with:
- 00_PROJECT/PROJECT_BRIEF.md
- 00_PROJECT/DECISION_LOG.md
- 01_GAME_DESIGN/GDD_v0.3.md
- 01_GAME_DESIGN/GAME_FLOW_v0.1.md
- 01_GAME_DESIGN/FEATURE_SPEC_v0.1.md

Check for:
1. Conflicts or omissions against approved decisions D-009..D-020.
2. Any proposal incorrectly presented as approved.
3. Missing MVP dependencies or Phase 2 items accidentally pulled into MVP.
4. Gaps in the player journey, engagement, anti-spam, gift rules, vertical UI flow, privacy/platform and operational risks.
5. Unsupported numeric thresholds, probabilities or assumptions.
6. Internal contradictions or acceptance criteria that cannot be verified.

## Output
Create or update only:
`00_PROJECT/AGENCY/handoffs/G-003-COPILOT-REVIEW.md`

Report each finding with severity (BLOCKER / MAJOR / MINOR / NOTE), exact section, explanation and recommended correction. If no finding, say so explicitly. Include source file references and commit SHA reviewed.

Do not edit the specification, game code, assets, task record or other files. Do not merge, deploy, connect real TikTok, use paid services or change production data.

At completion, state what you actually read, what was reviewed, whether the report was committed, and its commit SHA. Mark tests not run where appropriate.
