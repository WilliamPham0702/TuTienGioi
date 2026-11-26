#!/usr/bin/env python3
"""Free-first end-to-end Agency coordinator; plans and validates, never launches AI."""
from __future__ import annotations
import argparse, copy, json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from capability_router import route_task
from quality_review import review_receipt
from recovery_engine import recover
from receipt_protocol import validate as validate_receipt
from scheduler import schedule


def run_agency(queue: dict[str, Any], workers: dict[str, Any],
               receipts: list[dict[str, Any]] | None = None,
               recovery_history: list[dict[str, Any]] | None = None,
               human_approvals: list[str] | None = None,
               now: datetime | None = None, dispatch_limit: int = 1,
               workspace: str | Path = "agency-workspace") -> dict[str, Any]:
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None: raise ValueError("now must be timezone-aware")
    if dispatch_limit < 0: raise ValueError("dispatch_limit must be zero or greater")
    working = copy.deepcopy(queue)
    original_tasks = working.get("tasks", [])
    ids = [str(t.get("task_id", "")) for t in original_tasks]
    if any(not x for x in ids): raise ValueError("every task must have a non-empty task_id")
    if len(ids) != len(set(ids)): raise ValueError("task_id values must be unique")

    recovery = recover(working, workers, recovery_history or [], now=now)
    working = recovery["queue"]
    tasks = {str(t["task_id"]): t for t in working.get("tasks", [])}
    accepted, rejected, reviews = [], [], []
    for receipt in receipts or []:
        tid = str(receipt.get("task_id", ""))
        task = tasks.get(tid)
        if task is None:
            rejected.append({"task_id": tid, "errors": ["unknown task_id"]}); continue
        if receipt.get("status") == "REVIEW":
            report = review_receipt(receipt, workspace, current_status=task.get("status"))
            reviews.append(report)
            if report["passed"]:
                task["status"] = "REVIEW"
                task["last_review_decision"] = "ACCEPT_FOR_HUMAN_SIGNOFF"
                accepted.append(tid)
            else:
                task["status"] = "IN_PROGRESS"
                task["last_review_decision"] = "NEEDS_REVISION"
                task["correction_request"] = report["correction_request"]
                rejected.append({"task_id": tid, "errors": [f["message"] for f in report["findings"]]})
            continue
        errors = validate_receipt(receipt, task.get("status"))
        if errors:
            rejected.append({"task_id": tid, "errors": errors}); continue
        if receipt.get("status") == "BLOCKED":
            task["status"] = "BLOCKED"
            task["blocked_reason"] = receipt.get("blocker", "Worker reported a blocker")
            accepted.append(tid)
        else:
            rejected.append({"task_id": tid, "errors": ["Only REVIEW or BLOCKED receipts are accepted."]})

    approved, approval_rejected = [], []
    for tid in sorted(set(str(x) for x in (human_approvals or []))):
        task = tasks.get(tid)
        if task is None:
            approval_rejected.append({"task_id": tid, "reason": "unknown task_id"})
        elif task.get("status") != "REVIEW" or task.get("last_review_decision") != "ACCEPT_FOR_HUMAN_SIGNOFF":
            approval_rejected.append({"task_id": tid, "reason": "no accepted QC review awaiting human sign-off"})
        else:
            task["status"] = "DONE"; task["completed_at"] = now.isoformat()
            task["human_approved"] = True; approved.append(tid)

    routes = {}
    for task in working.get("tasks", []):
        if task.get("status", "OPEN") not in {"DONE", "CANCELLED"}:
            routes[str(task["task_id"])] = route_task(task, workers, free_only=True)
    plan = schedule(working, workers, now=now, limit=dispatch_limit)
    packets = []
    for item in plan["plan"]:
        tid = item["task_id"]; route = routes.get(tid, {})
        candidate = route.get("selected_worker")
        if not candidate: continue
        task = tasks[tid]; worker_id = candidate["worker_id"]
        task["status"] = "CLAIMED"; task["claimed_by"] = worker_id
        task["claim_time"] = now.isoformat()
        packets.append({
            "schema_version": 1, "task_id": tid, "worker_id": worker_id,
            "priority": task.get("priority", "P2"), "task": copy.deepcopy(task),
            "prompt": str(task.get("description") or task.get("prompt") or "").strip(),
            "required_capabilities": route["required_capabilities"],
            "state": "CLAIM_PACKET_READY", "execution_mode": "MANUAL_HANDOFF",
            "ai_invoked": False, "external_session_started": False
        })
    counts = {}
    for task in working.get("tasks", []):
        status = str(task.get("status", "OPEN")); counts[status] = counts.get(status, 0) + 1
    return {
        "schema_version": 1, "cycle_at_utc": now.isoformat(),
        "summary": {"total_tasks": len(tasks), "status_counts": counts,
                    "claim_packets_created": len(packets), "accepted_receipts": len(accepted),
                    "rejected_receipts": len(rejected),
                    "reviews_needing_revision": sum(x["decision"] == "NEEDS_REVISION" for x in reviews),
                    "awaiting_human_signoff": sum(t.get("status") == "REVIEW" for t in tasks.values()),
                    "human_approvals_applied": len(approved),
                    "unassigned_tasks": sum(not x["selected_worker"] for x in routes.values())},
        "queue_snapshot": working, "recovery": recovery,
        "routing": {"results": routes, "free_only": True}, "scheduler": plan,
        "claim_packets": packets, "reviews": reviews,
        "accepted_receipts": accepted, "rejected_receipts": rejected,
        "human_approvals_applied": approved, "human_approvals_rejected": approval_rejected,
        "dispatch_enabled": False, "ai_invoked": False, "auto_merge": False,
        "human_signoff_required": True,
        "execution_mode": "AUTONOMOUS_COORDINATION_MANUAL_EXECUTION"
    }


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--queue", default="agency-work/queue.json")
    p.add_argument("--workers", default="scripts/agency/workers.json")
    p.add_argument("--receipts", default="agency-work/receipts.json")
    p.add_argument("--recovery-history", default="agency-work/recovery-history.json")
    p.add_argument("--human-approvals", default="agency-work/human-approvals.json")
    p.add_argument("--workspace", default="agency-workspace")
    p.add_argument("--out", default="agency-work/agency-cycle.json")
    p.add_argument("--limit", type=int, default=1); p.add_argument("--now")
    a = p.parse_args()
    def read(path, default):
        f = Path(path); return json.loads(f.read_text(encoding="utf-8")) if f.exists() else default
    now = datetime.fromisoformat(a.now.replace("Z", "+00:00")) if a.now else None
    result = run_agency(read(a.queue, {"tasks": []}), read(a.workers, {"workers": []}),
                        read(a.receipts, []), read(a.recovery_history, []),
                        read(a.human_approvals, []), now, max(0, a.limit), a.workspace)
    out = Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(out), **result["summary"], "ai_invoked": False,
                      "dispatch_enabled": False, "auto_merge": False}, indent=2))
if __name__ == "__main__": main()
