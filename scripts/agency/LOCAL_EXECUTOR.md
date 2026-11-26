# Free Local Executor & Return Pipeline V1

Uses GitHub CLI interactive authentication (gh auth login), not repository secrets or tokens in scripts.

## Export task packet
1. Install Python 3 and GitHub CLI, then authenticate using `gh auth login`.
2. From a local checkout, run `python scripts/agency/local_executor.py --issue 123`.
3. Open the generated `agency-work/issue-123-packet.json` in the chosen AI app and perform the task. Export is not AI execution.

## Publish receipt
Create a JSON receipt with issue_number (positive integer), worker_id (label only), status (REVIEW or BLOCKED), summary; REVIEW requires deliverables, BLOCKED requires blocker. Optional test_summary. Use `scripts/agency/LOCAL_RECEIPT_TEMPLATE.json` as a starting point.
Run `python scripts/agency/return_receipt.py receipt.json` to publish a GitHub issue comment through your existing gh login.


Receipt metadata is not identity proof or test evidence. Deliverable files still need to be committed to a branch/PR and reviewed. This bridge does not run arbitrary issue commands, invoke AI, upload files, merge PRs, deploy Production, or call paid APIs. gh stores login outside this repository.
