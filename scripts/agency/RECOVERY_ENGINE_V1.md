# Autonomous Recovery & Retry Engine V1

## Purpose
Provide deterministic recovery decisions for stale Agency tasks. This module is a planner/auditor only; it does not invoke Copilot, Claude, DeepSeek, GitHub Actions, or arbitrary commands.

## Detection
- Expired `lease_expires_at` on IN_PROGRESS/CLAIMED tasks.
- Stale `last_heartbeat_at` using a configurable timeout (default 900 seconds).
- Missing heartbeat and lease with an old `claim_time` using the same timeout.

## Retry policy
- Increment attempts once per stale claim.
- Exponential delay starts at 60 seconds and caps at 3600 seconds.
- Block when the incremented attempt reaches `max_attempts`.
- Recommend the first enabled, available worker with matching capabilities, excluding the previous worker.
- If no alternate is eligible, keep the suggestion null; do not fabricate a worker.

## Idempotency and audit
A SHA-256 event key is derived from task ID, worker, claim time, lease expiry, and attempt count. Existing event keys prevent duplicate retry increments and duplicate history entries. The history is append-only output; persist it between invocations to retain idempotency.

## Usage
```bash
python scripts/agency/recovery_engine.py \
  --queue agency-work/queue.json \
  --workers scripts/agency/workers.json \
  --history agency-work/recovery-history.json \
  --out agency-work/recovery-plan.json \
  --now 2026-11-26T12:00:00Z
```

The command reads queue/workers/history and writes a recovery snapshot. The operator must explicitly persist the returned queue and history before a later run. No automatic task claim is performed.

## Safety
- `dispatch_enabled=false`
- `ai_invoked=false`
- No secrets, paid APIs, Production deployment, auto-merge, or external AI session.
- Recovery output is a recommendation, not proof that a worker restarted or completed work.

## Tests
Run: `python -m unittest discover -s scripts/agency -p 'test_recovery_engine.py'`
