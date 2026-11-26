# Worker Claim and Receipt Protocol V1

## Receipt statuses and permitted transitions
- OPEN / WAITING_FOR_AGENT → CLAIMED
- CLAIMED → IN_PROGRESS
- IN_PROGRESS → REVIEW
- REVIEW → DONE or IN_PROGRESS
- Active states may transition to BLOCKED or CANCELLED.
- BLOCKED may return to OPEN or CLAIMED, or be CANCELLED.
- DONE and CANCELLED are terminal.

## Receipt format
A committed JSON receipt must include `task_id`, `agent_id`, `mode`, `branch`, `status`, `updated_at_utc`. REVIEW/DONE also require `deliverables` and `test_summary`. BLOCKED requires `blocker`. `auto_merge` must never be true.

## Validation
Run `python scripts/agency/receipt_protocol.py path/to/receipt.json --current-status IN_PROGRESS` (omit previous status for structural-only validation).
The Actions workflow is manual and opt-in with `AGENCY_CI_ENABLED=true`.

This protocol validates a recorded claim/result. It does not launch or authenticate external AI agents and does not prove a claimed identity. Do not record credentials or sensitive data in receipts.
