import unittest
from trigger_gate import build_manifest
REG={"schema_version":1,"workers":[{"id":"copilot","display_name":"Copilot","enabled":True,"native_trigger":"github_copilot_coding_agent"},{"id":"claude","display_name":"Claude","enabled":True,"native_trigger":"manual_or_native_app"},{"id":"deepseek","enabled":False,"native_trigger":"manual_or_native_app"}]}
class GateTests(unittest.TestCase):
 def test_supported_worker_is_ready_but_not_invoked(self):
  m=build_manifest(42,"copilot",REG); self.assertEqual(m["request_status"],"TRIGGER_READY"); self.assertFalse(m["trigger_adapter"]["invoked"]); self.assertFalse(m["safety"]["external_session_started"])
 def test_manual_worker_requires_manual_execution(self): self.assertEqual(build_manifest(42,"claude",REG)["request_status"],"MANUAL_EXECUTION_REQUIRED")
 def test_disabled_worker_rejected(self):
  with self.assertRaisesRegex(ValueError,"disabled"): build_manifest(42,"deepseek",REG)
 def test_unknown_worker_rejected(self):
  with self.assertRaisesRegex(ValueError,"unknown worker"): build_manifest(42,"missing",REG)
 def test_bad_issue_rejected(self):
  with self.assertRaisesRegex(ValueError,"positive"): build_manifest(0,"copilot",REG)
if __name__ == "__main__": unittest.main()
