# TuTienGioi — Execution Playbook & 3-AI Handoff

**Status:** Draft execution plan  
**Project:** TikTok LIVE interactive xianxia game  
**Only participating AIs:** ChatGPT, Claude, GitHub Copilot  
**Source of truth:** This repository. Do not rely on chat history as the only project record.

## 1. Operating model

### Roles

- **ChatGPT — Product Owner / Game Director / Orchestrator**
  - Owns product scope, GDD, prioritization, task breakdown, acceptance criteria and final review.
  - Creates task packets and routes work to Claude or Copilot.
  - Never claims an AI ran a task unless a repository artifact, commit, execution receipt or test result proves it.
- **Claude — Technical Lead / Primary Implementer**
  - Owns technical architecture, complex implementation, integration and difficult debugging.
  - Reads the task packet and latest accepted artifacts before starting.
  - Produces code on a dedicated branch and opens a PR; does not merge.
- **GitHub Copilot — Coding Agent / Test & Review Partner**
  - Owns bounded implementation tasks, test creation, static checks, bug reproduction and independent review.
  - Works on a separate branch or separate files from Claude; never concurrently edits the same files without an explicit handoff.
  - Reports exact tests and changed files.

No fourth AI, no assumed external worker. The three agents must not invent decisions that contradict the GDD.

### Single source of truth / shared workspace

Use the existing repository and its existing Agency structure:

