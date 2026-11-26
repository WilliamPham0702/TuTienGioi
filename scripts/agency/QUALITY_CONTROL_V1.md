# Quality Control & Auto-Review V1

## Purpose
Add a deterministic quality gate for worker return receipts. The tool checks receipt lifecycle/required fields, declared deliverables, presence of a test summary, and optional shared-workspace artifact integrity.

This is intentionally not an LLM judge: it is free, reproducible, offline, and cannot invent subjective quality scores.

## Run a review
```bash
python scripts/agency/quality_review.py \
  --receipt agency-work/receipts/TASK-001.json \
  --workspace agency-workspace \
  --current-status IN_PROGRESS \
  --out agency-work/review.json
```

Exit code 0 means no structural blockers were found and the result is `ACCEPT_FOR_HUMAN_SIGNOFF`. Exit code 1 means `NEEDS_REVISION`; read the findings and correction request.

## Receipt fields
The existing receipt protocol remains authoritative. A REVIEW receipt must include the required lifecycle fields, a non-empty deliverables list, and a non-empty `test_summary`. Deliverable entries may be non-empty strings or objects containing at least one of `path`, `name`, `url`, or `description`.

Optional `artifact_manifests` is a list of manifest paths under the shared workspace. Each supplied manifest and object is verified using the PR #28 SHA-256 content-addressed format. If no manifests are supplied, artifact integrity is marked not applicable rather than failed.

## Review decisions
- `NEEDS_REVISION`: one or more structural or integrity blockers. The output includes a machine-readable finding and correction request.
- `ACCEPT_FOR_HUMAN_SIGNOFF`: no structural blockers found. This is not final acceptance or proof of quality. A human must inspect the actual deliverables and independently assess test evidence before changing the task to DONE.

## Evidence and safety
- `test_summary` is worker-reported text, not proof that tests ran or passed.
- The tool does not execute tests, inspect arbitrary source trees, invoke an AI reviewer, modify task queues, or change receipt status.
- No auto-merge, external AI invocation, secrets, paid APIs, or Production deployment.
- Treat worker outputs and manifests as untrusted. SHA-256 verifies bytes, not authorship, safety, or correctness.
- The output always sets `auto_merge=false`, `ai_invoked=false`, and `human_signoff_required=true`.

## Tests
```bash
python -m unittest discover -s scripts/agency -p 'test_quality_review.py'
```
