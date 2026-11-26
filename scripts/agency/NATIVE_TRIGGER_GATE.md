# Native Trigger Gate V1
Manual, opt-in workflow validates an issue and worker and creates a portable manifest. Enable the selected worker in workers.json, then Actions → AI Agency native trigger gate → Run workflow. Requires repository variable AGENCY_CI_ENABLED=true.
TRIGGER_READY means registry configuration is eligible for a future provider adapter only. The current bridge cannot invoke Copilot/Claude/DeepSeek sessions; invoked and external_session_started remain false. No paid APIs, secrets, Production, or auto-merge.
