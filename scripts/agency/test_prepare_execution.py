import unittest
from prepare_execution import prepare
BODY = """Task ID: T-19
Assigned AI: Copilot
Mode: coding
Status: OPEN
Scope: limited
Acceptance criteria: completed
Tests: run tests
Deliverables: files
"""
class ExecutionPacketTests(unittest.TestCase):
    def setUp(self):
        self.issue = {"number": 19, "title": "Bridge test", "html_url": "https://github.com/example/repo/issues/19", "body": BODY}
        self.registry = {"schema_version": 1, "workers": [{"id": "copilot", "display_name": "Copilot", "enabled": True, "native_trigger": "manual", "capabilities": ["code"]}]}
    def test_packet_prepared_not_triggered(self):
        p = prepare(self.issue, "copilot", self.registry)
        self.assertEqual(p["execution_status"], "PREPARED_NOT_TRIGGERED")
        self.assertFalse(p["safety"]["auto_merge"])
        self.assertFalse(p["safety"]["production_changes_allowed"])
    def test_disabled_worker_rejected(self):
        self.registry["workers"][0]["enabled"] = False
        with self.assertRaisesRegex(ValueError, "disabled"): prepare(self.issue, "copilot", self.registry)
    def test_unknown_worker_rejected(self):
        with self.assertRaisesRegex(ValueError, "unknown worker"): prepare(self.issue, "missing", self.registry)
    def test_incomplete_issue_rejected(self):
        self.issue["body"] = "Task ID: 1"
        with self.assertRaisesRegex(ValueError, "missing headings"): prepare(self.issue, "copilot", self.registry)
if __name__ == "__main__": unittest.main()
