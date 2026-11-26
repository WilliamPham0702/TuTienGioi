# AI Orchestration Test Plan v1 — TuTienGioi

- Status: TEST SPECIFICATION — not executed by this documentation PR.
- Date: 2026-11-27
- Related design: `00_PROJECT/AI_ORCHESTRATION_TECHNICAL_DESIGN_V1.md`
- Test environment: local/offline or isolated GitHub test branch; synthetic Issues and data only.
- Hard rule: no real Claude invocation, paid API, Production, TikTok LIVE, secrets, or auto-merge during Stage 1–2.

## 1. Test strategy

Test in layers. Every test records input fixture, expected result, actual result, evidence, and PASS/FAIL/NOT RUN. A missing workflow check or missing evidence is never treated as PASS.

- Unit: task schema, state transitions, idempotency key, adapter response validation, policy decisions.
- Integration/offline: GitHub event fixtures → validator → execution packet → fake executor → branch/PR simulation → CI result → PO gate.
- Security: hostile Issue/comment content, untrusted fork events, permission boundaries, secret redaction, path/scope escape.
- End-to-end staged: manual Claude activation only after offline and CI gates pass; use a bounded documentation-only task on a test branch.
- Recovery: duplicate delivery, timeout, provider/network failure, cancellation, stale base SHA, CI failure.

## 2. Test fixtures

Use synthetic values only:
- Repository fixture: test branch in this repository or isolated test repository approved by PO.
- Issue IDs: reserved test Issues labelled `orchestration-test`; never use an active gameplay task.
- AI roster: ChatGPT (dispatcher/reviewer) and Claude (executor); no other worker IDs accepted.
- Files: `00_PROJECT/AGENCY/tests/fixtures/` only if a later implementation PR is approved.
- Fake provider: deterministic local adapter returning canned claim, heartbeat, success, failure, timeout, and cancellation responses. It must never contact an external provider.
- Fake CI: deterministic PASS, FAIL, PENDING, and MISSING check states.

## 3. Test cases and expected results

