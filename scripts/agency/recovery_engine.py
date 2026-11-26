#!/usr/bin/env python3
"""Deterministic recovery planner. It records recovery decisions but never launches workers or AI."""
import argparse
import copy
import hashlib
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

DEFAULT_BASE_BACKOFF_SECONDS = 60
DEFAULT_MAX_BACKOFF_SECONDS = 3600
DEFAULT_HEARTBEAT_TIMEOUT_SECONDS = 900
ACTIVE_STATUSES = {"IN_PROGRESS", "CLAIMED"}


def parse_time(value):
    if not value:
        return None
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("timestamps must include a timezone")
    return parsed


def _event_id(task):
    identity = "|".join([
        str(task.get("task_id", "")),
        str(task.get("claimed_by", "")),
        str(task.get("claim_time", "")),
        str(task.get("lease_expires_at", "")),
        str(task.get("attempts", 0)),
    ])
    return hashlib.sha256(identity.encode("utf-8")).hexdigest()


def _eligible_alternate(task, workers):
    required = set(task.get("required_capabilities", []))
    previous = task.get("claimed_by") or task.get("last_worker_id")
    candidates = [
        worker for worker in workers.get("workers", [])
        if worker.get("enabled") is True
        and worker.get("available", True) is True
        and worker.get("id") != previous
        and required.issubset(set(worker.get("capabilities", [])))
    ]
    candidates.sort(key=lambda worker: str(worker.get("id", "")))
    return candidates[0].get("id") if candidates else None


def recover(queue, workers, history=None, now=None,
            heartbeat_timeout_seconds=DEFAULT_HEARTBEAT_TIMEOUT_SECONDS,
            base_backoff_seconds=DEFAULT_BASE_BACKOFF_SECONDS,
            max_backoff_seconds=DEFAULT_MAX_BACKOFF_SECONDS):
    """Return a copied queue, append-only audit history, and decisions.

    Idempotency is based on the active claim identity. Re-running recovery against
    the same stale claim cannot increment attempts or append a duplicate event.
    """
    now = now or datetime.now(timezone.utc)
    updated = copy.deepcopy(queue)
    audit = copy.deepcopy(history or [])
    seen = {entry.get("event_id") for entry in audit}
    decisions = []

    for task in updated.get("tasks", []):
        if task.get("status") not in ACTIVE_STATUSES:
            continue
        expiry = parse_time(task.get("lease_expires_at"))
        heartbeat = parse_time(task.get("last_heartbeat_at"))
        stale_reason = None
        if expiry and expiry <= now:
            stale_reason = "LEASE_EXPIRED"
        elif heartbeat and (now - heartbeat).total_seconds() >= heartbeat_timeout_seconds:
            stale_reason = "HEARTBEAT_TIMEOUT"
        elif not heartbeat and not expiry and task.get("claim_time"):
            claim_time = parse_time(task["claim_time"])
            if (now - claim_time).total_seconds() >= heartbeat_timeout_seconds:
                stale_reason = "WORKER_STALLED"

        if not stale_reason:
            continue

        event_id = _event_id(task)
        if event_id in seen:
            decisions.append({"task_id": str(task.get("task_id")), "decision": "ALREADY_RECOVERED",
                              "event_id": event_id, "reason": stale_reason})
            continue

        attempts = int(task.get("attempts", 0)) + 1
        max_attempts = max(1, int(task.get("max_attempts", 3)))
        previous_worker = task.get("claimed_by") or task.get("last_worker_id")
        alternate = _eligible_alternate(task, workers)

        if attempts >= max_attempts:
            decision = "BLOCKED"
            reason = "retry limit reached after " + stale_reason.lower()
            task["status"] = "BLOCKED"
            task["blocked_reason"] = reason
            retry_after = None
        else:
            decision = "RETRY_SCHEDULED"
            reason = stale_reason.lower().replace("_", " ")
            delay = min(max_backoff_seconds, base_backoff_seconds * (2 ** (attempts - 1)))
            retry_after = now + timedelta(seconds=delay)
            task["status"] = "WAITING_FOR_AGENT"
            task["attempts"] = attempts
            task["available_at"] = retry_after.isoformat()
            task["last_worker_id"] = previous_worker
            task.pop("claimed_by", None)
            task.pop("claim_time", None)
            task.pop("lease_expires_at", None)
            task.pop("last_heartbeat_at", None)

        event = {
            "event_id": event_id,
            "task_id": str(task.get("task_id")),
            "event": decision,
            "reason": reason,
            "previous_worker_id": previous_worker,
            "suggested_worker_id": alternate,
            "attempt": attempts,
            "recorded_at": now.isoformat(),
            "retry_at": retry_after.isoformat() if retry_after else None,
        }
        audit.append(event)
        seen.add(event_id)
        decisions.append({key: value for key, value in event.items() if key != "recorded_at"})

    return {
        "schema_version": 1,
        "generated_at": now.isoformat(),
        "queue": updated,
        "history": audit,
        "decisions": decisions,
        "dispatch_enabled": False,
        "ai_invoked": False,
        "execution_mode": "RECOVERY_PLAN_ONLY",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--queue", default="agency-work/queue.json")
    parser.add_argument("--workers", default="scripts/agency/workers.json")
    parser.add_argument("--history", default="agency-work/recovery-history.json")
    parser.add_argument("--out", default="agency-work/recovery-plan.json")
    parser.add_argument("--now")
    parser.add_argument("--heartbeat-timeout", type=int, default=DEFAULT_HEARTBEAT_TIMEOUT_SECONDS)
    args = parser.parse_args()
    queue = json.loads(Path(args.queue).read_text(encoding="utf-8"))
    workers = json.loads(Path(args.workers).read_text(encoding="utf-8"))
    history_path = Path(args.history)
    history = json.loads(history_path.read_text(encoding="utf-8")) if history_path.exists() else []
    result = recover(queue, workers, history, parse_time(args.now),
                     heartbeat_timeout_seconds=args.heartbeat_timeout)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(out), "decisions": len(result["decisions"]),
                      "dispatch_enabled": False, "ai_invoked": False}, indent=2))


if __name__ == "__main__":
    main()
