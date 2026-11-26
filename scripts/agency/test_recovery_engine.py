import unittest
from datetime import datetime, timezone
from recovery_engine import recover

NOW = datetime(2026, 11, 26, 12, 0, tzinfo=timezone.utc)
WORKERS = {"workers": [
    {"id": "alpha", "enabled": True, "capabilities": ["code"]},
    {"id": "beta", "enabled": True, "capabilities": ["code"]},
    {"id": "disabled", "enabled": False, "capabilities": ["code"]},
]}


def task(**overrides):
    value = {
        "task_id": "T-1", "status": "IN_PROGRESS", "claimed_by": "alpha",
        "claim_time": "2026-11-26T11:00:00+00:00",
        "lease_expires_at": "2026-11-26T11:30:00+00:00",
        "attempts": 0, "max_attempts": 4, "required_capabilities": ["code"],
    }
    value.update(overrides)
    return value


class RecoveryEngineTests(unittest.TestCase):
    def test_expired_lease_schedules_retry_and_alternate_worker(self):
        result = recover({"tasks": [task()]}, WORKERS, now=NOW)
        decision = result["decisions"][0]
        updated = result["queue"]["tasks"][0]
        self.assertEqual(decision["event"], "RETRY_SCHEDULED")
        self.assertEqual(decision["suggested_worker_id"], "beta")
        self.assertEqual(updated["status"], "WAITING_FOR_AGENT")
        self.assertEqual(updated["attempts"], 1)
        self.assertEqual(decision["retry_at"], "2026-11-26T12:01:00+00:00")

    def test_retry_limit_blocks_task(self):
        result = recover({"tasks": [task(attempts=3, max_attempts=4)]}, WORKERS, now=NOW)
        self.assertEqual(result["queue"]["tasks"][0]["status"], "BLOCKED")
        self.assertEqual(result["decisions"][0]["event"], "BLOCKED")

    def test_heartbeat_timeout_detects_stalled_worker(self):
        value = task(lease_expires_at="2026-11-26T13:00:00+00:00",
                     last_heartbeat_at="2026-11-26T11:40:00+00:00")
        result = recover({"tasks": [value]}, WORKERS, now=NOW, heartbeat_timeout_seconds=900)
        self.assertEqual(result["decisions"][0]["reason"], "heartbeat timeout")

    def test_same_claim_is_idempotent(self):
        first = recover({"tasks": [task()]}, WORKERS, now=NOW)
        second = recover(first["queue"], WORKERS, first["history"], now=NOW)
        # First pass transitions the task out of an active state and appends one audit event.
        # A second pass must not emit another decision, increment attempts, or duplicate history.
        self.assertEqual(second["decisions"], [])
        self.assertEqual(len(second["history"]), 1)
        self.assertEqual(second["queue"]["tasks"][0]["attempts"], 1)
        self.assertEqual(second["queue"]["tasks"][0]["status"], "WAITING_FOR_AGENT")

    def test_no_alternate_worker_is_reported_as_none(self):
        workers = {"workers": [WORKERS["workers"][0]]}
        result = recover({"tasks": [task()]}, workers, now=NOW)
        self.assertIsNone(result["decisions"][0]["suggested_worker_id"])

    def test_non_stale_and_terminal_tasks_are_untouched(self):
        fresh = task(lease_expires_at="2026-11-26T13:00:00+00:00")
        done = task(status="DONE")
        result = recover({"tasks": [fresh, done]}, WORKERS, now=NOW)
        self.assertEqual(result["decisions"], [])
        self.assertEqual(result["queue"]["tasks"][0]["status"], "IN_PROGRESS")

    def test_recovery_never_dispatches_or_invokes_ai(self):
        result = recover({"tasks": [task()]}, WORKERS, now=NOW)
        self.assertFalse(result["dispatch_enabled"])
        self.assertFalse(result["ai_invoked"])


if __name__ == "__main__":
    unittest.main()
