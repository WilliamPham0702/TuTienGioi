# End-to-End Autonomous Agency V1

## Purpose
A single deterministic coordinator connects task intake, stale-claim recovery, free-first capability routing, dependency-aware scheduling, manual execution packets, receipt validation, quality review, and explicit human sign-off.

## Run
```bash
python scripts/agency/agency_cycle.py --queue agency-work/queue.json --workers scripts/agency/workers.json --receipts agency-work/receipts.json --recovery-history agency-work/recovery-history.json --human-approvals agency-work/human-approvals.json --workspace agency-workspace --out agency-work/agency-cycle.json --limit 2
```
Optional receipt, history, and approval files default to empty lists. Use `--now` with an ISO timestamp for reproducible cycles.

## Lifecycle
1. Read the task queue without changing the input file.
2. Generate recovery decisions for expired leases or stale workers.
3. Recommend enabled, available, free-only workers with matching capabilities.
4. Schedule tasks whose dependencies are complete, honoring priority and dispatch limit.
5. Emit claim packets for manual handoff to the chosen AI app or a separately enabled local CLI.
6. Validate REVIEW/BLOCKED receipts against the current lifecycle state.
7. Run deterministic receipt and optional shared-artifact SHA-256 checks.
8. Return NEEDS_REVISION findings or wait for explicit human approval.
9. Mark a QC-approved REVIEW task DONE only when its task ID appears in the human-approvals input.

## Output
The cycle JSON includes queue snapshot, recovery plan, routing, scheduler decisions, claim packets, QC reports, receipt outcomes, human approval outcomes, and summary. It is a proposed snapshot: it does not silently overwrite the queue or recovery history.

## Boundaries
- No AI provider is launched by this coordinator. Handoff is manual; native CLI execution is a separate explicit operation.
- No arbitrary task code, API keys, secrets, paid APIs, external AI sessions, Production deployment, or auto-merge.
- Every cycle reports `ai_invoked=false`, `dispatch_enabled=false`, and `auto_merge=false`.
- Test summaries are self-reported and not proof of test execution or quality.
- Human sign-off is required before DONE.
- Review queue/history snapshots before persisting or committing them.

## Tests
```bash
python -m unittest discover -s scripts/agency -p 'test_agency_cycle.py'
```

## Integration
This PR targets `main` and consolidates the PR #23–29 feature stack previously developed on the PR #22 branch, together with the end-to-end coordinator. No Production deployment is performed.