- AI_HANDOFF.md — entry point for every AI joining the project.
- 00_PROJECT/AI_AGENCY_ARCHITECTURE.md — Agency architecture and operating boundaries.
- 00_PROJECT/AGENCY/HANDOFF_CONTRACT_V1.md — handoff/receipt rules.
- 00_PROJECT/AGENCY/tasks/ — task requests and status.
- 00_PROJECT/AGENCY/handoffs/ — completed work, evidence and next-agent handoffs.
- 00_PROJECT/AGENCY/manifests/ — worker/task capability manifests.
- 00_PROJECT/AGENCY/tests/ — Agency and handoff tests.
- 01_GAME/GDD_TUTIENGIOI_LIVE.md — game design baseline (currently on the GDD checkpoint branch / PR #33 until merged).
- 01_GAME_DESIGN/ — existing design specifications and game flow documents.

Do not create a parallel folder named shared. The repository is the shared workspace. A task's exact handoff directory is recorded in its task file.

### Standard task lifecycle

1. ChatGPT creates one task file under 00_PROJECT/AGENCY/tasks/<TASK-ID>.md, including owner AI, goal, scope, prohibited changes, inputs, deliverables and acceptance criteria.
2. The assigned AI first reads AI_HANDOFF.md, the Agency architecture, the handoff contract, the current GDD and its task file.
3. The AI claims the task using the repository's existing claim/receipt mechanism before work. If the native trigger/claim route is not available, it must state that and wait for a manual prompt; never fabricate a claim.
4. The AI works only within its assigned scope and uses a dedicated branch.
5. It saves outputs and evidence under 00_PROJECT/AGENCY/handoffs/<TASK-ID>/ (or the exact path specified in the task), commits the work and opens a PR when code or canonical documents change.
6. It writes a completion receipt containing: status, summary, changed paths, commit/PR links, tests run and results, known limitations, unresolved decisions, and the recommended next task/AI.
7. The next AI is dispatched with a short prompt that names the task file and exact handoff paths. It must read those files from GitHub; do not paste the entire GDD into every prompt.
8. ChatGPT checks the evidence against acceptance criteria. A receipt saying “done” alone is not proof. Failed checks return to the original owner as a fix task.
9. Only the user authorizes merge/release/real TikTok integration or other production-impacting actions. No auto-merge.

## 2. Automation: what is automatic and what is not

The repository currently contains Agency workflows for task dispatch, cross-AI handoff simulation, execution packet bridge, handoff validation, receipt checking, worker discovery, native trigger gating and integration tests. These are useful infrastructure, but the existence of workflow files does not prove Claude and Copilot are currently connected and executing real tasks unattended.

**Required first action:** run the Agency worker-discovery, native-trigger-gate, cross-agent handoff and integration-test workflows. Record separately for ChatGPT, Claude and Copilot:
- can read the repository;
- can claim a task;
- can write/commit to a task branch;
- can publish a completion receipt;
- can trigger the next AI;
- can return a test result.

Only mark an AI as autonomous when all required capabilities are proven by a real end-to-end run. Simulation success is not proof of native execution.

### User effort

- If all three native workers and the handoff trigger are verified: the user does not copy prompts between AIs. ChatGPT creates the task; the Agency dispatches; the next AI reads the committed handoff; ChatGPT reports the result.
- Until that verification passes: the user only needs to copy the ready-made prompt supplied by ChatGPT into the named AI, or use the GitHub task link if that AI has repository access. Do not copy the whole GDD or manually retype results.
- If Claude/Copilot cannot access the repository, provide the task file and referenced handoff files (links or attachments). The AI must say which inputs it could not access; it must not pretend it read them.

## 3. Delivery phases and task ownership

### Phase 0 — Prove the 3-AI Agency workflow

**Lead:** ChatGPT  
**Executors:** Claude and Copilot in separate test tasks

1. ChatGPT inspects the current Agency architecture, manifests, workflows and handoff contract.
2. Claude performs a real read → claim → write artifact → commit → receipt test.
3. Copilot independently performs the same test on a different test task.
4. ChatGPT runs/inspects cross-agent handoff and integration tests; verifies the next AI can read the prior artifact.
5. Record capability as PASS / FAIL / NOT VERIFIED for each AI.

**Exit gate:** at least one real Claude-to-Copilot or Copilot-to-Claude handoff is proven, with committed artifact and receipt. If not, operate in manual prompt mode.

### Phase 1 — Freeze the Game Design Document

**Lead:** ChatGPT  
**Reviewer:** Claude  
**Consistency / test checklist:** Copilot

1. Consolidate all user-approved decisions into the canonical GDD.
2. Mark every rule as APPROVED, PROPOSED or OPEN; never convert a proposal into an approved rule.
3. Remove contradictions and prohibited systems: no equipment, no pháp bảo, no upgrade system.
4. Keep the LIVE experience simple; avoid traditional RPG inventory and management complexity.
5. Claude reviews feasibility and ambiguity without changing approved game design.
6. Copilot checks tables, formulas, totals, terminology and cross-section consistency.
7. ChatGPT resolves only material conflicts and publishes a GDD revision PR.

**Deliverables:** canonical GDD, decision log, open-questions list limited to essential decisions.

**Exit gate:** no unresolved blocker that prevents a playable MVP.

### Phase 2 — MVP scope, architecture and vertical-slice specification

**Lead:** ChatGPT defines player experience and acceptance criteria.  
**Technical owner:** Claude.  
**Independent review:** Copilot.

1. Define the smallest playable LIVE loop: join by comment, create/resume character, root reveal, cultivation, breakthrough, one Boss encounter, reward and leaderboard.
2. Define game-client, game-server, persistence, event-ingestion and overlay boundaries.
3. Define stable TikTok user identity, duplicate-event protection, reconnect and recovery behavior.
4. Define synthetic/mock LIVE events first; do not require real TikTok access for local development.
5. Specify performance and observability requirements for a long-running PC LIVE stream.
6. Claude writes architecture and vertical-slice technical plan.
7. Copilot reviews failure cases and writes architecture checks.
8. ChatGPT approves scope against the GDD.

**Deliverables:** architecture document, event/data contracts, MVP backlog, vertical-slice acceptance checklist.

**Exit gate:** the team can build one end-to-end player journey without guessing core interfaces.

### Phase 3 — Build the first playable vertical slice

**Implementation lead:** Claude.  
**Bounded coding and tests:** Copilot.  
**Product acceptance:** ChatGPT.

1. Create a minimal world scene and camera.
2. Implement join/resume using a stable test identity.
3. Display the character and saved root.
4. Implement base cultivation and one breakthrough path.
5. Add one test monster/Boss and damage contribution.
6. Grant a simple reward and show a basic leaderboard.
7. Persist state and restore after restart.
8. Add synthetic LIVE event input for comments, likes and gifts.
9. Copilot writes automated tests for the vertical slice and reviews edge cases.
10. ChatGPT checks that the result feels understandable and watchable as a LIVE stream.

**Deliverable:** a local playable build with deterministic test mode.

**Exit gate:** a new test user can join, progress, fight, receive a reward, disconnect and resume without data corruption.

### Phase 4 — Complete core gameplay systems

**System implementation:** Claude.  
**Tests, bounded fixes and review:** Copilot.  
**Rules and acceptance:** ChatGPT.

Work in separate, reviewable tasks:
- character identity, persistence and reconnect;
- root reveal and cultivation calculations;
- realms and automatic breakthrough effects;
- pills and direct cultivation rewards;
- monsters and seven Boss levels;
- shared Boss damage/reward calculation;
- spirit stones and remaining permitted item groups;
- hourly Top 10 and reward pool;
- camera event priority and event queue;
- simple player-facing UI, notices and sound.

Do not implement equipment, pháp bảo, upgrades, offline cultivation or unapproved mechanics.

**Exit gate:** each system has unit/integration tests and passes its GDD acceptance cases.

### Phase 5 — TikTok LIVE integration

**Design and safety gate:** ChatGPT.  
**Integration implementation:** Claude.  
**Mock tests, duplicate-event and reconnect tests:** Copilot.

1. Confirm an approved and technically available TikTok LIVE event source before coding a real connector.
2. Keep a provider-independent event interface.
3. Complete mock comment/like/gift flow first.
4. Add real connector only after credentials, permissions and terms are verified.
5. Validate sender identity, gift mapping, timestamps, retries and idempotency.
6. Keep a safe fallback to mock mode; never silently switch a live production session to a different backend.
7. Do not store secrets in source code or task artifacts.

**Exit gate:** real events are received and processed once, with an auditable event/reward ledger, in an explicitly approved test session.

### Phase 6 — Full-system QA and performance

**Test plan:** ChatGPT.  
**Fix owner:** Claude.  
**Independent automated QA:** Copilot.

Test:
- concurrent players and long LIVE sessions;
- comment parsing with Vietnamese accents, case and common typos;
- repeated or delayed events;
- Boss damage and reward allocation;
- hourly leaderboard cutoff and eligibility;
- disconnect/reconnect and process restart;
- camera queue under simultaneous events;
- persistence integrity and performance;
- UI readability at stream resolution;
- no unapproved paid services or production writes.

Every defect becomes a task with reproduction steps, expected/actual result and severity.

**Exit gate:** required tests pass, no unresolved critical/high defects, and a release candidate is reproducible.

### Phase 7 — Controlled release

**Release checklist:** ChatGPT.  
**Build and release engineering:** Claude.  
**Release verification:** Copilot.

1. Build a versioned PC package.
2. Produce release notes and a rollback procedure.
3. Run a private test LIVE with synthetic events first.
4. Run a real LIVE pilot only after explicit user approval and TikTok integration verification.
5. Monitor errors, event processing, persistence and frame performance.
6. Roll back if release gates fail; do not auto-deploy production.

**Exit gate:** user accepts the pilot and explicitly authorizes wider release.

## 4. Ready-to-use prompts

### Prompt to start a task in Claude

> You are the assigned Claude worker for the TuTienGioi project. Work only in the GitHub repository WilliamPham0702/TuTienGioi.
>
> Before doing anything, read AI_HANDOFF.md, 00_PROJECT/AI_AGENCY_ARCHITECTURE.md, 00_PROJECT/AGENCY/HANDOFF_CONTRACT_V1.md, the current canonical GDD (01_GAME/GDD_TUTIENGIOI_LIVE.md on the GDD checkpoint branch until its PR is merged), and the exact task file I provide.
>
> Read the latest handoff artifacts named by that task directly from the repository. Do not ask me to paste material already available in GitHub. Do not assume a file exists: verify the path and branch. If you cannot access the repository or a required artifact, stop and report the missing path.
>
> Claim the task through the repository's supported Agency mechanism if available. Implement only the task scope on a dedicated branch. Do not edit files assigned to another AI. Do not merge, deploy, use paid services, add secrets, or change production integrations.
>
> When finished, commit your work, open a PR if appropriate, save a handoff artifact under 00_PROJECT/AGENCY/handoffs/<TASK-ID>/, and publish a completion receipt with changed files, commit/PR, exact tests and results, limitations, and recommended next AI. State DONE only when the deliverables and acceptance criteria are met; otherwise state BLOCKED or NEEDS REVIEW.
>
> Task: <TASK-ID and GitHub task-file link>.

### Prompt to start a task in GitHub Copilot

> You are the assigned GitHub Copilot worker for WilliamPham0702/TuTienGioi.
>
> First read AI_HANDOFF.md, 00_PROJECT/AI_AGENCY_ARCHITECTURE.md, 00_PROJECT/AGENCY/HANDOFF_CONTRACT_V1.md, the current canonical GDD and the exact task file. Then read the previous AI's handoff artifacts from the paths recorded in the task. Fetch them from GitHub; do not rely on a pasted summary when the source file is available.
>
> Your assignment is: <TASK-ID and exact scope>. Do not expand scope or change approved game rules. Do not edit the same files another worker is currently changing. Work on a separate branch, add or update tests, run the specified checks, commit and open a PR if code changes.
>
> Save a completion report and evidence under 00_PROJECT/AGENCY/handoffs/<TASK-ID>/. Include changed paths, commit/PR, test commands and results, known issues, and the recommended next AI/task. Never claim tests passed unless they actually ran. Do not merge or deploy.

### Prompt for the next AI after a handoff

> Continue TuTienGioi task <NEXT-TASK-ID>. Read AI_HANDOFF.md, 00_PROJECT/AGENCY/HANDOFF_CONTRACT_V1.md, the current GDD, task file <TASK-FILE-LINK>, and the prior completion artifact <HANDOFF-ARTIFACT-LINK> from GitHub before working. Verify the referenced commit/PR and tests. Treat the prior artifact as input, not as unquestionable truth. Complete only the next task's scope, then save your own artifact and completion receipt and recommend the next AI. If any required artifact is missing or inconsistent, stop and report it instead of guessing.

### Prompt for ChatGPT final review

> Review task <TASK-ID> in WilliamPham0702/TuTienGioi. Read the task file, handoff artifact, commit/PR diff and actual CI/test results. Compare each acceptance criterion against evidence. Return PASS / FAIL / BLOCKED for each criterion, list missing evidence and create a narrowly scoped fix task if needed. Do not infer success from an agent's completion message. Do not merge or deploy.

## 5. Completion message required from every AI

Every AI must finish with this exact structure in its handoff report:

- **Status:** DONE / NEEDS REVIEW / BLOCKED
- **Task ID:**
- **Summary:**
- **Changed files:**
- **Branch / commit / PR:**
- **Tests actually run:**
- **Results / evidence:**
- **Known limitations / unresolved items:**
- **Next AI:** ChatGPT / Claude / GitHub Copilot
- **Next task ID:**
- **Next-agent prompt:** ready to copy, including the exact GitHub links

The AI must not simply say “finished” in chat. The durable artifact and receipt in GitHub are the handoff.

## 6. What the user needs to do

**Normal operation after automation is proven:** approve major game-design decisions, provide required account permissions when needed, test the playable build, and authorize real TikTok integration/release. No copying the GDD between AIs.

**Temporary manual mode:** if native worker discovery or trigger tests fail, copy only the ready-made prompt for the named AI and provide the GitHub task link. When that AI completes, ChatGPT checks its receipt and gives the next prompt. The user should not manually summarize the work or decide which file to pass on.

## 7. Immediate next actions

1. Verify the three AI workers individually with real repository read/write/receipt tests.
2. Verify one complete cross-AI handoff using a small harmless documentation task.
3. Record whether the system is AUTO or MANUAL for each worker.
4. Only then dispatch the GDD consolidation task and begin the game build sequence.

**Important:** The Agency workflow files and simulations are not by themselves proof that all three AIs can autonomously message each other. Keep manual handoff enabled as fallback until a real cross-agent task is completed and verified.
