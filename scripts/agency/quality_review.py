#!/usr/bin/env python3
"""Deterministic quality gate for worker receipts; never invokes an AI reviewer."""
from __future__ import annotations
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from receipt_protocol import validate as validate_receipt
from workspace_exchange import verify as verify_artifact


def review_receipt(receipt: dict[str, Any], workspace: str | Path = "agency-workspace",
                   current_status: str = "IN_PROGRESS") -> dict[str, Any]:
    """Review structural completeness and integrity evidence, not subjective quality.

    Worker-provided test summaries are recorded as claims, never treated as proof
    that tests ran or passed. Optional artifact_manifests are verified by SHA-256.
    """
    findings: list[dict[str, str]] = []
    checks: list[dict[str, Any]] = []

    lifecycle_errors = validate_receipt(receipt, current_status)
    checks.append({"id": "receipt_lifecycle", "passed": not lifecycle_errors,
                   "details": lifecycle_errors or ["Receipt fields and lifecycle transition are valid."]})
    for error in lifecycle_errors:
        findings.append({"severity": "BLOCKER", "code": "INVALID_RECEIPT", "message": error})

    deliverables = receipt.get("deliverables")
    deliverables_ok = isinstance(deliverables, list) and bool(deliverables)
    if deliverables_ok:
        for index, item in enumerate(deliverables):
            valid = (isinstance(item, str) and bool(item.strip())) or (
                isinstance(item, dict) and any(
                    isinstance(item.get(k), str) and item[k].strip()
                    for k in ("path", "name", "url", "description")
                )
            )
            if not valid:
                deliverables_ok = False
                findings.append({"severity": "BLOCKER", "code": "INVALID_DELIVERABLE",
                                 "message": f"Deliverable at index {index} must be a non-empty string or object with a path/name/url/description."})
    checks.append({"id": "deliverables_declared", "passed": deliverables_ok,
                   "details": ["Deliverables are declared." if deliverables_ok else "At least one valid deliverable is required."]})

    summary = receipt.get("test_summary")
    summary_ok = isinstance(summary, str) and bool(summary.strip())
    checks.append({"id": "test_summary_present", "passed": summary_ok,
                   "details": ["Worker supplied a test summary; it is self-reported and not independently verified."
                               if summary_ok else "A non-empty test_summary is required."]})
    if not summary_ok:
        findings.append({"severity": "BLOCKER", "code": "MISSING_TEST_SUMMARY",
                         "message": "Provide a concise test_summary, including tests run and any not run."})

    manifests = receipt.get("artifact_manifests", [])
    artifacts_ok = isinstance(manifests, list)
    verified_artifacts = []
    if not artifacts_ok:
        findings.append({"severity": "BLOCKER", "code": "INVALID_ARTIFACT_MANIFESTS",
                         "message": "artifact_manifests must be a list of manifest paths."})
    else:
        for manifest_path in manifests:
            if not isinstance(manifest_path, str) or not manifest_path.strip():
                artifacts_ok = False
                findings.append({"severity": "BLOCKER", "code": "INVALID_ARTIFACT_MANIFEST",
                                 "message": "Each artifact manifest entry must be a non-empty path."})
                continue
            try:
                manifest, _ = verify_artifact(manifest_path, workspace)
                verified_artifacts.append({"path": manifest_path, "sha256": manifest["sha256"],
                                           "filename": manifest["filename"]})
            except (OSError, ValueError, json.JSONDecodeError) as exc:
                artifacts_ok = False
                findings.append({"severity": "BLOCKER", "code": "ARTIFACT_INTEGRITY_FAILED",
                                 "message": f"{manifest_path}: {exc}"})
    checks.append({"id": "artifact_integrity", "passed": artifacts_ok,
                   "details": [f"{len(verified_artifacts)} artifact manifest(s) verified."
                               if verified_artifacts else
                               ("No artifact manifests supplied; this check is not applicable."
                                if not manifests else "One or more artifact manifests failed verification.")]})

    blockers = [f for f in findings if f["severity"] == "BLOCKER"]
    passed = not blockers
    recommendation = "ACCEPT_FOR_HUMAN_SIGNOFF" if passed else "NEEDS_REVISION"
    if not passed:
        correction = "Address every BLOCKER finding, update the deliverables and test summary, then submit a new REVIEW receipt."
    else:
        correction = "No structural blockers found. A human must still inspect deliverable content and independently assess test evidence before marking the task DONE."
    return {
        "schema_version": 1,
        "reviewed_at_utc": datetime.now(timezone.utc).isoformat(),
        "task_id": receipt.get("task_id"),
        "worker_id": receipt.get("agent_id"),
        "decision": recommendation,
        "passed": passed,
        "checks": checks,
        "findings": findings,
        "verified_artifacts": verified_artifacts,
        "test_summary_is_self_reported": True,
        "auto_merge": False,
        "ai_invoked": False,
        "human_signoff_required": True,
        "correction_request": correction,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", required=True, type=Path)
    parser.add_argument("--workspace", default="agency-workspace")
    parser.add_argument("--current-status", default="IN_PROGRESS")
    parser.add_argument("--out", default="agency-work/review.json")
    args = parser.parse_args()
    receipt = json.loads(args.receipt.read_text(encoding="utf-8"))
    result = review_receipt(receipt, args.workspace, args.current_status)
    output = Path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "decision": result["decision"],
                      "findings": len(result["findings"]), "ai_invoked": False,
                      "auto_merge": False, "human_signoff_required": True}, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
