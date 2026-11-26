import json
import tempfile
import unittest
from pathlib import Path
from discover_workers import discover, load_registry

class DiscoveryTests(unittest.TestCase):
    def test_enabled_matching_worker_only(self):
        registry = {"workers": [
            {"id": "one", "display_name": "One", "enabled": True, "capabilities": ["code", "tests"], "native_trigger": "manual"},
            {"id": "off", "display_name": "Off", "enabled": False, "capabilities": ["code", "tests"]},
            {"id": "partial", "display_name": "Partial", "enabled": True, "capabilities": ["code"]}
        ]}
        self.assertEqual([w["id"] for w in discover(["code", "tests"], registry)], ["one"])

    def test_empty_requirements_returns_enabled_workers(self):
        registry = {"workers": [{"id": "one", "display_name": "One", "enabled": True, "capabilities": ["code"]}]}
        self.assertEqual([w["id"] for w in discover([], registry)], ["one"])

    def test_invalid_schema_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "bad.json"
            path.write_text(json.dumps({"schema_version": 2, "workers": []}), encoding="utf-8")
            with self.assertRaises(ValueError):
                load_registry(path)

if __name__ == "__main__":
    unittest.main()
