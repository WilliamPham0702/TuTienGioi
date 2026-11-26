#!/usr/bin/env python3
"""Validate AI Agency artifact manifests and cross-agent handoff records.

Uses only the Python standard library. Run from any directory:
  python scripts/agency/validate_handoffs.py --root .
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def safe_repo_path(root: Path, raw_path: Any) -> Path | None:
    if not isinstance(raw_path, str) or not raw_path.strip():
        return None
    candidate = Path(raw_path)
    if candidate.is_absolute() or ".." in candidate.parts:
        return None
    resolved_root = root.resolve()
    resolved = (root / candidate).resolve()
    if resolved != resolved_root and resolved_root not in resolved.parents:
        return None
    return resolved


def load_json(path: Path, errors: list[str]) -> dict[str, Any] | None:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"{path}: cannot read valid JSON ({exc})", errors)
        return None
    if not isinstance(value, dict):
        fail(f"{path}: top-level JSON value must be an object", errors)
        return None
    return value


def validate(root: Path) -> list[str]:
    errors: list[str] = []
    manifest_dir = root / "00_PROJECT/AGENCY/manifests"
    handoff_dir = root / "00_PROJECT/AGENCY/handoffs"
    manifests: dict[str, dict[str, Any]] = {}

    for path in sorted(manifest_dir.glob("*.json")) if manifest_dir.exists() else []:
        data = load_json(path, errors)
        if data is None:
            continue
        asset_id = data.get("asset_id")
        required = ("task_id", "producer", "created_at_utc", "artifact", "validation")
        missing = [key for key in required if key not in data]
        if missing:
            fail(f"{path}: missing fields: {', '.join(missing)}", errors)
            continue
        if not isinstance(asset_id, str) or not asset_id.strip():
            fail(f"{path}: asset_id must be a non-empty string", errors)
            continue
        if asset_id in manifests:
            fail(f"{path}: duplicate asset_id {asset_id}", errors)
            continue
        producer = data.get("producer")
        artifact = data.get("artifact")
        validation = data.get("validation")
        if not isinstance(producer, dict) or not producer.get("ai") or not producer.get("mode"):
            fail(f"{path}: producer.ai and producer.mode are required", errors)
        if not isinstance(artifact, dict):
            fail(f"{path}: artifact must be an object", errors)
            continue
        artifact_path = safe_repo_path(root, artifact.get("path"))
        expected_hash = artifact.get("sha256")
        expected_size = artifact.get("size_bytes")
        if artifact_path is None:
            fail(f"{path}: artifact.path must be a safe repository-relative path", errors)
        elif not artifact_path.is_file():
            fail(f"{path}: artifact does not exist: {artifact.get('path')}", errors)
        else:
            content = artifact_path.read_bytes()
            actual_hash = hashlib.sha256(content).hexdigest()
            if expected_hash != actual_hash:
                fail(f"{path}: SHA-256 mismatch for {artifact.get('path')}", errors)
            if expected_size != len(content):
                fail(f"{path}: size_bytes mismatch for {artifact.get('path')}", errors)
        if not isinstance(expected_hash, str) or len(expected_hash) != 64:
            fail(f"{path}: artifact.sha256 must be a 64-character SHA-256 hex digest", errors)
        if not isinstance(expected_size, int) or expected_size < 0:
            fail(f"{path}: artifact.size_bytes must be a non-negative integer", errors)
        if not isinstance(validation, dict) or not validation.get("status"):
            fail(f"{path}: validation.status is required", errors)
        manifests[asset_id] = data

    for path in sorted(handoff_dir.glob("*.json")) if handoff_dir.exists() else []:
        data = load_json(path, errors)
        if data is None:
            continue
        required = ("task_id", "from_ai", "to_ai", "asset_id", "artifact_path", "sha256", "next_action")
        missing = [key for key in required if not data.get(key)]
        if missing:
            fail(f"{path}: missing or empty fields: {', '.join(missing)}", errors)
            continue
        manifest = manifests.get(data["asset_id"])
        if manifest is None:
            fail(f"{path}: no manifest found for asset_id {data['asset_id']}", errors)
            continue
        artifact = manifest.get("artifact", {})
        if data["artifact_path"] != artifact.get("path"):
            fail(f"{path}: artifact_path does not match manifest", errors)
        if data["sha256"] != artifact.get("sha256"):
            fail(f"{path}: sha256 does not match manifest", errors)
        if data["from_ai"] != manifest.get("producer", {}).get("ai"):
            fail(f"{path}: from_ai does not match manifest producer", errors)

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="repository root")
    args = parser.parse_args()
    root = args.root.resolve()
    errors = validate(root)
    if errors:
        print("AI Agency handoff validation FAILED:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("AI Agency handoff validation PASSED.")
    print("All discovered manifests and handoffs are structurally valid; artifact paths, sizes and SHA-256 values match.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
