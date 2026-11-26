import unittest
from datetime import datetime, timezone
from scheduler import schedule

NOW = datetime(2026, 1, 1, tzinfo=timezone.utc)
WORKERS = {"workers": [
 {"id":"copilot","enabled":True,"capabilities":["code","tests"]},
 {"id":"claude","enabled":True,"capabilities":["architecture","review"]}
]}
class SchedulerTests(unittest.TestCase):
 def test_priority_and_limit(self):
  q={"tasks":[{"task_id":"b","priority":"P2","status":"OPEN","required_capabilities":["code"]},{"task_id":"a","priority":"P0","status":"OPEN","required_capabilities":["code"]}]}
  self.assertEqual(schedule(q,WORKERS,NOW,1)["plan"][0]["task_id"],"a")
 def test_dependency_blocks_until_done(self):
  q={"tasks":[{"task_id":"base","status":"IN_PROGRESS"},{"task_id":"next","status":"OPEN","depends_on":["base"],"required_capabilities":["code"]}]}
  self.assertEqual(schedule(q,WORKERS,NOW,3)["plan"],[])
  q["tasks"][0]["status"]="DONE"
  self.assertEqual(schedule(q,WORKERS,NOW,3)["plan"][0]["task_id"],"next")
 def test_missing_dependency_blocked(self):
  q={"tasks":[{"task_id":"x","status":"OPEN","depends_on":["absent"]}]}
  self.assertEqual(schedule(q,WORKERS,NOW,2)["decisions"][0]["decision"],"BLOCKED")
 def test_disabled_worker_not_selected(self):
  q={"tasks":[{"task_id":"x","status":"OPEN","required_capabilities":["code"]}]}
  off={"workers":[dict(WORKERS["workers"][0],enabled=False)]}
  self.assertEqual(schedule(q,off,NOW)["plan"],[])
 def test_capability_match(self):
  q={"tasks":[{"task_id":"x","status":"OPEN","required_capabilities":["architecture"]}]}
  self.assertEqual(schedule(q,WORKERS,NOW)["plan"][0]["worker_id"],"claude")
 def test_expired_lease_backoff(self):
  q={"tasks":[{"task_id":"x","status":"IN_PROGRESS","attempts":0,"max_attempts":3,"lease_expires_at":"2025-12-31T23:00:00+00:00"}]}
  d=schedule(q,WORKERS,NOW)["decisions"][0]
  self.assertEqual(d["decision"],"RETRY"); self.assertEqual(d["retry_after_seconds"],60)
 def test_retry_limit_blocks(self):
  q={"tasks":[{"task_id":"x","status":"IN_PROGRESS","attempts":2,"max_attempts":3,"lease_expires_at":"2025-12-31T23:00:00+00:00"}]}
  self.assertEqual(schedule(q,WORKERS,NOW)["decisions"][0]["decision"],"BLOCKED")
 def test_ai_never_invoked(self):
  q={"tasks":[{"task_id":"x","status":"OPEN","required_capabilities":["code"]}]}
  r=schedule(q,WORKERS,NOW)
  self.assertFalse(r["ai_invoked"]); self.assertFalse(r["dispatch_enabled"])
if __name__=="__main__": unittest.main()
