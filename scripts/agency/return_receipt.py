#!/usr/bin/env/env python3
"""Validate a local AI receipt and publish it to a GitHub issue using gh CLI."""
import argparse,json,subprocess
from pathlib import Path
REQUIRED=("issue_number","worker_id","status","summary")

def validate_receipt(data):
    for f in REQUIRED:
        if f not in data or data[f] in (None,""): raise ValueError(f"missing required field: {f}")
    if not isinstance(data["issue_number"],int) or data["issue_number"]<1: raise ValueError("issue_number must be a positive integer")
    if data["status"] not in {"REVIEW","BLOCKED"}: raise ValueError("status must be REVIEW or BLOCKED")
    if data["status"]=="BLOCKED" and not data.get("blocker"): raise ValueError("BLOCKED receipt requires blocker text")
    if data["status"]=="REVIEW" and not data.get("deliverables"): raise ValueError("REVIEW receipt requires deliverables")
    return data

def publish_receipt(path):
    r=validate_receipt(json.loads(path.read_text(encoding="utf-8")))
    comment="## Local AI Receipt\n- Worker: "+str(r["worker_id"])+"\n- Status: "+r["status"]+"\n- Summary: "+r["summary"]+"\n"
    if r.get("deliverables"): comment+="- Deliverables: "+", ".join(map(str,r["deliverables"]))+"\n"
    if r.get("test_summary"): comment+="- Tests: "+str(r["test_summary"])+"\n"
    if r.get("blocker"): comment+="- Blocker: "+str(r["blocker"])+"\n"
    subprocess.run(["gh","issue","comment",str(r["issue_number"]),"--body",comment],check=True)
    return r["issue_number"]

def main():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument("receipt",type=Path); a=p.parse_args(); print(f"Published receipt to issue #{publish_receipt(a.receipt)}")
if __name__=="__main__": main()
