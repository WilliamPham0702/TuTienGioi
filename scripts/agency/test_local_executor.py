import json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import local_executor,return_receipt
class Tests(unittest.TestCase):
 @patch("local_executor.gh_json")
 def test_packet(self,m):
  m.return_value={"number":9,"title":"sample","body":"task","url":"url","labels":[{"name":"ai-task"}]}
  with tempfile.TemporaryDirectory() as d:
   packet=json.loads(local_executor.export_issue(9,Path(d)).read_text()); self.assertFalse(packet["ai_invoked"]); self.assertEqual(packet["execution_state"],"PACKET_EXPORTED_NOT_EXECUTED")
 @patch("local_executor.gh_json")
 def test_label_required(self,m):
  m.return_value={"number":9,"labels":[]}
  with tempfile.TemporaryDirectory() as d, self.assertRaisesRegex(ValueError,"label"): local_executor.export_issue(9,Path(d))
 def test_review_needs_deliverables(self):
  with self.assertRaisesRegex(ValueError,"deliverables"): return_receipt.validate_receipt({"issue_number":2,"worker_id":"x","status":"REVIEW","summary":"ok"})
 def test_blocked_needs_reason(self):
  with self.assertRaisesRegex(ValueError,"blocker"): return_receipt.validate_receipt({"issue_number":2,"worker_id":"x","status":"BLOCKED","summary":"stuck"})
 def test_valid_review(self):
  d={"issue_number":2,"worker_id":"copilot","status":"REVIEW","summary":"done","deliverables":["PR"],"test_summary":"ok"}; self.assertEqual(return_receipt.validate_receipt(d),d)
 def test_bad_issue(self):
  with self.assertRaisesRegex(ValueError,"positive"): return_receipt.validate_receipt({"issue_number":0,"worker_id":"x","status":"BLOCKED","summary":"x","blocker":"reason"})
if __name__=="__main__": unittest.main()
