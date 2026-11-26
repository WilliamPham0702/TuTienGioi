# AI Handoff & Shared Orchestration — TuTienGioi

## Authoritative workflow
Current workflow is defined by `00_PROJECT/AI_ORCHESTRATION.md` and `00_PROJECT/AI_TASK_TEMPLATE.md`. These supersede any older fixed AI role assignment or manual prompt-copy workflow.

- Product Owner: WilliamPham0702; final approval for product scope, gameplay/design decisions, budget, account access, real TikTok connection, merge/release and deployment.
- ChatGPT is the preferred dispatcher, but not an exclusive coordinator. Any AI may inspect project status, split/propose tasks, claim open tasks, execute within scope, review non-overlapping work, and hand off.
- Prefer free modes/accounts. Claude Pro is reserved for high-complexity work. Each task must name AI, exact selectable mode, fallback, repository/branch/commit, scope, tests/evidence, and handoff.
- Shared source of truth is GitHub files/issues/commits, not private AI chat memory.

## Read before work
1. `00_PROJECT/AI_ORCHESTRATION.md`
2. `00_PROJECT/AI_TASK_TEMPLATE.md`
3. `00_PROJECT/PROJECT_BRIEF.md`
4. `00_PROJECT/DECISION_LOG.md`
5. `01_GAME_DESIGN/GDD_v0.1.md`
6. Current task's related documents
7. Current status/task board and latest handoff

## Safety and verification
- Never expose or commit secrets, tokens, credentials, cookies, or personal data.
- Do not incur charges or use paid APIs/services/assets without PO approval.
- Do not modify overlapping files with another AI's active task.
- Use feature branches and PRs for implementation. No production deploy without explicit PO approval.
- Verify actual repository state, branch, commit, diff, and tests; never claim tests pass without evidence.
- Keep handoff updated at checkpoints. Treat older handoffs as historical; verify against code and latest project docs.

## Handoff fields
Task ID/title; assigned AI and mode; goal; source docs and commit; approved constraints; files changed; test commands and actual results; limitations/blockers; next task/owner/action.
