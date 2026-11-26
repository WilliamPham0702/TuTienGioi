# AI Agency Shared-Artifact Connection Test

This test verifies shared-workspace handoff, not only repository read access.

## Test steps
1. AI A reads AI_AGENCY_ARCHITECTURE.md and AI_SHARED_WORKSPACE.md and creates a small synthetic sample artifact (prefer simple TEST ONLY image). Do not use game assets or personal data.
2. AI A commits artifact and manifest under 00_PROJECT/AGENCY/tests/producer/<ai-slug>/. Report exact commit/path. If binary upload cannot be done, mark artifact publication NOT_VERIFIED.
3. AI B (different AI/account) is assigned only producer path/asset ID. It independently opens/reads/downloads the artifact from GitHub, checks SHA-256 when feasible, creates a derivative note/manifest under 00_PROJECT/AGENCY/tests/consumer/<ai-slug>/ and commits. No chat or user forwarding of the file.
4. Reviewer verifies both commits, artifact, downstream reference and evidence. Record outcome at 00_PROJECT/AGENCY/tests/CONNECTION_TEST_RESULT.md.

## Evidence
Producer AI and actual mode; producer commit, artifact/manifest paths and checksum; consumer AI/mode; consumer commit, upstream path/read evidence; consumer output/checksum; reviewer PASS/PARTIAL/FAIL.

## Safety
Synthetic test only. Do not edit game code, gameplay docs, production assets, secrets, account settings or deploy. No spending. ChatGPT independently verifies shared evidence. Missing evidence is NOT_VERIFIED. Producer report alone cannot prove downstream access.