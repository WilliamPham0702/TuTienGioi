# AI Agency Shared Workspace

Canonical shared task/artifact handoff area for TuTienGioi. Store task state, handoffs, manifests, logs and synthetic connection-test artifacts.

## Structure
- tasks/: task records and dependencies
- handoffs/: producer-to-consumer notes
- manifests/: artifact metadata/checksums
- logs/: run/audit notes
- tests/: shared-artifact connection tests

## Dispatch
See [AI Agency Auto-Dispatch V1.0](../AI_AGENCY_AUTO_DISPATCH_V1.md). GitHub Issues labeled `ai-task` are the task inbox. The free GitHub Actions workflow validates task packets and posts a dispatch notice. It does **not** invoke external AI sessions; absent a verified native agent assignment, tasks remain WAITING_FOR_AGENT and require one manual activation step.

Do not store secrets, credentials, personal data, large media, or production assets during connection testing. Large assets are planned for an approved R2 bucket; no bucket or credentials have been provisioned here.
