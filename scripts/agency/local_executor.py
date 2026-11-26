#!/usr/bin/env python3
"""Export a GitHub agency issue to a local AI work packet using gh CLI auth."""
import argparse, json, subprocess
from pathlib import Path

def gh_json(args):
    result = subprocess.run(["gh", *args], check=True, capture_output=True, text=True)
    return json.loads(result.stdout)

def export_issue(issue_number, output_dir):
    if issue_number < 1: raise ValueError("issue number must be positive")
    issue = gh_json(["issue", "view", str(issue_number), "--json", "number,title,body,url,labels"])
    labels = {label["name"] for label in issue.get("labels", [])}
    if not ({"ai-task", "agency-task"} & labels): raise ValueError("issue must have ai-task or agency-task label")
    output_dir.mkdir(parents=True, exist_ok=True)
    packet = {"schema_version":1,"issue":issue,"execution_state":"PACKET_EXPORTED_NOT_EXECUTED","executor":"local_user_session","ai_invoked":False}
    path=output_dir / f"issue-{issue_number}-packet.json"
    path.write_text(json.dumps(packet,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    return path

def main():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument("--issue",type=int,required=True); p.add_argument("--output-dir",type=Path,default=Path("agency-work")); a=p.parse_args(); print(export_issue(a.issue,a.output_dir))
if __name__=="__main__": main()
