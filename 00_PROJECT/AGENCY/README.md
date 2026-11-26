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
Follow [HANDOFF_CONTRACT_V1.md](HANDOFF_CONTRACT_V1.md). Every producer commits the artifact, manifest and handoff record. The [handoff validator](../../../scripts/agency/validate_handoffs.py) checks safe paths, existence, byte size, SHA-256 and producer/consumer metadata. The GitHub Actions workflow is opt-in and disabled by default; it runs only when repository variable `AGENCY_CI_ENABLED=true`. Local Python validation is available without Actions usage.

## Receiver simulation
PR #17 adds [receiver-side verification](../../../scripts/agency/receive_handoff.py) and tests it in a second checkout/workspace. The synthetic receiver checks the exact handoff target, manifest linkage, safe artifact path, checksum and byte size, then emits a receipt. This is a **simulation** of a separate receiving workspace; it is not proof that a second AI account or external AI session autonomously fetched the file.

Real cross-agent acceptance still requires a different AI to read the exact GitHub artifact and publish a downstream result.

Do not store secrets, credentials, personal data, large media, or production assets. Large assets require a separately approved storage decision; no object storage or credentials are provisioned.
