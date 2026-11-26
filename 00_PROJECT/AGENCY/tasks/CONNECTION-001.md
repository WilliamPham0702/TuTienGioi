# CONNECTION-001 — Shared Artifact Handoff Test

Status: OPEN
Goal: Verify producer AI can publish a synthetic artifact and a different AI can independently consume it from the shared GitHub workspace without any user file relay.

Tasks:
- ASSET-TEST-001 (PRODUCER): create synthetic test asset, manifest, and commit to producer folder.
- HANDOFF-TEST-002 (CONSUMER): read exact upstream artifact directly, verify evidence, create downstream report and commit.
- REVIEW-TEST-003 (REVIEWER): independently verify both commits and record PASS/PARTIAL/FAIL.

Acceptance criteria: artifact and manifest committed; different AI directly reads producer artifact; consumer output committed with upstream link and checksum; reviewer evidence complete. Read-only connection check alone is not PASS.

Safety scope: documentation and synthetic test artifacts only; no gameplay/code/production assets, real account integration, spending, or deployment.