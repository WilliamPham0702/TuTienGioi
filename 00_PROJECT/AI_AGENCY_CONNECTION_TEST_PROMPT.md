# AI Agency Shared Artifact Test — Assignment Prompt

Repository: https://github.com/WilliamPham0702/TuTienGioi

Read these first: AI_HANDOFF.md, 00_PROJECT/AI_ORCHESTRATION.md, 00_PROJECT/AI_AGENCY_ARCHITECTURE.md, 00_PROJECT/AI_SHARED_WORKSPACE.md, 00_PROJECT/AI_AGENCY_CONNECTION_TEST.md.

## Assignment
You are participating in a shared-workspace connection test. Do not ask the Product Owner to relay your output to another AI. Commit your own test result directly into the repository.


### If assigned PRODUCER (AI A)
Create a tiny synthetic TEST ONLY artifact (prefer SVG text artwork, or a small image if your tool can create and upload it). Save it in 00_PROJECT/AGENCY/tests/producer/<your-ai-slug>/. Include a manifest with task ID ASSET-TEST-001, asset ID, your AI name and actual mode, UTC timestamp, artifact path, real byte size and SHA-256, and downstream task HANDOFF-TEST-002. Commit both files. Never claim binary upload succeeded if it did not. Do not touch game assets/code.

### If assigned CONSUMER (AI B)
Do not receive the artifact through chat, attachment, or the Product Owner. Read the producer artifact directly from the GitHub path provided in the task. Verify it exists and calculate/check checksum if feasible. Create and commit a consumer handoff report under 00_PROJECT/AGENCY/tests/consumer/<your-ai-slug>/ that references exact upstream path, producer commit, asset ID/checksum and your own output. No game code/assets changes.

### If assigned REVIEWER
Read producer and consumer commits/files directly. Independently verify paths, artifact content, checksum evidence and linkage. Commit a PASS/PARTIAL/FAIL review to 00_PROJECT/AGENCY/tests/CONNECTION_TEST_RESULT.md. PASS only if cross-agent direct artifact consumption is evidenced.

## Safety
Synthetic test only. Do not edit game code, gameplay docs, production art, secrets, account settings or deploy. No spending. If GitHub write access or artifact upload is unavailable, report precisely what failed and mark NOT_VERIFIED. Include evidence; no self-certification without commits.