# AI Agency Shared Artifact Handoff Contract V1.0

## Purpose
Make repository handoffs verifiable without moving files through the Product Owner. GitHub remains the shared source of truth. This contract validates committed files; it does not wake external AI sessions.

## Producer requirements
For every deliverable, the producing AI must:
1. Commit the artifact to the repository (small text/test assets only; do not commit secrets, personal data, or large binaries).
2. Add one JSON manifest under `00_PROJECT/AGENCY/manifests/<asset-id>.json`.
3. Add one JSON handoff record under `00_PROJECT/AGENCY/handoffs/<task-id>.json`.
4. Include the exact repository-relative artifact path, byte size, SHA-256, producer AI and exact mode.
5. State the downstream AI and its next action.
6. Request REVIEW only after the artifact, manifest, handoff and test evidence are committed.

## Manifest schema (V1)
Required fields:
- `asset_id`: immutable unique identifier, e.g. `asset-001-v1`
- `task_id`: producing task ID
- `producer.ai` and `producer.mode`
- `created_at_utc`: ISO-8601 UTC timestamp
- `artifact.path`: safe repository-relative path (no absolute paths or `..`)
- `artifact.mime_type`, `artifact.size_bytes`, `artifact.sha256`
- `validation.status`: e.g. `PASS`, `SYNTHETIC_TEST`, or `NOT_RUN`

## Handoff schema (V1)
Required fields:
- `task_id`, `from_ai`, `to_ai`, `asset_id`
- `artifact_path` and `sha256`, matching the source manifest exactly
- `next_action`: a concrete instruction for the receiving AI

## Automated checks
The GitHub Actions workflow is opt-in and runs only when repository variable `AGENCY_CI_ENABLED=true`, on pull requests and relevant pushes to main. It uses Python standard library only and:
- validates JSON structure and required metadata;
- rejects unsafe/absolute artifact paths;
- verifies artifact existence, actual byte size and SHA-256;
- verifies handoff asset ID, source AI, path and checksum against its manifest;
- runs unit tests for valid, tampered-checksum and missing-artifact cases.

The workflow is deliberately disabled by default to avoid unexpected Actions usage or charges. Run the local commands below for validation without using Actions.

A green workflow proves repository handoff integrity only. It does not prove that a second AI account independently accessed the artifact. Cross-account acceptance still requires Agent B to read the committed path directly and publish a downstream commit/report.

## Local validation (no Actions runner)
```bash
python -m unittest discover -s scripts/agency -p "test_*.py" -v
python scripts/agency/validate_handoffs.py --root .
```

## Free-first and safety
No external API, secrets, paid runner, object storage, or production deployment is used. The local validator uses only the Python standard library. Enabling GitHub Actions requires the Product Owner to confirm the repository's billing/free allowance first. Large binary assets require a separately approved storage decision and are out of scope.
