import unittest
from datetime import datetime, timezone
from agency_cycle import run_agency
NOW = datetime(2026, 11, 26, 12, 0, tzinfo=timezone.utc)
def w():
    return {"workers":[{"id":"free-code","enabled":True,"available":True,"free_only":True,"capabilities":["code","tests"]}]}
def t(status="OPEN", **kw):
    x={"task_id":"T1","status":status,"priority":"P1","task_type":"code","description":"Implement change","required_capabilities":[],"depends_on":[],"attempts":0,"max_attempts":3}; x.update(kw); return x
def receipt(status="REVIEW", **kw):
    x={"task_id":"T1","agent_id":"free-code","mode":"manual","branch":"feature/t1","status":status,"updated_at_utc":"2026-11-26T11:00:00Z","deliverables":["src/change.py"],"test_summary":"Tests run; one skipped.","auto_merge":False}; x.update(kw); return x
class CycleTests(unittest.TestCase):
    def test_claim_packet(self):
        r=run_agency({"tasks":[t()]},w(),now=NOW); self.assertEqual(r["claim_packets"][0]["worker_id"],"free-code"); self.assertFalse(r["ai_invoked"])
    def test_no_nonfree_worker(self):
        workers={"workers":[dict(w()["workers"][0],free_only=False)]}; r=run_agency({"tasks":[t()]},workers,now=NOW); self.assertEqual(r["claim_packets"],[])
    def test_dependency_waits(self):
        r=run_agency({"tasks":[t(),dict(t(),task_id="T2",depends_on=["T1"])]},w(),now=NOW,dispatch_limit=5); self.assertEqual([x["task_id"] for x in r["claim_packets"]],["T1"])
    def test_review_waits_for_human(self):
        r=run_agency({"tasks":[t("IN_PROGRESS")]},w(),[receipt()],now=NOW); self.assertEqual(r["queue_snapshot"]["tasks"][0]["status"],"REVIEW")
    def test_human_approval_marks_done(self):
        r=run_agency({"tasks":[t("IN_PROGRESS")]},w(),[receipt()],human_approvals=["T1"],now=NOW); self.assertEqual(r["queue_snapshot"]["tasks"][0]["status"],"DONE")
    def test_bad_review_needs_revision(self):
        r=run_agency({"tasks":[t("IN_PROGRESS")]},w(),[receipt(deliverables=[])],human_approvals=["T1"],now=NOW); self.assertEqual(r["reviews"][0]["decision"],"NEEDS_REVISION"); self.assertEqual(r["queue_snapshot"]["tasks"][0]["status"],"IN_PROGRESS")
    def test_blocked_receipt(self):
        r=run_agency({"tasks":[t("IN_PROGRESS")]},w(),[receipt("BLOCKED",blocker="Missing dependency")],now=NOW); self.assertEqual(r["queue_snapshot"]["tasks"][0]["status"],"BLOCKED")
    def test_unknown_receipt_rejected(self):
        r=run_agency({"tasks":[t()]},w(),[receipt(task_id="UNKNOWN")],now=NOW); self.assertEqual(r["rejected_receipts"][0]["errors"],["unknown task_id"])
    def test_input_queue_not_mutated(self):
        q={"tasks":[t()]}; run_agency(q,w(),now=NOW); self.assertEqual(q["tasks"][0]["status"],"OPEN")
    def test_duplicate_task_ids_rejected(self):
        with self.assertRaises(ValueError): run_agency({"tasks":[t(),t()]},w(),now=NOW)
if __name__ == "__main__": unittest.main()
