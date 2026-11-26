# Native Local AI Execution V1

## What this adds
- A local CLI execution adapter for Claude Code, Gemini CLI, and GitHub Copilot CLI.
- Fixed provider command templates; task data cannot supply an executable or arbitrary arguments.
- Default dry-run. Real invocation requires both `--execute` and `--confirm-free-quota`.
- Provider config defaults to disabled; each provider must be explicitly enabled and marked free-only with free quota confirmed.
- Captures provider output as a review artifact. A successful CLI exit is not proof of correctness.

## Important free-tier limitation
The repository cannot determine whether a provider account currently has free quota or whether a CLI invocation could consume paid usage. The operator must verify the provider's current account/quota before enabling it and confirming each run. No API keys, secrets, or paid API endpoints are configured by this feature. Do not enable a provider if its current usage terms are unclear.

## Configure locally
Edit `scripts/agency/native_providers.json` on the machine that will run the task. For the chosen provider, set:
- `enabled: true`
- `free_only: true`
- `free_quota_confirmed: true`

All providers remain disabled in the committed default file. Do not commit credentials or local account state.

## Dry-run
```bash
python scripts/agency/native_executor.py --task agency-work/task.json
```

## Explicit local invocation
```bash
python scripts/agency/native_executor.py --task agency-work/task.json --execute --confirm-free-quota
```

Supported provider IDs: `claude`, `gemini`, `copilot`. Their respective local CLI must already be installed and authenticated. This module uses fixed, non-shell command arguments and a bounded timeout. The Claude and Gemini adapters use planning/approval-safe modes where supported; Copilot runs its prompt mode. Provider CLI behavior can change, so verify locally before relying on it.

## Safety boundaries
- No GitHub Actions job launches a provider.
- No API keys, secrets, paid API configuration, Production deployment, or automatic merge.
- No arbitrary shell execution or task-supplied command strings.
- Dry-run reports `ai_invoked=false`; only a started subprocess reports `ai_invoked=true`.
- A CLI response is untrusted output and requires review before receipt acceptance.
- The executor does not write into the game repository; it stores the returned result packet only.

## Tests
Run:
```bash
python -m unittest discover -s scripts/agency -p 'test_native_executor.py'
```
