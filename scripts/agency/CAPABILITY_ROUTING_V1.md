# Worker Capability Routing V1

## Purpose
Choose the best eligible worker for each task using declared capabilities and free-first constraints. The router is deterministic and produces recommendations only.

## Matching
- Combine explicit `required_capabilities` with task-type inference.
- Supported task types: architecture, design, code, implementation, testing, review, documentation, research, github.
- Require the worker to be enabled, available, not excluded by the task, and to have every required capability.
- In free-only mode (default), require `free_only: true`.
- Rank by preferred-capability matches, then lower `routing_priority`, then worker ID.
- If no worker qualifies, return `NO_ELIGIBLE_WORKER`; never fabricate a fallback.

## Worker configuration
Existing workers remain disabled by default. Enable a worker only after verifying account access and its available free quota. Optional fields:
- `available` (defaults true when omitted)
- `routing_priority` (defaults 100; lower wins)
- `free_only` (must be true for default routing)

## Usage
```bash
python scripts/agency/capability_router.py \
  --queue agency-work/queue.json \
  --workers scripts/agency/workers.json \
  --out agency-work/worker-routing.json
```

Use `--allow-non-free` only when explicitly permitted; the default never routes to a worker not marked free-only.

## Safety and limits
- `dispatch_enabled=false`, `ai_invoked=false`.
- No API calls, secrets, paid service activation, Production deployment, or auto-merge.
- A recommendation is not a live availability check or proof that a worker session can be launched.
- Existing worker enablement is not changed by this PR.
- Manual handoff remains required until the native trigger layer is implemented and verified.

## Tests
Run: `python -m unittest discover -s scripts/agency -p 'test_capability_router.py'`
