#!/usr/bin/env python3
"""Simulate an independent receiving agent validating a committed handoff."""
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
from typing import Any

def safe_path(root: Path, raw: Any) -> Path:
    if not isinstance(raw, str) or not raw.strip(): raise ValueError("path must be a non-empty string")
    candidate = Path(raw)
    if candidate.is_absolute() or ".." in candidate.parts: raise ValueError("unsafe repository-relative path")
    resolved_root, resolved = root.resolve(), (root / candidate).resolve()
    if resolved != resolved_root and resolved_root not in resolved.parents: raise ValueError("path escapes workspace")
    return resolved

def receive(root: Path, handoff_path: Path, receiver_ai: str) -> dict[str, Any]:
    handoff = json.loads(handoff_path.read_text(encoding="utf-8"))
    required = ("task_id", "from_ai", "to_ai", "asset_id", "artifact_path", "sha256", "next_action")
    if any(not handoff.get(key) for key in required): raise ValueError("handoff missing required fields")
    manifest_path = safe_path(root, f"00_PROJECT/AGENCY/manifests/{handoff['asset_id']}.json")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("asset_id") != handoff["asset_id"]: raise ValueError("manifest asset_id mismatch")
    if manifest.get("producer", {}).get("ai") != handoff["from_ai"]: raise ValueError("producer/from_ai mismatch")
    artifact = manifest.get("artifact", {})
    if artifact.get("path") != handoff["artifact_path"]: raise ValueError("artifact path mismatch")
    if artifact.get("sha256") != handoff["sha256"]: raise ValueError("handoff checksum does not match manifest")
    payload = safe_path(root, artifact.get("path")).read_bytes()
    actual_hash = hashlib.sha256(payload).hexdigest()
    if actual_hash != artifact.get("sha256"): raise ValueError("artifact checksum verification failed")
    if len(payload) != artifact.get("size_bytes"): raise ValueError("artifact size verification failed")
    if receiver_ai != handoff["to_ai"]: raise ValueError("receiver identity does not match handoff target")
    return {"task_id":handoff["task_id"],"asset_id":handoff["asset_id"],"artifact_path":artifact["path"],"sha256":actual_hash,"from_ai":handoff["from_ai"],"to_ai":receiver_ai,"receipt_status":"RECEIVED_AND_VERIFIED_SIMULATION","verified_bytes":len(payload),"next_action":handoff["next_action"]}

def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root",type=Path,default=Path("."))
    parser.add_argument("--handoff",type=Path,default=Path("00_PROJECT/AGENCY/handoffs/handoff-test-002.json"))
    parser.add_argument("--receiver-ai",required=True)
    parser.add_argument("--receipt-output",type=Path)
    args=parser.parse_args()
    root=args.root.resolve()
    handoff_path=safe_path(root,str(args.handoff))
    try: receipt=receive(root,handoff_path,args.receiver_ai)
    except (OSError,json.JSONDecodeError,ValueError,KeyError,TypeError) as exc: parser.error(str(exc))
    rendered=json.dumps(receipt,indent=2,sort_keys=True)
    if args.receipt_output:
        output=safe_path(root,str(args.receipt_output)); output.parent.mkdir(parents=True,exist_ok=True); output.write_text(rendered+"\n",encoding="utf-8")
    print(rendered); return 0
if __name__ == "__main__": raise SystemExit(main())
