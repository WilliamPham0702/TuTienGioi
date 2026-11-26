import unittest
from receipt_protocol import validate
BASE={"task_id":"T-20","agent_id":"copilot","mode":"coding","branch":"work/T-20","status":"CLAIMED","updated_at_utc":"2026-11-26T00:00:00Z"}
class ReceiptTests(unittest.TestCase):
    def test_claim_receipt_valid(self): self.assertEqual(validate(BASE), [])
    def test_bad_transition(self): self.assertIn("transition not allowed: OPEN -> DONE", validate({**BASE,"status":"DONE"}, "OPEN"))
    def test_blocked_requires_reason(self): self.assertIn("BLOCKED requires blocker text", validate({**BASE,"status":"BLOCKED"}))
    def test_review_requires_evidence(self):
        r={**BASE,"status":"REVIEW","deliverables":["src/file.py"]}
        self.assertIn("REVIEW requires test_summary", validate(r))
    def test_done_with_evidence(self):
        r={**BASE,"status":"DONE","deliverables":["src/file.py"],"test_summary":"3 tests passed"}
        self.assertEqual(validate(r,"REVIEW"),[])
    def test_no_auto_merge(self): self.assertIn("auto_merge must remain false", validate({**BASE,"auto_merge":True}))
if __name__ == "__main__": unittest.main()
