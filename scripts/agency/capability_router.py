#!/usr/bin/env python3
"""Free-first deterministic worker capability router. Produces recommendations only."""
import argparse
import json
from pathlib import Path

TASK_TYPE_CAPABILITIES = {
    "architecture": ["architecture"],
    "design": ["design"],
    "code": ["code"],
    "implementation": ["code"],
    "testing": ["tests"],
    "review": ["review"],
    "documentation": ["documentation"],
    "research": ["research"],
    "github": ["github"],
}


def requirements_for(task):
    explicit = task.get("required_capabilities", [])
    inferred = TASK_TYPE_CAPABILITIES.get(str(task.get("task_type", "")).lower(), [])
    return sorted(set(explicit) | set(inferred))


def route_task(task, workers, free_only=True):
    required = requirements_for(task)
    preferred = set(task.get("preferred_capabilities", []))
    excluded_ids = set(task.get("exclude_workers", []))
    eligible, rejected = [], []

    for worker in workers.get("workers", []):
        wid = str(worker.get("id", ""))
        caps = set(worker.get("capabilities", []))
        reasons = []
        if worker.get("enabled") is not True:
            reasons.append("worker disabled")
        if worker.get("available", True) is not True:
            reasons.append("worker unavailable")
        if wid in excluded_ids:
            reasons.append("worker excluded by task")
        if free_only and worker.get("free_only") is not True:
            reasons.append("not marked free-only")
        missing = sorted(set(required) - caps)
        if missing:
            reasons.append("missing capabilities: " + ", ".join(missing))
        if reasons:
            rejected.append({"worker_id": wid, "reasons": reasons})
            continue

        preferred_match = len(preferred & caps)
        eligible.append({
            "worker_id": wid,
            "display_name": worker.get("display_name", wid),
            "matched_capabilities": required,
            "preferred_matches": preferred_match,
            "priority": int(worker.get("routing_priority", 100)),
            "free_only": worker.get("free_only") is True,
        })

    eligible.sort(key=lambda item: (
        -item["preferred_matches"],
        item["priority"],
        item["worker_id"],
    ))
    for rank, candidate in enumerate(eligible, start=1):
        candidate["rank"] = rank

    selected = eligible[0] if eligible else None
    return {
        "task_id": str(task.get("task_id", "")),
        "task_type": task.get("task_type"),
        "required_capabilities": required,
        "selected_worker": selected,
        "ranked_candidates": eligible,
        "rejected_workers": rejected,
        "decision": "WORKER_RECOMMENDED" if selected else "NO_ELIGIBLE_WORKER",
        "requires_manual_handoff": True,
        "ai_invoked": False,
        "dispatch_enabled": False,
    }


def route_queue(queue, workers, free_only=True):
    results = [route_task(task, workers, free_only) for task in queue.get("tasks", [])
               if task.get("status", "OPEN") not in {"DONE", "CANCELLED"}]
    return {
        "schema_version": 1,
        "results": results,
        "routed": sum(1 for item in results if item["selected_worker"]),
        "unassigned": sum(1 for item in results if not item["selected_worker"]),
        "free_only": free_only,
        "dispatch_enabled": False,
        "ai_invoked": False,
        "execution_mode": "RECOMMENDATION_ONLY",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--queue", default="agency-work/queue.json")
    parser.add_argument("--workers", default="scripts/agency/workers.json")
    parser.add_argument("--out", default="agency-work/worker-routing.json")
    parser.add_argument("--allow-non-free", action="store_true",
                        help="Allow workers not explicitly marked free-only")
    args = parser.parse_args()
    queue = json.loads(Path(args.queue).read_text(encoding="utf-8"))
    workers = json.loads(Path(args.workers).read_text(encoding="utf-8"))
    result = route_queue(queue, workers, free_only=not args.allow_non_free)
    output = Path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "routed": result["routed"],
                      "unassigned": result["unassigned"], "ai_invoked": False,
                      "dispatch_enabled": False}, indent=2))


if __name__ == "__main__":
    main()
