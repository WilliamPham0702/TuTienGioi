#!/usr/bin/env python3
"""Content-addressed shared artifact exchange for the TuTienGioi Agency.

Artifacts are immutable SHA-256 objects with small JSON manifests. The tracked
workspace can be committed to GitHub so other workers can fetch and verify it.
This tool never calls Git, GitHub APIs, a shell, or an AI provider.
"""
import argparse
import hashlib
import json
import mimetypes
import os
import re
import shutil
import stat
from pathlib import Path
from datetime import datetime, timezone

SCHEMA_VERSION = 1
DEFAULT_MAX_BYTES = 20 * 1024 * 1024
DIGEST_RE = re.compile(r"^[a-f0-9]{64}$")
SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9._-]+")


class WorkspaceError(ValueError):
    pass


def _sha256_file(path):
    digest = hashlib.sha256()
    size = 0
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            size += len(chunk)
            digest.update(chunk)
    return digest.hexdigest(), size


def _safe_name(name):
    clean = SAFE_NAME_RE.sub("_", Path(name).name).strip("._")
    if not clean or clean in {".", ".."}:
        raise WorkspaceError("artifact filename is not safe")
    return clean[:180]


def _manifest_path(root, digest):
    if not DIGEST_RE.fullmatch(digest):
        raise WorkspaceError("invalid SHA-256 identifier")
    return root / "manifests" / f"{digest}.json"


def publish(source, workspace, producer, task_id, description="", max_bytes=DEFAULT_MAX_BYTES):
    source = Path(source)
    if source.is_symlink() or not source.is_file():
        raise WorkspaceError("source must be a regular, non-symlink file")
    digest, size = _sha256_file(source)
    if size > max_bytes:
        raise WorkspaceError(f"artifact exceeds size limit ({max_bytes} bytes)")
    root = Path(workspace)
    object_path = root / "objects" / "sha256" / digest[:2] / digest
    manifest_path = _manifest_path(root, digest)
    object_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    if object_path.exists():
        existing_digest, existing_size = _sha256_file(object_path)
        if existing_digest != digest or existing_size != size:
            raise WorkspaceError("existing content-addressed object failed integrity check")
    else:
        shutil.copyfile(source, object_path)

    manifest = {
        "schema_version": SCHEMA_VERSION,
        "artifact_id": digest,
        "sha256": digest,
        "size_bytes": size,
        "filename": _safe_name(source.name),
        "media_type": mimetypes.guess_type(source.name)[0] or "application/octet-stream",
        "producer": str(producer).strip()[:100],
        "task_id": str(task_id).strip()[:120],
        "description": str(description).strip()[:500],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "object": f"objects/sha256/{digest[:2]}/{digest}",
    }
    if not manifest["producer"] or not manifest["task_id"]:
        raise WorkspaceError("producer and task_id are required")
    encoded = json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    if manifest_path.exists():
        current = json.loads(manifest_path.read_text(encoding="utf-8"))
        if current.get("sha256") != digest or current.get("size_bytes") != size:
            raise WorkspaceError("existing manifest conflicts with this artifact")
        return current
    manifest_path.write_text(encoded, encoding="utf-8")
    return manifest


def verify(manifest_file, workspace, max_bytes=DEFAULT_MAX_BYTES):
    manifest_file = Path(manifest_file)
    manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    digest = manifest.get("sha256", "")
    if manifest.get("schema_version") != SCHEMA_VERSION or not DIGEST_RE.fullmatch(digest):
        raise WorkspaceError("unsupported manifest or invalid digest")
    if manifest.get("artifact_id") != digest:
        raise WorkspaceError("artifact_id does not match sha256")
    size = manifest.get("size_bytes")
    if not isinstance(size, int) or size < 0 or size > max_bytes:
        raise WorkspaceError("invalid artifact size")
    _safe_name(manifest.get("filename", ""))
    expected_object = f"objects/sha256/{digest[:2]}/{digest}"
    if manifest.get("object") != expected_object:
        raise WorkspaceError("object path does not match content address")
    root = Path(workspace)
    obj = root / expected_object
    if obj.is_symlink() or not obj.is_file():
        raise WorkspaceError("artifact object is missing or not a regular file")
    actual_digest, actual_size = _sha256_file(obj)
    if actual_digest != digest or actual_size != size:
        raise WorkspaceError("artifact integrity check failed")
    return manifest, obj


def materialize(manifest_file, workspace, output_dir, max_bytes=DEFAULT_MAX_BYTES):
    manifest, obj = verify(manifest_file, workspace, max_bytes)
    target_dir = Path(output_dir)
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / _safe_name(manifest["filename"])
    if target.exists() or target.is_symlink():
        raise WorkspaceError("destination already exists; refusing to overwrite")
    shutil.copyfile(obj, target)
    return {"status": "MATERIALIZED", "path": str(target),
            "sha256": manifest["sha256"], "size_bytes": manifest["size_bytes"]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    pub = sub.add_parser("publish")
    pub.add_argument("--source", required=True)
    pub.add_argument("--workspace", default="agency-workspace")
    pub.add_argument("--producer", required=True)
    pub.add_argument("--task-id", required=True)
    pub.add_argument("--description", default="")
    pub.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES)
    ver = sub.add_parser("verify")
    ver.add_argument("--manifest", required=True)
    ver.add_argument("--workspace", default="agency-workspace")
    mat = sub.add_parser("materialize")
    mat.add_argument("--manifest", required=True)
    mat.add_argument("--workspace", default="agency-workspace")
    mat.add_argument("--output-dir", required=True)

    args = parser.parse_args()
    if args.command == "publish":
        result = publish(args.source, args.workspace, args.producer, args.task_id,
                         args.description, max(1, args.max_bytes))
        print(json.dumps({"status": "PUBLISHED", "manifest": result}, indent=2))
    elif args.command == "verify":
        manifest, _ = verify(args.manifest, args.workspace)
        print(json.dumps({"status": "VERIFIED", "sha256": manifest["sha256"],
                          "filename": manifest["filename"]}, indent=2))
    else:
        print(json.dumps(materialize(args.manifest, args.workspace, args.output_dir), indent=2))


if __name__ == "__main__":
    main()
