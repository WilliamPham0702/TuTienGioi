# Shared Workspace & Artifact Exchange V1

## Purpose
Provide a repository-backed, content-addressed handoff area so one worker can publish an output and another worker can fetch, verify, and materialize it.

## Layout
```
agency-workspace/
  objects/sha256/<first-two-hex>/<sha256>
  manifests/<sha256>.json
```
The artifact bytes are immutable and addressed by SHA-256. The manifest records producer, task ID, filename, media type, size, description, timestamp, and object path. Identical content deduplicates to one object.

## Publish
```bash
python scripts/agency/workspace_exchange.py publish \
  --source ./output/design.png \
  --producer worker-design \
  --task-id TASK-28 \
  --description "First design draft"
```

## Verify before use
```bash
python scripts/agency/workspace_exchange.py verify \
  --manifest agency-workspace/manifests/<sha256>.json
```

## Materialize
```bash
python scripts/agency/workspace_exchange.py materialize \
  --manifest agency-workspace/manifests/<sha256>.json \
  --output-dir ./incoming
```
Materialization verifies the digest first and refuses to overwrite an existing destination.

## Cross-worker flow
1. Worker A publishes an artifact into `agency-workspace/`.
2. The operator or GitHub workflow commits the workspace files to the shared repository branch/PR.
3. Worker B fetches the committed manifest and object from GitHub.
4. Worker B verifies SHA-256 and materializes the artifact locally.
5. Worker B publishes its derivative output the same way, preserving task lineage in its task ID/description.

## Boundaries
- No GitHub API, network transfer, Git commit, or AI invocation is performed by this local utility.
- GitHub is the shared distribution layer when workspace files are committed; uncommitted local files are not visible to other workers.
- No secrets should be published. Treat artifacts and manifests as untrusted input.
- Default maximum artifact size is 20 MiB; can be lowered or raised explicitly at publish time.
- Filenames are reduced to safe basenames; manifest object paths are validated against SHA-256.
- Symlink sources/objects are rejected, object integrity is verified, and existing output files are never overwritten.
- A valid checksum proves byte integrity, not safety, authorship, or quality.

## Tests
```bash
python -m unittest discover -s scripts/agency -p 'test_workspace_exchange.py'
```
