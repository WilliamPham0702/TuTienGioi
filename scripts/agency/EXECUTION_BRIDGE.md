# AI Agency Execution Bridge V1
## Function
- Generates a portable JSON execution packet from a complete task issue.
- Validates that the chosen worker exists and is explicitly enabled.
- Manual workflow only; gated by repository variable `AGENCY_CI_ENABLED=true`.
- Uploads a short-lived Actions artifact (7 days).

## Not implemented
- No Claude/Copilot/DeepSeek session launch.
- No secrets, paid services, Production resources, or automatic merge.
- `PREPARED_NOT_TRIGGERED` means packet prepared, not agent execution.

## How to use
1. Fill the issue with all headings: Task ID, Assigned AI, Mode, Status, Scope, Acceptance criteria, Tests, Deliverables.
2. Enable the selected worker in `workers.json` only after confirming access and free quota.
3. Actions → **AI Agency execution packet bridge** → Run workflow; enter issue number and worker ID.
4. If `AGENCY_CI_ENABLED` is not true, the workflow reports disabled.
5. Download the packet artifact and give it to a supported native executor or human; record actual executor, mode, branch, evidence, and PR in the issue.

This is a packet preparation bridge, not a verified native AI trigger.
