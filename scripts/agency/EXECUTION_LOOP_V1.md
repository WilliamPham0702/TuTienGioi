# PR #24 — Autonomous Execution Loop V1

This controller connects the existing scheduler to worker claim packets and receipt validation.

## Flow
1. Load queue and worker registry.
2. Validate incoming receipts against lifecycle rules and current task state.
3. Apply accepted receipt statuses to the in-memory queue snapshot.
4. Re-run scheduler to honor dependencies/capabilities/availability.
5. Produce claim packets for ready tasks; mark them CLAIMED in the output snapshot.
6. Write a JSON report; no live queue mutation is performed.

## Usage
```sh
python scripts/agency/execution_loop.py --queue agency-work/queue.json --workers scripts/agency/workers.json --receipts agency-work/receipts.json --out agency-work/execution-loop.json --limit 1
python -m unittest scripts/agency/test_execution_loop.py
```

Receipt format follows receipt_protocol.py. Invalid receipts are reported and not applied.

## Safety
- Manual handoff only: `dispatch_enabled=false`, `ai_invoked=false`.
- Does not call external AI tools, launch sessions, or run task commands.
- No secrets, paid APIs, Production deployment, or auto-merge.
- Queue is read-only; generated output is an audit snapshot.
