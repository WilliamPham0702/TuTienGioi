# AI Agency Shared Workspace — Artifact Contract

## Example shared asset
Task ASSET-TEST-001 creates a synthetic sample image and saves it in the shared workspace. HANDOFF-TEST-002 consumes that exact image and produces a derivative report/manifest.

## Asset ID and metadata
Use immutable IDs such as asset-test-001-v1. Never rely on chat attachments or local-only files. Each manifest records asset ID, task ID, producer AI/mode, UTC timestamp, repo path or approved storage URI, filename, MIME, actual byte size, SHA-256, prompt/spec path, validation evidence/status, downstream tasks, and handoff note.

## Publishing rules
- Producer saves files, not merely pastes them in chat. Use a small synthetic, non-sensitive artifact.
- GitHub is for small text and test assets where supported. Never commit large binaries, credentials, or secrets.
- If platform cannot write to GitHub, use authorized connector/runner or mark WRITE_ACCESS=NOT_VERIFIED. Do not claim handoff works.
- Downstream AI identifies exact upstream path/asset ID, reads it directly, and records verifiable source evidence/checksum.
- No manual file relay between agents.