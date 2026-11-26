# AI Agency Shared Workspace

Canonical shared task/artifact handoff area for TuTienGioi. Store task state, handoffs, manifests, logs and synthetic connection-test artifacts.
- tasks/: task records and dependencies
- handoffs/: producer-to-consumer notes
- manifests/: artifact metadata/checksums
- logs/: run/audit notes
- tests/: shared-artifact connection tests

Do not store secrets, credentials, personal data, large media, or production assets during connection testing. Large assets are planned for an approved R2 bucket; no bucket or credentials have been provisioned here.