| ID | Area | Scenario | Expected result |
|---|---|---|---|
| T01 | Schema | Complete valid task assigned to Claude | ACCEPTED_FOR_QUEUE; no provider invoked in offline mode |
| T02 | Schema | Missing Task ID, scope, acceptance criteria, tests, or deliverables | BLOCKED with exact missing fields |
| T03 | Roster | Assigned AI is not Claude or ChatGPT | REJECTED; no claim or execution |
| T04 | Scope | Empty scope or wildcard scope attempting whole repository | BLOCKED pending PO clarification |
| T05 | Policy | Task requests Production, real TikTok LIVE, secret access, paid service, or auto-merge | REJECTED / PO approval required; no execution |
| T06 | State | OPEN → CLAIMED → IN_PROGRESS → REVIEW | Valid transitions recorded with actor and timestamp |
| T07 | State | Invalid transition (e.g. OPEN → DONE) | Rejected; state unchanged |
| T08 | Concurrency | Two claim events arrive simultaneously | Exactly one claim lease; other receives ALREADY_CLAIMED |
| T09 | Idempotency | Same webhook/request delivered repeatedly | One execution request, one branch, no duplicate PR |
| T10 | Branch | Branch starts from expected base SHA | PASS; exact base SHA recorded |
| T11 | Branch | Expected base SHA is stale or unavailable | BLOCKED; no silent rebase or overwrite |
| T12 | Injection | Issue title/body/comment contains shell syntax or prompt-injection instructions | Treated as untrusted data; no command execution or policy override |
| T13 | Scope | Executor attempts to edit a path outside allowed scope | Stop task; mark SCOPE_VIOLATION; no PR ready |
| T14 | Permissions | Fork PR or untrusted event attempts to access write token | No write token exposed; job skipped/denied |
| T15 | Secrets | Logs or artifacts are scanned for credential patterns | No secret value present; any detection blocks and alerts PO |
| T16 | Adapter | Claude adapter is absent/unconfigured | WAITING_FOR_AGENT; explicit manual next step; no false CONNECTED/TRIGGERED status |
| T17 | Adapter | Provider returns invalid or mismatched request_id | Reject response; do not accept branch/commit metadata |
| T18 | Lease | Executor heartbeat expires | BLOCKED; preserve branch/artifacts; no concurrent auto-reclaim |
| T19 | Retry | Transient provider/network failure | Bounded retry with same idempotency key; no duplicate side effects |
| T20 | Retry | Auth, quota, or paid-tier required | WAITING_FOR_AGENT; no paid fallback |
| T21 | Cancel | PO cancels before invocation | No provider call; status CANCELLED |
| T22 | Cancel | PO cancels during execution | Stop new actions; preserve audit and worktree/branch; status CANCELLED or BLOCKED pending stop confirmation |
| T23 | PR | Successful fake executor submits changes | PR created as Draft, linked to Issue, branch and base SHA recorded |
| T24 | PR | PR body omits test results, changed paths, risk, or rollback | Validation fails; remain BLOCKED/REVIEW incomplete |
| T25 | CI | All required checks pass | Eligible for PO review only; not auto-merged |
| T26 | CI | Any required check fails | Return to executor with evidence; PR remains unmerged |
| T27 | CI | Required check is pending or missing | BLOCKED; cannot progress to PO approval |
| T28 | PO gate | CI green but no explicit PO approval | No merge; PR remains open |
| T29 | PO gate | PO requests changes | Return to IN_PROGRESS with review notes; preserve audit trail |
| T30 | Kill switch | Global dispatch disabled | New claims/invocations prevented; existing audit/work preserved |
| T31 | Audit | Every state change and side effect | Issue/run record includes actor, timestamp, request ID, branch, commit, PR, evidence |
| T32 | Recovery | Workflow rerun after partial failure | Resume from last verified state; no duplicate branch/PR |
| T33 | Handoff | Claude output exists only in chat, not shared repo/PR | NOT DONE; require shared artifact/PR |
| T34 | Free-first | Any stage would incur unapproved spend | Stop and request PO approval; no charge |
| T35 | Regression | Existing dispatch/packet tests run | Existing behavior preserved; no external AI session started |

## 4. Stage exit criteria

### Stage 1 — offline simulation
All T01–T22 and T30–T35 pass against a fake executor. No external provider call is possible by construction. Concurrency/idempotency tests must prove exactly one claim and one side effect per request ID.

### Stage 2 — CI-only
T23–T29 pass using a synthetic branch/PR. Required CI checks are observed on the PR itself. Missing check is a failure. No merge occurs.

### Stage 3 — manual Claude handoff
Only after Stage 1–2 are accepted: one bounded, documentation-only task; manual activation in the user's authorized Claude Code session; verify claim evidence, isolated branch, Draft PR, CI, and PO review. No secret or Production access.

### Stage 4 — native invocation evaluation
Not a test of the fake adapter. Must separately prove actual account entitlement, invocation mechanism, repository permission model, cancellation, auditability, quota, and 0-VND cost. Requires explicit PO approval before implementation.

## 5. Required evidence bundle

For each test run, store:
- Test run ID, timestamp, environment, commit SHA, and test plan version.
- Test IDs executed and PASS/FAIL/NOT RUN.
- Synthetic Issue/request IDs and state transition log.
- Fake adapter invocation log proving zero external provider calls in offline stages.
- Branch/base SHA/commit/PR references for PR tests.
- CI run/check URLs and conclusions.
- Security scan summary with no secret values.
- Reviewer and PO gate outcome.

## 6. Stop conditions

Stop immediately and mark SECURITY_BLOCKED if a secret is exposed, a write occurs outside the task branch, a scope violation is detected, a Production/TikTok endpoint is touched, an unapproved paid service is invoked, or an unexpected external AI session starts.

Do not auto-retry security, permission, quota, or cost failures. Do not merge, deploy, or enable real LIVE as part of any test in this plan.

## 7. Current execution status

This file defines tests only. No test suite was executed by adding this document. Current automation remains disabled; Claude native invocation remains unconfigured; PR #36 remains separate and Draft.
