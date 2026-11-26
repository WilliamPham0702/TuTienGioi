# TuTienGioi AI Agency — Shared Workspace and Autonomous Handoff

## Goal
AI agents exchange artifacts through the shared workspace, not through the Product Owner manually copying chat outputs. An agent finishing work must publish its deliverable, metadata, evidence, and handoff record. A downstream agent reads the shared record and artifact directly.

## Target flow
1. Product Owner gives an outcome to the Agency.
2. Orchestrator creates scoped tasks, dependencies, acceptance criteria, and routes each task to an available AI + exact product mode.
3. Executor claims one task and reads upstream handoff/artifacts.
4. Executor creates the deliverable and publishes it to the workspace. It must not mark complete if it cannot publish.
5. Orchestrator detects completion (webhook or polling), verifies artifact path and task status, then unlocks dependent task(s).
6. Downstream executor reads upstream artifact/handoff from repository/storage and continues without human file relay.
7. Independent reviewer checks evidence and records REVIEW/ACCEPTED or changes requested.
8. Repeat until acceptance. Approval gates remain mandatory for sensitive actions.

## Shared workspace contract
GitHub is metadata, tasks, handoffs, and small text-file workspace. Binary/large media should use an approved object store (planned R2) with stable asset IDs, object paths, checksums, metadata, and access controls. R2 is NOT configured by this document; provisioning requires approval.

Every deliverable records task/source task, producer AI and mode, UTC timestamp, artifact path/URI, file type and actual size/dimensions when relevant, SHA-256 when possible, prompt/spec version, validation evidence, downstream task(s), and handoff notes.

## Folder contract
- 00_PROJECT/AGENCY/tasks/: task records, dependencies and statuses
- 00_PROJECT/AGENCY/handoffs/: handoff notes per task/version
- 00_PROJECT/AGENCY/manifests/: metadata manifest for each asset
- 00_PROJECT/AGENCY/logs/: execution and verification logs
- 00_PROJECT/AGENCY/tests/: connection/workflow test artifacts
- ASSETS/shared/: small versioned assets appropriate for Git; large binaries use approved storage and manifest

## Status transitions
OPEN -> CLAIMED -> IN_PROGRESS -> HANDOFF_READY -> REVIEW -> ACCEPTED -> downstream task OPEN. BLOCKED may be entered at any stage with reason and retry/alternate-agent proposal. FAILED is a failed attempt, not completion. Rework returns to IN_PROGRESS. Transitions record actor, timestamp, evidence.

## Dynamic agents
No permanent AI owners. Route by skill, free-tier availability, current mode/access, quotas, and complexity. One AI edits a scope at a time; non-overlapping research/review may parallelize.

## Automation requirements (not yet deployed)
An orchestration runner is required for autonomous wake-up/dispatch. It must listen for task/manifest/status changes (webhook or polling), maintain AI adapters and permissions, dispatch eligible tasks, retrieve/validate outputs, publish manifests/handoffs, retry transient failures, reassign blocked work, and audit/free-first route. A repository and prompt alone cannot autonomously wake external AI accounts. Until runner/adapters are configured, dispatch is semi-automated/manual; shared handoff can still be performed by connected agents.

## Safety boundaries
No extra spend, paid API, account credential sharing, real TikTok connection, production deploy, or main merge without approval. Never expose secrets. Use synthetic artifacts for connection tests. Keep local simulation.

## Acceptance test
PASS requires Agent A publishing a synthetic artifact and manifest; Agent B (different account) independently reads that exact artifact without user forwarding, produces a downstream output referencing artifact ID/checksum, and publishes its own manifest; reviewer corroborates both commits, files, checksums and handoff links. Access-only checks are PARTIAL.