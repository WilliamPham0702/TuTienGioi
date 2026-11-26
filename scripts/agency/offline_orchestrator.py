#!/usr/bin/env python3
"""Offline-only orchestration simulator. It cannot contact GitHub or an AI provider."""
from __future__ import annotations

import copy
import hashlib
import json
import threading
from pathlib import PurePosixPath
from typing import Any

ALLOWED_AI = {"ChatGPT", "Claude"}
FORBIDDEN_FLAGS = {
    "production": "Production work is not allowed",
    "real_tiktok_live": "Real TikTok LIVE is not allowed",
    "secrets": "Secret access is not allowed",
    "paid_services": "Paid services are not allowed",
    "auto_merge": "Auto-merge is not allowed",
}
CI_STATES = {"PASS", "FAIL", "PENDING", "MISSING"}


def _fingerprint(task: dict[str, Any]) -> str:
    encoded = json.dumps(task, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def _safe_relative_path(value: Any) -> bool:
    """Reject absolute, traversing, Windows-style, and empty repository paths."""
    if not isinstance(value, str) or not value.strip() or value.startswith("/") or "\\" in value:
        return False
    normalized = value.rstrip("/")
    parts = normalized.split("/")
    if not normalized or any(part in {"", ".", ".."} for part in parts):
        return False
    if ":" in parts[0]:
        return False
    return True


def _within_scope(path: str, roots: list[str]) -> bool:
    normalized = PurePosixPath(path).as_posix()
    for root in roots:
        normalized_root = PurePosixPath(root).as_posix().rstrip("/")
        if normalized == normalized_root or normalized.startswith(normalized_root + "/"):
            return True
    return False


def validate_task(task: dict[str, Any]) -> None:
    if not isinstance(task, dict):
        raise ValueError("task must be an object")
    required = ("task_id", "assigned_ai", "scope", "acceptance_criteria", "tests")
    missing = [key for key in required if not task.get(key)]
    if missing:
        raise ValueError("missing required fields: " + ", ".join(missing))
    if task["assigned_ai"] not in ALLOWED_AI:
        raise ValueError("assigned_ai must be ChatGPT or Claude")
    if not isinstance(task["scope"], list) or not task["scope"] or not all(
        _safe_relative_path(path) for path in task["scope"]
    ):
        raise ValueError("scope must contain safe relative repository paths")
    for flag, message in FORBIDDEN_FLAGS.items():
        if task.get(flag) is True:
            raise ValueError(message)
    if task.get("mode", "offline") != "offline":
        raise ValueError("only offline mode is supported")


class FakeExecutor:
    """Deterministic in-memory executor; external_calls is permanently zero."""

    def __init__(self, outcome: dict[str, Any] | None = None):
        self.outcome = outcome or {
            "changed_paths": ["scripts/agency/example.py"],
            "test_summary": "Fake tests passed",
        }
        self.invocations = 0
        self.external_calls = 0

    def execute(self, task: dict[str, Any]) -> dict[str, Any]:
        self.invocations += 1
        return copy.deepcopy(self.outcome)


class OfflineOrchestrator:
    """In-memory state machine for exercising safety gates without side effects."""

    def __init__(self, executor: FakeExecutor):
        self.executor = executor
        self._lock = threading.Lock()
        self._records: dict[str, dict[str, Any]] = {}

    def submit(self, task: dict[str, Any]) -> dict[str, Any]:
        validate_task(task)
        task_id = str(task["task_id"])
        fingerprint = _fingerprint(task)
        with self._lock:
            existing = self._records.get(task_id)
            if existing:
                if existing["fingerprint"] != fingerprint:
                    raise ValueError("task_id already exists with different content")
                return copy.deepcopy(existing["record"])
            record = {
                "task_id": task_id,
                "assigned_ai": task["assigned_ai"],
                "status": "OPEN",
                "request_id": fingerprint,
                "branch": None,
                "changed_paths": [],
                "test_summary": None,
                "ci": "MISSING",
                "external_ai_invoked": False,
                "auto_merge": False,
            }
            self._records[task_id] = {"fingerprint": fingerprint, "task": copy.deepcopy(task), "record": record}
            return copy.deepcopy(record)

    def claim(self, task_id: str) -> dict[str, Any]:
        with self._lock:
            item = self._get(task_id)
            record = item["record"]
            if record["status"] == "CLAIMED":
                return copy.deepcopy(record)
            if record["status"] != "OPEN":
                raise ValueError("only OPEN tasks can be claimed")
            record["status"] = "CLAIMED"
            record["branch"] = "offline/" + task_id
            return copy.deepcopy(record)

    def execute(self, task_id: str) -> dict[str, Any]:
        with self._lock:
            item = self._get(task_id)
            record = item["record"]
            if record["status"] != "CLAIMED":
                raise ValueError("task must be CLAIMED before execution")
            record["status"] = "IN_PROGRESS"
            task = copy.deepcopy(item["task"])
        try:
            result = self.executor.execute(task)
        except Exception:
            with self._lock:
                if record["status"] == "IN_PROGRESS":
                    record["status"] = "BLOCKED"
                    record["blocker"] = "EXECUTOR_ERROR"
                return copy.deepcopy(record)

        changed = result.get("changed_paths") if isinstance(result, dict) else None
        if not isinstance(changed, list) or not changed or not all(
            _safe_relative_path(path) and _within_scope(path, task["scope"])
            for path in changed
        ):
            with self._lock:
                if record["status"] == "IN_PROGRESS":
                    record["status"] = "BLOCKED"
                    record["blocker"] = "SCOPE_VIOLATION"
                return copy.deepcopy(record)
        if not result.get("test_summary"):
            with self._lock:
                if record["status"] == "IN_PROGRESS":
                    record["status"] = "BLOCKED"
                    record["blocker"] = "MISSING_TEST_EVIDENCE"
                return copy.deepcopy(record)
        with self._lock:
            # Cancellation wins over a late executor result.
            if record["status"] != "IN_PROGRESS":
                return copy.deepcopy(record)
            record["changed_paths"] = list(changed)
            record["test_summary"] = str(result["test_summary"])
            record["status"] = "REVIEW"
            record["draft_pr"] = True
            return copy.deepcopy(record)

    def set_ci(self, task_id: str, state: str) -> dict[str, Any]:
        if state not in CI_STATES:
            raise ValueError("invalid CI state")
        with self._lock:
            record = self._get(task_id)["record"]
            if record["status"] != "REVIEW":
                raise ValueError("CI can only be recorded for REVIEW tasks")
            record["ci"] = state
            return copy.deepcopy(record)

    def approve(self, task_id: str) -> dict[str, Any]:
        with self._lock:
            record = self._get(task_id)["record"]
            if record["status"] != "REVIEW" or record["ci"] != "PASS":
                raise ValueError("explicit PO approval requires REVIEW and CI PASS")
            record["status"] = "DONE"
            record["po_approved"] = True
            return copy.deepcopy(record)

    def cancel(self, task_id: str) -> dict[str, Any]:
        with self._lock:
            record = self._get(task_id)["record"]
            if record["status"] in {"DONE", "CANCELLED"}:
                raise ValueError("task is already terminal")
            record["status"] = "CANCELLED"
            return copy.deepcopy(record)

    def snapshot(self, task_id: str) -> dict[str, Any]:
        with self._lock:
            return copy.deepcopy(self._get(task_id)["record"])

    def _get(self, task_id: str) -> dict[str, Any]:
        if task_id not in self._records:
            raise ValueError("unknown task_id")
        return self._records[task_id]
