# Autonomous Task Scheduler & Worker Queue V1

A deterministic queue planner for agency tasks. It manages priorities, dependencies, capability matching, availability, retry limits and expired leases. **Planning is autonomous; execution is not.**

## Queue input
Create `agency-work/queue.json` with a `tasks` array. Each task can have:
- `task_id`, `status` (OPEN/WAITING_FOR_AGENT/IN_PROGRESS/DONE/BLOCKED/CANCELLED)
- `priority` (P0–P3; P0 highest)
- `depends_on` (task IDs; all must be DONE)
- `required_capabilities` (matched to enabled workers)
- `available_at`, `created_at`
- `attempts`, `max_attempts`, `lease_expires_at`, optional `blocked_reason`

## Run locally (free)
```bash
python scripts/agency/scheduler.py --queue agency-work/queue.json --workers scripts/agency/workers.json --out agency-work/schedule.json --limit 1
```
Use `--now 2026-01-01T00:00:00+00:00` for deterministic test/debug output.

Planner sorts eligible tasks by priority then creation time and ID, matches enabled workers by capabilities, and emits a capped plan. Expired leases get a retry decision with capped exponential backoff; tasks reaching retry limit are blocked. Unknown dependencies are blocked; unfinished dependencies remain queued.

## Safety boundary
Output decisions `READY_FOR_MANUAL_EXECUTION`; it does not claim worker acceptance. `dispatch_enabled=false`, `ai_invoked=false`, `external_session_started=false`. It does not launch AI, call paid APIs, use secrets, deploy Production, or merge PRs. Worker claims and actual receipts remain separate stages.
