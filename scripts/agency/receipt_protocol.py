#!/usr/bin/env python3
"""Validate an AI worker claim/result receipt and its lifecycle transition."""
from __future__ import annotations
import argparse, json
from pathlib import Path
from typing import Any

ALLOWED = {
    "OPEN": {"CLAIMED", "BLOCKED", "CANCELLED"},
    "WAITING_FOR_AGENT": {"CLAIMED", "BLOCKED", "CANCELLED"},
    "CLAIMED": {"IN_PROGRESS", "BLOCKED", "CANCELLED"},
    "IN_PROGRESS": {"REVIEW", "BLOCKED", "CANCELLED"},
    "REVIEW": {"DONE", "IN_PROGRESS", "BLOCKED", "CANCELLED"},
    "BLOCKED": {"OPEN", "CLAIMED", "CANCELLED"},
    "DONE": set(), "CANCELLED": set(),
}
REQUIRED = ("task_id", "agent_id", "mode", "branch", "status", "updated_at_utc")

def validate(receipt: dict[str, Any], current_status: str | None = None) -> list[str]:
    errors = []
    for key in REQUIRED:
        if not isinstance(receipt.get(key), str) or not receipt[key].strip():
            errors.append(f"{key} must be a non-empty string")
    status = receipt.get("status")
    if status not in ALLOWED:
        errors.append(f"unsupported status: {status}")
    if current_status and status in ALLOWED and status not in ALLOWED.get(current_status, set()):
        errors.append(f"transition not allowed: {current_status} -> {status}")
    if status in {"REVIEW", "DONE"}:
        if not isinstance(receipt.get("deliverables"), list) or not receipt["deliverables"]:
            errors.append(f"{status} requires a non-empty deliverables list")
        if not isinstance(receipt.get("test_summary"), str) or not receipt["test_summary"].strip():
            errors.append(f"{status} requires test_summary")
    if status == "BLOCKED" and not (isinstance(receipt.get("blocker"), str) and receipt["blocker"].strip()):
        errors.append("BLOCKED requires blocker text")
    if receipt.get("auto_merge") is True:
        errors.append("auto_merge must remain false")
    return errors

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("receipt", type=Path)
    parser.add_argument("--current-status")
    args = parser.parse_args()
    try:
        data = json.loads(args.receipt.read_text(encoding="utf-8"))
        errors = validate(data, args.current_status)
    except (OSError, json.JSONDecodeError, TypeError) as exc:
        parser.error(str(exc))
    if errors:
        print("RECEIPT INVALID")
        for error in errors: print(f"- {error}")
        return 1
    print(f"RECEIPT VALID: {data['task_id']} | {data['agent_id']} | {data['status']}")
    return 0
if __name__ == "__main__": raise SystemExit(main())
