# TuTienGioi AI Agency — Auto-Dispatch V1.0

**Operating mode:** maximum automation with manual fallback  
**Budget:** free-first; zero unapproved spend  
**Control plane:** GitHub Issues + repository files + GitHub Actions  
**Status:** V1 scaffold; external-agent wake-up is not yet automated.

## 1. Outcome

The Product Owner gives ChatGPT an outcome. ChatGPT decomposes it into bounded tasks, selects an executor and exact product mode, writes task packets to GitHub, and tracks evidence. Agents exchange deliverables through this repository; the Product Owner should not relay files between agents.

## 2. What is automated now

- GitHub Issues are the canonical task inbox and status surface.
- A task issue must declare task ID, executor, exact mode, scope, dependencies, acceptance criteria, tests, and handoff target.
- GitHub Actions validates the task packet and posts a deterministic dispatch notice when an issue is opened or labeled `ai-task`.
- Task status and artifact links remain visible in GitHub.
- All agents are instructed to publish deliverables, manifests/checksums where relevant, and handoff notes before requesting review.
- ChatGPT can create/read GitHub tasks and verify repository evidence through its connected GitHub integration.

## 3. What is not automated yet

GitHub Actions cannot wake a logged-in Claude or Copilot chat session merely because an issue exists. No agent API, Claude Code runner, Copilot Coding Agent assignment identity, webhook adapter, or polling service has been configured and verified end-to-end.

Therefore:
- Never mark an agent as dispatched just because an issue or workflow was created.
- Use `WAITING_FOR_AGENT` when an external agent must be activated manually.
- Provide the Product Owner one concise action: open the issue in the selected agent's GitHub-capable mode and ask it to claim/execute the task.
- When a supported native GitHub agent assignment is verified for this repository, it may replace the manual activation step for that agent.
- A later adapter may be added only after checking free-tier availability and receiving approval for any paid usage or secrets.

## 4. Free-first routing

| Work | First executor | Mode | Fallback |
|---|---|---|---|
| Planning, decomposition, integration, final review | ChatGPT | Thinking / Work if available | Claude reasoning mode |
| Repository implementation and tests | GitHub Copilot | Agent mode | ChatGPT for small scoped changes |
| Architecture and high-complexity reasoning | Claude | Claude Code/Agent if available; otherwise reasoning chat | ChatGPT |
| Independent logic review | Claude or Copilot, whichever is not the author | Reasoning / Agent | ChatGPT |

Use the strongest currently available free entitlement. Claude Pro quota is reserved; do not consume paid API or purchase services. DeepSeek/Gemini may be optional reviewers only when they can access the same committed artifacts; they are not required for the core dispatch loop.

## 5. Required task packet

Every task issue and matching file under `00_PROJECT/AGENCY/tasks/` must include:
1. Task ID and title
2. Assigned AI and exact mode; fallback AI/mode
3. Status: OPEN, WAITING_FOR_AGENT, CLAIMED, IN_PROGRESS, BLOCKED, REVIEW, DONE, CANCELLED
4. Repository, branch and expected base commit
5. Dependencies and upstream artifact paths
6. In-scope and out-of-scope files/modules
7. Goal and measurable acceptance criteria
8. Required tests and evidence
9. Deliverable paths and handoff target
10. Cost/safety boundary

## 6. Lifecycle and truth rules

`DRAFT -> OPEN -> WAITING_FOR_AGENT -> CLAIMED -> IN_PROGRESS -> REVIEW -> DONE`

Alternative states: `BLOCKED`, `CANCELLED`. A task may skip WAITING_FOR_AGENT only when a real supported integration has accepted the assignment.

- CLAIMED requires an agent-authored claim comment or recorded commit.
- IN_PROGRESS requires a stated branch and scope.
- REVIEW requires committed artifacts and test evidence (or explicit NOT RUN reasons).
- DONE requires reviewer acceptance and verified artifact links/checksums where applicable.
- Workflow success means packet validation/notification succeeded, not that the AI task succeeded.
- Failed dispatch must remain visible and fall back to manual activation; never silently drop a task.

## 7. Safety boundaries

No secrets, credentials, personal data, paid APIs, paid services, R2 provisioning, TikTok live integration, production deployment, main-branch implementation, or merge without explicit authorization. Synthetic-only testing until separately approved. Do not put secrets in issues, commits, logs, or artifacts.

## 8. V1 rollout

1. Create task through ChatGPT; create GitHub Issue with `ai-task` label and task packet.
2. Workflow validates required headings and posts routing/claim instructions.
3. If no verified native agent accepts the task, set `WAITING_FOR_AGENT` and provide one manual activation action.
4. Agent reads the issue and repository context, claims the task, creates a feature branch, commits output, and posts handoff.
5. ChatGPT verifies commits/files/tests and assigns an independent reviewer.
6. Reviewer accepts or requests changes; only then mark DONE.

## 9. Acceptance test

V1 is operational when:
- A test issue triggers the workflow successfully.
- The workflow validates the task packet and posts its notice.
- An executor independently claims and publishes a synthetic artifact to the repository.
- A different agent/reviewer reads that artifact directly from GitHub and publishes a downstream review/handoff.
- ChatGPT verifies the issue history, commits, artifact paths, and test evidence.

Until the cross-agent test passes, report the agency as **partially automated**, not fully autonomous.
