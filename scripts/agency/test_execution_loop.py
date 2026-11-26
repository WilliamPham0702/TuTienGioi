import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import unittest
from datetime import datetime, timezone
from execution_loop import run_loop

class LoopTests(unittest.TestCase):
    def setUp(self):
        self.now=datetime(2026,1,1,tzinfo=timezone.utc)
        self.queue={"tasks":[{"task_id":"A","status":"OPEN","priority":"P1","required_capabilities":["code"],"created_at":"2026-01-01"},
                             {"task_id":"B","status":"OPEN","priority":"P2","required_capabilities":["art"],"created_at":"2026-01-01","depends_on":["A"]}]}
        self.workers={"workers":[{"id":"w1","enabled":True,"capabilities":["code"]},{"id":"w2","enabled":True,"capabilities":["art"]}]}
    def test_claims_ready_task_only_and_manual(self):
        r=run_loop(self.queue,self.workers,now=self.now,limit=2)
        self.assertEqual([p["task_id"] for p in r["claim_packets"]],["A"])
        self.assertFalse(r["ai_invoked"]); self.assertFalse(r["dispatch_enabled"])
        self.assertEqual(r["claim_packets"][0]["state"],"CLAIMED_PACKET_READY")
    def test_dependency_unblocks_after_valid_done_receipt(self):
        q={"tasks":[{"task_id":"A","status":"IN_PROGRESS"},{"task_id":"B","status":"OPEN","priority":"P1","required_capabilities":["art"],"depends_on":["A"]}]}
        workers={"workers":[{"id":"w2","enabled":True,"capabilities":["art"]}]}
        receipt={"task_id":"A","agent_id":"w1","mode":"manual","branch":"work","status":"DONE","updated_at_utc":"2026-01-01T00:00:00Z","deliverables":["x"],"test_summary":"not run"}
        r=run_loop(q,workers,[receipt],now=self.now)
        self.assertEqual(r["accepted_receipts"],["A"])
        self.assertEqual([p["task_id"] for p in r["claim_packets"]],["B"])
    def test_invalid_receipt_rejected(self):
        r=run_loop(self.queue,self.workers,[{"task_id":"unknown","status":"DONE"}],now=self.now)
        self.assertEqual(len(r["rejected_receipts"]),1)
    def test_unknown_task_receipt_rejected(self):
        receipt={"task_id":"Z","agent_id":"x","mode":"manual","branch":"x","status":"CLAIMED","updated_at_utc":"2026-01-01"}
        r=run_loop(self.queue,self.workers,[receipt],now=self.now)
        self.assertIn("unknown task_id",r["rejected_receipts"][0]["errors"])
if __name__=="__main__": unittest.main()
