#!/usr/bin/env python3
"""Match an AI task to registered workers without starting external AI sessions."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
REGISTRY = ROOT / "workers.json"

def load_registry(path: Path = REGISTRY) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("schema_version") != 1 or not isinstance(data.get("workers"), list):
        raise ValueError("Unsupported worker registry schema")
    return data

def discover(required: list[str], registry: dict[str, Any]) -> list[dict[str, Any]]:
    matches = []
    for worker in registry["workers"]:
        caps = set(worker.get("capabilities", []))
        missing = sorted(set(required) - caps)
        if worker.get("enabled") is True and not missing:
            matches.append({
                "id": worker["id"],
                "display_name": worker["display_name"],
                "native_trigger": worker.get("native_trigger", "manual"),
                "capabilities": sorted(caps),
                "trigger_ready": worker.get("native_trigger") == "github_copilot_coding_agent",
                "note": worker.get("notes", "")
            })
    return matches

def main() -> int:
    parser = argparse.ArgumentParser(description="Find registered AI workers that match task capabilities.")
    parser.add_argument("--capability", action="append", default=[], help="Required capability (repeatable)")
    parser.add_argument("--registry", type=Path, default=REGISTRY)
    args = parser.parse_args()
    result = {"required_capabilities": sorted(set(args.capability)), "workers": discover(args.capability, load_registry(args.registry))}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
