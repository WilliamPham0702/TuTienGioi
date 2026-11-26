import unittest
from unittest.mock import patch, Mock
from native_executor import build_plan, execute_task

TASK = {"task_id": "T-1", "worker_id": "gemini", "prompt": "Summarize this task"}
ENABLED = {"providers": {"gemini": {
    "enabled": True, "free_only": True, "free_quota_confirmed": True
}}}


class NativeExecutorTests(unittest.TestCase):
    def test_default_provider_config_is_disabled(self):
        config = {"providers": {"gemini": {"enabled": False, "free_only": True,
                                            "free_quota_confirmed": False}}}
        self.assertEqual(build_plan(TASK, config)["status"], "BLOCKED")

    def test_requires_free_only(self):
        config = {"providers": {"gemini": {"enabled": True, "free_only": False,
                                            "free_quota_confirmed": True}}}
        self.assertEqual(build_plan(TASK, config)["reason"], "provider not marked free-only")

    def test_requires_operator_quota_confirmation_in_config(self):
        config = {"providers": {"gemini": {"enabled": True, "free_only": True,
                                            "free_quota_confirmed": False}}}
        self.assertIn("free quota", build_plan(TASK, config)["reason"])

    def test_unknown_provider_is_blocked(self):
        self.assertEqual(build_plan({**TASK, "worker_id": "deepseek"}, ENABLED)["status"], "BLOCKED")

    def test_missing_task_id_is_blocked(self):
        self.assertEqual(build_plan({**TASK, "task_id": ""}, ENABLED)["status"], "BLOCKED")

    def test_missing_prompt_is_blocked(self):
        self.assertEqual(build_plan({**TASK, "prompt": ""}, ENABLED)["status"], "BLOCKED")

    def test_dry_run_never_invokes_ai(self):
        result = execute_task(TASK, ENABLED)
        self.assertEqual(result["status"], "DRY_RUN")
        self.assertFalse(result["ai_invoked"])

    def test_execution_requires_explicit_free_quota_confirmation(self):
        result = execute_task(TASK, ENABLED, execute=True, confirm_free_quota=False)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertFalse(result["ai_invoked"])

    @patch("native_executor.shutil.which", return_value=None)
    def test_missing_cli_is_blocked(self, _which):
        result = execute_task(TASK, ENABLED, execute=True, confirm_free_quota=True)
        self.assertEqual(result["status"], "BLOCKED")
        self.assertFalse(result["ai_invoked"])

    @patch("native_executor.subprocess.run")
    @patch("native_executor.shutil.which", return_value="/usr/bin/gemini")
    def test_invokes_fixed_adapter_without_shell(self, _which, run):
        run.return_value = Mock(returncode=0, stdout="answer", stderr="")
        result = execute_task(TASK, ENABLED, execute=True, confirm_free_quota=True)
        self.assertEqual(result["status"], "COMPLETED")
        self.assertTrue(result["ai_invoked"])
        self.assertFalse(run.call_args.kwargs["shell"])


if __name__ == "__main__":
    unittest.main()
