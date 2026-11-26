# AI Shared Orchestration — TuTienGioi

## Purpose
ChatGPT is the preferred dispatcher for the Product Owner, but no AI is the sole coordinator. Any AI that has repository access and reads this protocol can inspect the project, propose/claim tasks, execute a task within its scope, review work, and prepare a handoff. The GitHub repository is the shared source of truth; AI chat memory is not.

## AI roster and mode selection (free-first)
Choose the exact mode available in the user's account UI. Mode names vary by product/version. Never claim a mode exists if it is unavailable.

| AI | Preferred mode | Primary work | Use paid quota only when |
|---|---|---|---|
| ChatGPT | Thinking for planning/review; Agent/Work only if available and appropriate | Dispatch, decomposition, specs, integration/review, small scoped work | A difficult reasoning/review task cannot be handled with Free |
| GitHub Copilot | Agent mode | Repository edits, coding, tests, focused implementation | Avoid paid features/usage beyond current entitlement |
| DeepSeek | DeepThink/Reasoning for hard logic; ordinary chat for small tasks | Logic, debugging, coding assistance, alternative solutions | No paid API or subscription is required by project tasks |
| Gemini | Thinking/Pro mode if available; otherwise standard mode | Research, independent review, QA, docs | Use free access first |
| Claude | Claude Code/Agent mode for repo tasks; extended/deep reasoning when available | Architecture, difficult implementation, complex debugging | Reserve Pro quota for high-risk/high-complexity work |

Free-first rule: select the strongest free/available mode that can complete the task safely. Claude Pro is a specialist reserve, not the default executor. Do not purchase, subscribe, use paid API, or incur project charges.

## Dispatch requirements
Every task assignment MUST explicitly state:
1. Task ID and title.
2. Assigned AI/account (ChatGPT, Claude, Copilot, DeepSeek, Gemini).
3. Exact mode to select in that product (and fallback mode if unavailable).
4. Repository and branch; expected starting commit.
5. Module/file scope (use module names only when grounded in current repository).
6. Goal and acceptance criteria.
7. In-scope and out-of-scope changes.
8. Required commands/tests and evidence.
9. Deliverable/checkpoint and handoff instructions.
10. Estimated complexity and whether parallel tasks are safe.

## Task lifecycle
- OPEN: ready to be claimed.
- CLAIMED: an AI has announced ownership but has not started edits.
- IN_PROGRESS: work underway.
- BLOCKED: work cannot proceed; record blocker and requested help.
- REVIEW: work submitted for review, with evidence.
- DONE: accepted/verified evidence is recorded.
- CANCELLED: task intentionally stopped, with reason.

## Coordination rules
- One AI owns edits for a task and its files at a time. Review/research may be parallel if it does not modify the same files.
- Before claiming: read project brief, decision log, current task board, handoff, and task-specific docs; check Git state and recent commits/PRs.
- Claim a task by updating its board record with AI, mode, timestamp, branch and commit. Do not claim tasks already CLAIMED/IN_PROGRESS unless taking over explicitly.
- If a task is too large, propose child tasks and dependencies before editing. Dispatcher may assign child tasks to different AIs, but ensure file scopes do not overlap.
- Keep tasks free-first; prefer existing tools and local execution. Do not use paid APIs, services, assets or incur spend.
- Do not change approved gameplay, architecture, budget, security, platform integration, merge or production-release decisions without Product Owner approval.
- Use feature branches and PRs; do not edit main directly for implementation. Documentation-only protocol setup may be committed to main if the repository is currently using main for project docs.
- Update task status, current project status, decision log only when an approved decision is added, and handoff after each meaningful checkpoint.
- A task is not DONE just because code was written. Record actual test results; mark tests NOT RUN when unavailable.
- On takeover, verify code and commit yourself; treat handoff as a guide, not ground truth.

## Task routing quick guide
| Task type | First choice | Mode | Reviewer |
|---|---|---|---|
| Small code change / UI implementation | Copilot | Agent | Gemini or ChatGPT review |
| Game logic / algorithm / bug | DeepSeek | Reasoning/DeepThink | Copilot or Gemini review |
| Research / technical comparison / policy check | Gemini | Thinking/Research mode | ChatGPT synthesis |
| Product requirements / game design / UX / art direction | ChatGPT | Thinking | Gemini research; Claude feasibility only if needed |
| Architecture / difficult cross-module issue | Claude (quota-reserved) | Agent/Code + deep reasoning available | Gemini independent review |
| Integration / final acceptance checklist | ChatGPT | Thinking | Product Owner acceptance |

Routing is a default, not a hard restriction. Dispatcher can select another AI when current availability, task context, skill, quota, or repository access makes it better. The assignment must explain the choice briefly.

## Shared task board
Use GitHub Issues as the task board if available. If not, maintain `00_PROJECT/TASK_BOARD.md`. Each task issue/document must contain the fields in `00_PROJECT/AI_TASK_TEMPLATE.md`. Do not duplicate a task in both places without linking them.

## Task pickup and handoff
Any AI can take over by:
1. Reading `00_PROJECT/AI_ORCHESTRATION.md` and `AI_HANDOFF.md`.
2. Reading current status/task board and the linked task's design/technical sources.
3. Verifying branch, commit, changed files and test evidence.
4. Posting a short pickup report before edits.
5. Completing only the assigned scope; updating status and handoff at checkpoint.
6. If blocked, document exact blocker and offer a scoped helper task instead of silently waiting.

## Human approvals
Product Owner approval is required for changes to approved product decisions, budget, paid services, account credentials, real TikTok integration, merge to main when required, and production deployment. AI dispatch and task claiming do not grant these approvals.


## AI connection verification (shared GitHub reporting)
- Run the standardized read-only connection check from `00_PROJECT/AI_CONNECTION_CHECK_PROMPT.md`.
- Each AI must publish its own report to `00_PROJECT/AI_CONNECTION_REPORTS/<ai-slug>.md`; do not ask the Product Owner to relay results between chats.
- Use one stable report per AI; update it on each check and include timestamp, selected platform mode, required-file read results, workflow understanding, repo/commit inspected, and access evidence.
- When the Product Owner asks ChatGPT to check connections, ChatGPT must inspect the report directory/files directly on GitHub, compare report claims against accessible repository evidence, and return the status table. Missing report = NOT VERIFIED, not a request for the user to copy/paste results.
- A report is self-reported. A status is CONNECTED only when required docs were read, workflow understood, and the report was successfully committed to this repository. Read access without successful report publication is PARTIAL.
- Reports are connection evidence only; they do not grant task ownership or permission to modify project code.


## Shared-artifact handoff requirement (AI Agency)
- A completed AI task must publish its deliverable and manifest to the shared workspace; a chat-only answer is not a completed handoff.
- Downstream AI must retrieve the exact upstream artifact directly from GitHub/shared storage. The Product Owner must not download, re-upload, or copy results between agents.
- For small artifacts, use the repository workspace. For large binary assets, use approved object storage only after it is provisioned. R2 is planned, not yet configured.
- Read `00_PROJECT/AI_AGENCY_ARCHITECTURE.md`, `00_PROJECT/AI_SHARED_WORKSPACE.md`, and `00_PROJECT/AI_AGENCY_CONNECTION_TEST.md` before the connection test.
- Autonomous dispatch requires a separate runner/adapters. Do not claim fully autonomous wake-up is implemented merely because these protocols/files exist.
