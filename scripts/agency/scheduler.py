#!/usr/bin/env python3
"""Deterministic, free-first task queue planner. It plans dispatch; it never invokes AI."""
import argparse, json
from datetime import datetime, timezone
from pathlib import Path

PRIORITY = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}

def parse_time(value):
    if not value: return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))

def schedule(queue, workers, now=None, limit=1):
    now = now or datetime.now(timezone.utc)
    tasks = queue.get("tasks", [])
    by_id = {str(t.get("task_id")): t for t in tasks}
    worker_list = workers.get("workers", [])
    eligible_workers = [w for w in worker_list if w.get("enabled") is True]
    results, selected = [], []
    for task in tasks:
        status = task.get("status", "OPEN")
        tid = str(task.get("task_id", ""))
        if status in ("DONE", "CANCELLED"): continue
        # Expired lease: return task to queue and apply capped exponential backoff.
        if status == "IN_PROGRESS" and task.get("lease_expires_at"):
            expiry = parse_time(task["lease_expires_at"])
            if expiry and expiry <= now:
                attempts = int(task.get("attempts", 0)) + 1
                max_attempts = int(task.get("max_attempts", 3))
                if attempts >= max_attempts:
                    results.append({"task_id": tid, "decision": "BLOCKED", "reason": "lease expired; retry limit reached"})
                    continue
                wait = min(3600, 60 * (2 ** (attempts - 1)))
                results.append({"task_id": tid, "decision": "RETRY", "attempts": attempts, "retry_after_seconds": wait, "reason": "lease expired"})
        if status not in ("OPEN", "WAITING_FOR_AGENT", "BLOCKED"): continue
        if task.get("blocked_reason"):
            results.append({"task_id": tid, "decision": "BLOCKED", "reason": task["blocked_reason"]}); continue
        deps = [str(x) for x in task.get("depends_on", [])]
        missing = [d for d in deps if d not in by_id]
        incomplete = [d for d in deps if d in by_id and by_id[d].get("status") != "DONE"]
        if missing:
            results.append({"task_id": tid, "decision": "BLOCKED", "reason": "unknown dependencies: " + ", ".join(missing)}); continue
        if incomplete: continue
        ready_at = parse_time(task.get("available_at"))
        if ready_at and ready_at > now: continue
        required = set(task.get("required_capabilities", []))
        candidates = [w for w in eligible_workers if required.issubset(set(w.get("capabilities", [])))]
        candidates.sort(key=lambda w: w.get("id", ""))
        if not candidates: continue
        selected.append((task, candidates[0]))
    selected.sort(key=lambda pair: (PRIORITY.get(pair[0].get("priority", "P2"), 4), pair[0].get("created_at", ""), str(pair[0].get("task_id", ""))))
    plan = []
    for task, worker in selected[:max(0, limit)]:
        plan.append({"task_id": str(task.get("task_id")), "priority": task.get("priority", "P2"), "worker_id": worker["id"], "decision": "READY_FOR_MANUAL_EXECUTION", "ai_invoked": False, "external_session_started": False})
    return {"schema_version": 1, "generated_at": now.isoformat(), "dispatch_limit": limit, "plan": plan, "decisions": results, "dispatch_enabled": False, "ai_invoked": False}

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--queue", default="agency-work/queue.json")
    p.add_argument("--workers", default="scripts/agency/workers.json")
    p.add_argument("--out", default="agency-work/schedule.json")
    p.add_argument("--limit", type=int, default=1)
    p.add_argument("--now", help="ISO timestamp for deterministic planning/testing")
    a = p.parse_args()
    queue, workers = json.loads(Path(a.queue).read_text()), json.loads(Path(a.workers).read_text())
    result = schedule(queue, workers, parse_time(a.now), a.limit)
    out = Path(a.out); out.parent.mkdir(parents=True, exist_ok=True); out.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"output": str(out), "ready": len(result["plan"]), "dispatch_enabled": False, "ai_invoked": False}, indent=2))
if __name__ == "__main__": main()
