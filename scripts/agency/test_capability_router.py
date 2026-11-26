import unittest
from capability_router import route_task, route_queue

WORKERS = {"workers": [
    {"id": "claude", "display_name": "Claude", "enabled": True, "free_only": True,
     "capabilities": ["architecture", "design", "review", "code", "documentation"]},
    {"id": "copilot", "display_name": "Copilot", "enabled": True, "free_only": True,
     "capabilities": ["code", "tests", "github", "python", "javascript"], "routing_priority": 10},
    {"id": "deepseek", "display_name": "DeepSeek", "enabled": True, "free_only": True,
     "capabilities": ["architecture", "code", "review", "documentation"]},
    {"id": "disabled", "enabled": False, "free_only": True, "capabilities": ["code"]},
    {"id": "paid", "enabled": True, "free_only": False, "capabilities": ["code"]},
]}


class CapabilityRouterTests(unittest.TestCase):
    def test_exact_capability_match_selects_eligible_worker(self):
        result = route_task({"task_id": "1", "required_capabilities": ["tests"]}, WORKERS)
        self.assertEqual(result["selected_worker"]["worker_id"], "copilot")

    def test_task_type_infers_capabilities(self):
        result = route_task({"task_id": "2", "task_type": "design"}, WORKERS)
        self.assertEqual(result["required_capabilities"], ["design"])
        self.assertEqual(result["selected_worker"]["worker_id"], "claude")

    def test_explicit_and_inferred_capabilities_are_unioned(self):
        result = route_task({"task_id": "3", "task_type": "code",
                             "required_capabilities": ["review"]}, WORKERS)
        self.assertEqual(result["required_capabilities"], ["code", "review"])
        self.assertIn(result["selected_worker"]["worker_id"], {"claude", "deepseek"})

    def test_disabled_worker_is_never_selected(self):
        result = route_task({"task_id": "4", "required_capabilities": ["code"]}, WORKERS)
        self.assertNotEqual(result["selected_worker"]["worker_id"], "disabled")

    def test_free_only_excludes_worker_not_marked_free(self):
        result = route_task({"task_id": "5", "required_capabilities": ["code"]}, WORKERS)
        self.assertNotEqual(result["selected_worker"]["worker_id"], "paid")
        self.assertTrue(all(item["worker_id"] != "paid" for item in result["ranked_candidates"]))

    def test_preferred_capability_breaks_tie_before_priority(self):
        result = route_task({"task_id": "6", "required_capabilities": ["code"],
                             "preferred_capabilities": ["javascript"]}, WORKERS)
        self.assertEqual(result["selected_worker"]["worker_id"], "copilot")

    def test_no_match_returns_unassigned_not_fake_worker(self):
        result = route_task({"task_id": "7", "required_capabilities": ["3d-modeling"]}, WORKERS)
        self.assertIsNone(result["selected_worker"])
        self.assertEqual(result["decision"], "NO_ELIGIBLE_WORKER")

    def test_exclusions_are_respected(self):
        result = route_task({"task_id": "8", "required_capabilities": ["code"],
                             "exclude_workers": ["copilot", "claude", "deepseek"]}, WORKERS)
        self.assertIsNone(result["selected_worker"])

    def test_terminal_tasks_are_skipped(self):
        result = route_queue({"tasks": [{"task_id": "9", "status": "DONE"}]}, WORKERS)
        self.assertEqual(result["results"], [])

    def test_router_never_dispatches_or_invokes_ai(self):
        result = route_task({"task_id": "10", "required_capabilities": ["code"]}, WORKERS)
        self.assertFalse(result["dispatch_enabled"])
        self.assertFalse(result["ai_invoked"])
        self.assertTrue(result["requires_manual_handoff"])


if __name__ == "__main__":
    unittest.main()
