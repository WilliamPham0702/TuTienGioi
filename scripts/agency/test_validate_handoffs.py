import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from validate_handoffs import validate


class HandoffValidationTests(unittest.TestCase):
    def build_workspace(self, root: Path, *, tamper_hash: bool = False, omit_artifact: bool = False) -> None:
        manifest_dir = root / "00_PROJECT/AGENCY/manifests"
        handoff_dir = root / "00_PROJECT/AGENCY/handoffs"
        artifact = root / "ASSETS/shared/synthetic.txt"
        manifest_dir.mkdir(parents=True)
        handoff_dir.mkdir(parents=True)
        artifact.parent.mkdir(parents=True)
        payload = b"synthetic artifact\n"
        if not omit_artifact:
            artifact.write_bytes(payload)
        digest = hashlib.sha256(payload).hexdigest()
        if tamper_hash:
            digest = "0" * 64
        manifest = {
            "asset_id": "asset-test-001-v1",
            "task_id": "HANDOFF-TEST-001",
            "producer": {"ai": "test-agent-a", "mode": "test"},
            "created_at_utc": "2026-11-26T00:00:00Z",
            "artifact": {
                "path": "ASSETS/shared/synthetic.txt",
                "mime_type": "text/plain",
                "size_bytes": len(payload),
                "sha256": digest,
            },
            "validation": {"status": "SYNTHETIC_TEST"},
        }
        handoff = {
            "task_id": "HANDOFF-TEST-002",
            "from_ai": "test-agent-a",
            "to_ai": "test-agent-b",
            "asset_id": "asset-test-001-v1",
            "artifact_path": "ASSETS/shared/synthetic.txt",
            "sha256": digest,
            "next_action": "Read the artifact and create a downstream summary.",
        }
        (manifest_dir / "asset-test-001-v1.json").write_text(json.dumps(manifest), encoding="utf-8")
        (handoff_dir / "handoff-test-002.json").write_text(json.dumps(handoff), encoding="utf-8")

    def test_valid_manifest_and_handoff(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            self.build_workspace(root)
            self.assertEqual(validate(root), [])

    def test_checksum_mismatch_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            self.build_workspace(root, tamper_hash=True)
            self.assertTrue(any("SHA-256 mismatch" in error for error in validate(root)))

    def test_missing_artifact_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            self.build_workspace(root, omit_artifact=True)
            self.assertTrue(any("artifact does not exist" in error for error in validate(root)))


if __name__ == "__main__":
    unittest.main()
