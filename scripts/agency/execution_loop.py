#!/usr/bin/env python3
"""Safe orchestration loop: scheduler -> claim packet -> validated receipt. Never launches AI."""
import argparse, json
from datetime import datetime, timezone
from pathlib import Path
from scheduler import schedule, parse_time
from receipt_protocol import validate as validate_receipt

def run_loop(queue, workers, receipts=None, now=None, limit=1):
    now = now or datetime.now(timezone.utc)
    receipts = receipts or []
    tasks = {str(t.get("task_id")): t for t in queue.get("tasks", [])}
    accepted, rejected = [], []
    for receipt in receipts:
        tid = str(receipt.get("task_id", ""))
        task = tasks.get(tid)
        errors = validate_receipt(receipt, task.get("status") if task else None)
        if not task:
            errors.append("unknown task_id")
        if errors:
            rejected.append({"task_id": tid, "errors": errors})
        else:
            task["status"] = receipt["status"]
            accepted.append(tid)
    plan = schedule({"tasks": list(tasks.values())}, workers, now=now, limit=limit)
    packets = []
    for item in plan["plan"]:
        task = tasks[item["task_id"]]
        task["status"] = "CLAIMED"
        task["claimed_by"] = item["worker_id"]
        task["claim_time"] = now.isoformat()
        packets.append({"task_id": item["task_id"], "worker_id": item["worker_id"], "task": task,
                       "state": "CLAIMED_PACKET_READY", "ai_invoked": False, "external_session_started": False})
    return {"schema_version": 1, "updated_at": now.isoformat(), "accepted_receipts": accepted,
            "rejected_receipts": rejected, "claim_packets": packets, "dispatch_enabled": False,
            "ai_invoked": False, "execution_mode": "MANUAL_HANDOFF_ONLY"}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--queue",default="agency-work/queue.json")
    p.add_argument("--workers",default="scripts/agency/workers.json")
    p.add_argument("--receipts",default="agency-work/receipts.json")
    p.add_argument("--out",default="agency-work/execution-loop.json")
    p.add_argument("--limit",type=int,default=1); p.add_argument("--now")
    a=p.parse_args()
    queue=json.loads(Path(a.queue).read_text(encoding="utf-8"))
    workers=json.loads(Path(a.workers).read_text(encoding="utf-8"))
    receipts=json.loads(Path(a.receipts).read_text(encoding="utf-8")) if Path(a.receipts).exists() else []
    result=run_loop(queue,workers,receipts,parse_time(a.now),a.limit)
    out=Path(a.out); out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(result,indent=2)+"\\n",encoding="utf-8")
    print(json.dumps({"output":str(out),"claim_packets":len(result["claim_packets"]),
                     "accepted_receipts":len(result["accepted_receipts"]),"rejected_receipts":len(result["rejected_receipts"]),
                     "ai_invoked":False,"dispatch_enabled":False},indent=2))
if __name__=="__main__": main()
