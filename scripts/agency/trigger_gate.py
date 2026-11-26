#!/usr/bin/env python3
"""Create a gated trigger manifest; never launches external agents."""
from __future__ import annotations
import argparse, json
from pathlib import Path
from typing import Any
SUPPORTED = {"github_copilot_coding_agent"}
def build_manifest(issue_number: int, worker_id: str, registry: dict[str, Any]) -> dict[str, Any]:
    if issue_number < 1: raise ValueError("issue_number must be positive")
    if registry.get("schema_version") != 1 or not isinstance(registry.get("workers"), list): raise ValueError("unsupported worker registry schema")
    worker = next((w for w in registry["workers"] if w.get("id") == worker_id), None)
    if worker is None: raise ValueError(f"unknown worker: {worker_id}")
    if worker.get("enabled") is not True: raise ValueError(f"worker disabled: {worker_id}")
    trigger = worker.get("native_trigger", "manual")
    supported = trigger in SUPPORTED
    return {"schema_version":1,"request_status":"TRIGGER_READY" if supported else "MANUAL_EXECUTION_REQUIRED","issue_number":issue_number,"worker":{"id":worker_id,"display_name":worker.get("display_name",worker_id),"native_trigger":trigger},"trigger_adapter":{"adapter":trigger,"supported_by_bridge":supported,"invoked":False},"next_action":"Native provider invocation is not wired; hand off to supported GitHub native agent UI." if supported else "Open the configured AI app and provide the execution packet manually.","safety":{"external_session_started":False,"paid_services_allowed":False,"secrets_required":False,"production_allowed":False,"auto_merge":False}}
def main() -> int:
    p=argparse.ArgumentParser(description=__doc__); p.add_argument("--issue",type=int,required=True); p.add_argument("--worker",required=True); p.add_argument("--registry",type=Path,default=Path(__file__).with_name("workers.json")); p.add_argument("--output",type=Path,default=Path("trigger-manifest.json")); a=p.parse_args()
    try: result=build_manifest(a.issue,a.worker,json.loads(a.registry.read_text(encoding="utf-8")))
    except (OSError,json.JSONDecodeError,ValueError,TypeError) as exc: p.error(str(exc))
    a.output.parent.mkdir(parents=True,exist_ok=True); a.output.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":result["request_status"],"worker":a.worker,"invoked":False,"output":str(a.output)})); return 0
if __name__ == "__main__": raise SystemExit(main())
