# AI Agency Shared Workspace

Canonical shared task/artifact handoff area for TuTienGioi. Store task state, handoffs, manifests, logs and synthetic connection-test artifacts.

## Structure
- tasks/: task records and dependencies
- handoffs/: producer-to-consumer handoff records (JSON)
- manifests/: artifact metadata and SHA-256 manifests (JSON)
- logs/: run/audit notes
- tests/: shared-artifact connection tests and synthetic fixtures

## Dispatch
See [AI Agency Auto-Dispatch V1.0](../AI_AGENCY_AUTO_DISPATCH_V1.md). GitHub Issues labeled `ai-task` are the task inbox. The dispatch workflow validates task packets and posts a notice. It does **not** invoke external AI sessions; absent a verified native agent assignment, tasks remain WAITING_FOR_AGENT and require one manual activation step.

## Artifact handoff
Follow [HANDOFF_CONTRACT_V1.md](HANDOFF_CONTRACT_V1.md). Every producer commits the artifact, manifest and handoff record. The [handoff validator](../../../scripts/agency/validate_handoffs.py) checks safe paths, existence, byte size, SHA-256 and producer/consumer metadata. The free GitHub Actions workflow runs these checks on relevant pull requests and main pushes.

A passing validator proves artifact integrity, not that another AI account independently fetched the artifact. Cross-agent acceptance still requires a different AI to read the exact GitHub artifact and publish a downstream result.

Do not store secrets, credentials, personal data, large media, or production assets. Large assets require a separately approved storage decision; no object storage or credentials are provisioned.
