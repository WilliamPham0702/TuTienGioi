#!/usr/bin/env python3
"""Guarded local CLI adapter for explicitly enabled free-quota AI workers.

This launches only fixed, allowlisted CLI commands. It never uses a shell,
accepts arbitrary commands, or treats a dry-run as an AI invocation.
"""
import argparse
import json
import os
import shutil
import subprocess
from pathlib import Path

# Fixed command templates only. No command or arguments are read from task data.
PROVIDER_COMMANDS = {
    "claude": lambda prompt: ["claude", "-p", prompt, "--output-format", "text",
                              "--permission-mode", "plan"],
    "gemini": lambda prompt: ["gemini", "-p", prompt, "--approval-mode", "plan"],
    "copilot": lambda prompt: ["copilot", "-p", prompt],
}
SAFE_ENV_KEYS = (
    "PATH", "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA",
    "SYSTEMROOT", "WINDIR", "TMP", "TEMP",
)


class ExecutionBlocked(Exception):
    pass


def build_plan(task, providers):
    worker_id = str(task.get("worker_id", ""))
    provider = providers.get("providers", {}).get(worker_id)
    if not provider:
        return {"status": "BLOCKED", "reason": "unknown provider", "ai_invoked": False}
    if provider.get("enabled") is not True:
        return {"status": "BLOCKED", "reason": "provider disabled", "ai_invoked": False}
    if provider.get("free_only") is not True:
        return {"status": "BLOCKED", "reason": "provider not marked free-only", "ai_invoked": False}
    if provider.get("free_quota_confirmed") is not True:
        return {"status": "BLOCKED", "reason": "free quota not confirmed by operator", "ai_invoked": False}
    if worker_id not in PROVIDER_COMMANDS:
        return {"status": "BLOCKED", "reason": "provider has no supported fixed adapter", "ai_invoked": False}
    if not str(task.get("task_id", "")).strip():
        return {"status": "BLOCKED", "reason": "missing task_id", "ai_invoked": False}
    prompt = str(task.get("prompt", "")).strip()
    if not prompt:
        return {"status": "BLOCKED", "reason": "missing prompt", "ai_invoked": False}
    return {
        "status": "READY",
        "task_id": str(task["task_id"]),
        "provider": worker_id,
        "executable": worker_id if worker_id != "claude" else "claude",
        "ai_invoked": False,
        "requires_execute_flag": True,
        "requires_free_quota_confirmation": True,
    }


def _safe_environment():
    return {key: os.environ[key] for key in SAFE_ENV_KEYS if key in os.environ}


def execute_task(task, providers, execute=False, confirm_free_quota=False,
                 timeout_seconds=300):
    plan = build_plan(task, providers)
    if plan["status"] != "READY":
        return plan
    if not execute:
        return {**plan, "status": "DRY_RUN", "ai_invoked": False}
    if not confirm_free_quota:
        return {"status": "BLOCKED", "reason": "explicit free-quota confirmation required",
                "task_id": str(task["task_id"]), "ai_invoked": False}

    provider_id = plan["provider"]
    prompt = str(task["prompt"]).strip()
    executable = provider_id
    binary = shutil.which(executable)
    if not binary:
        return {"status": "BLOCKED", "reason": "provider CLI not installed",
                "provider": provider_id, "task_id": str(task["task_id"]),
                "ai_invoked": False}

    argv = PROVIDER_COMMANDS[provider_id](prompt)
    argv[0] = binary
    try:
        completed = subprocess.run(
            argv, shell=False, check=False, capture_output=True, text=True,
            timeout=timeout_seconds, env=_safe_environment(),
        )
    except subprocess.TimeoutExpired:
        return {"status": "TIMEOUT", "provider": provider_id,
                "task_id": str(task["task_id"]), "ai_invoked": True}
    except OSError as exc:
        return {"status": "LAUNCH_ERROR", "provider": provider_id,
                "task_id": str(task["task_id"]), "error": str(exc),
                "ai_invoked": False}

    return {
        "status": "COMPLETED" if completed.returncode == 0 else "FAILED",
        "provider": provider_id,
        "task_id": str(task["task_id"]),
        "return_code": completed.returncode,
        "stdout": completed.stdout,
        "stderr": completed.stderr,
        "ai_invoked": True,
        "artifact_is_unverified": True,
        "note": "CLI exit status is not quality approval; review output before accepting.",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--task", required=True, help="JSON task packet")
    parser.add_argument("--providers", default="scripts/agency/native_providers.json")
    parser.add_argument("--out", default="agency-work/native-execution-result.json")
    parser.add_argument("--execute", action="store_true",
                        help="Actually launch an enabled local provider CLI")
    parser.add_argument("--confirm-free-quota", action="store_true",
                        help="Confirm this provider run is within an available free quota")
    parser.add_argument("--timeout", type=int, default=300)
    args = parser.parse_args()

    task = json.loads(Path(args.task).read_text(encoding="utf-8"))
    providers = json.loads(Path(args.providers).read_text(encoding="utf-8"))
    result = execute_task(task, providers, args.execute, args.confirm_free_quota,
                          max(1, min(args.timeout, 1800)))
    output = Path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: result.get(key) for key in
                      ("status", "task_id", "provider", "reason", "ai_invoked")}, indent=2))


if __name__ == "__main__":
    main()
