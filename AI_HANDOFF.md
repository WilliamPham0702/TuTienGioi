# AI Handoff Protocol — TuTienGioi

## Shared source of truth
GitHub repository: https://github.com/WilliamPham0702/TuTienGioi

Read these files before starting substantial work:
1. `00_PROJECT/PROJECT_BRIEF.md`
2. `00_PROJECT/DECISION_LOG.md`
3. `01_GAME_DESIGN/GDD_v0.1.md`
4. Relevant design/technical documents for the task.

## Responsibility boundaries
- Product Owner (WilliamPham0702): approves scope, priorities, product decisions, and acceptance.
- ChatGPT: product design, visual direction, UX, specifications, documentation, and review.
- Claude: technical architecture, implementation, tests, and engineering reports.

These are working responsibilities, not a claim that either AI has unrestricted access or can act autonomously across accounts.

## Required handoff format
Every handoff must include:
- Task ID and title.
- Goal and user-visible outcome.
- Source documents and exact version/commit.
- Approved constraints and decisions.
- Deliverables and changed file paths.
- Test evidence (commands, results, environment).
- Known limitations and unresolved questions.
- Next owner and next action.

## Engineering safety
- Never commit secrets, API keys, access tokens, private credentials, or personal data.
- Do not put TikTok credentials in frontend code or repository files.
- Use environment variables or a secrets manager for runtime credentials.
- Work on feature branches; do not push experimental work directly to `main`.
- Open a pull request for review before merging.
- Do not deploy to production without explicit Product Owner approval.
- Treat TikTok integration libraries and unofficial event sources as unverified until their current terms, stability, and policy compliance are checked.
- Include tests and evidence; do not claim tests passed unless they were actually run.

## Current project status
- Repository created and accessible to the connected GitHub integration.
- Initial project brief, game design baseline, decision log, and handoff protocol added.
- No engine, rendering stack, deployment target, or TikTok integration method has been selected.
- No game code has been implemented yet.
