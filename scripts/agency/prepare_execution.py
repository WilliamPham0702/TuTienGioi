#!/usr/bin/env python3
"""Build a safe, portable AI execution packet from a GitHub issue. Does not start an external AI."""
from __future__ import annotations
import argparse, json
from pathlib import Path
from typing import Any

def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))

def prepare(issue: dict[str, Any], worker_id: str, registry: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(issue, dict) or not issue.get("number") or not issue.get("title"):
        raise ValueError("issue must include number and title")
    if not worker_id: raise ValueError("worker id is required")
    workers = registry.get("workers")
    if registry.get("schema_version") != 1 or not isinstance(workers, list):
        raise ValueError("unsupported worker registry schema")
    worker = next((w for w in workers if w.get("id") == worker_id), None)
    if worker is None: raise ValueError(f"unknown worker: {worker_id}")
    if worker.get("enabled") is not True: raise ValueError(f"worker is disabled: {worker_id}")
    body = issue.get("body") or ""
    required = ("Task ID", "Assigned AI", "Mode", "Status", "Scope", "Acceptance criteria", "Tests", "Deliverables")
    missing = [heading for heading in required if heading.lower() not in body.lower()]
    if missing: raise ValueError("incomplete task packet; missing headings: " + ", ".join(missing))
    return {
        "schema_version": 1, "execution_status": "PREPARED_NOT_TRIGGERED",
        "task": {"issue_number": issue["number"], "title": issue["title"], "url": issue.get("html_url", ""), "body": body},
        "worker": {"id": worker["id"], "display_name": worker.get("display_name", worker["id"]), "native_trigger": worker.get("native_trigger", "manual"), "capabilities": sorted(worker.get("capabilities", []))},
        "executor_instructions": ["Packet prepared only; no external AI session started.", "Confirm free-tier eligibility and quota before execution.", "Read issue and referenced artifacts before editing.", "Use a dedicated branch; do not merge automatically.", "Report changed paths, tests/results, commit or PR, and blockers."],
        "safety": {"paid_services_allowed": False, "secrets_allowed": False, "production_changes_allowed": False, "auto_merge": False}
    }

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--issue-file", type=Path, required=True)
    parser.add_argument("--worker", required=True)
    parser.add_argument("--registry", type=Path, default=Path(__file__).with_name("workers.json"))
    parser.add_argument("--output", type=Path, default=Path("execution-packet.json"))
    args = parser.parse_args()
    try: packet = prepare(load_json(args.issue_file), args.worker, load_json(args.registry))
    except (OSError, json.JSONDecodeError, ValueError, KeyError, TypeError) as exc: parser.error(str(exc))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(packet, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"status": packet["execution_status"], "issue": packet["task"]["issue_number"], "worker": packet["worker"]["id"], "output": str(args.output)}, ensure_ascii=False))
    return 0
if __name__ == "__main__": raise SystemExit(main())
