import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from workspace_exchange import publish, verify, materialize, WorkspaceError


class WorkspaceExchangeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.workspace = self.root / "workspace"
        self.source = self.root / "design output.txt"
        self.source.write_text("shared result", encoding="utf-8")

    def tearDown(self):
        self.temp.cleanup()

    def publish_one(self):
        manifest = publish(self.source, self.workspace, "worker-design", "TASK-28",
                            "A shared artifact")
        return manifest, self.workspace / "manifests" / f"{manifest['sha256']}.json"

    def test_publish_creates_content_addressed_object_and_manifest(self):
        manifest, path = self.publish_one()
        obj = self.workspace / manifest["object"]
        self.assertTrue(obj.is_file())
        self.assertTrue(path.is_file())
        self.assertEqual(manifest["sha256"], hashlib.sha256(b"shared result").hexdigest())

    def test_duplicate_publish_is_idempotent(self):
        first, _ = self.publish_one()
        second, _ = self.publish_one()
        self.assertEqual(first["sha256"], second["sha256"])

    def test_verify_detects_tampered_object(self):
        manifest, path = self.publish_one()
        obj = self.workspace / manifest["object"]
        obj.write_text("tampered", encoding="utf-8")
        with self.assertRaises(WorkspaceError):
            verify(path, self.workspace)

    def test_materialize_verified_artifact(self):
        manifest, path = self.publish_one()
        result = materialize(path, self.workspace, self.root / "out")
        self.assertEqual(result["status"], "MATERIALIZED")
        self.assertEqual((self.root / "out" / manifest["filename"]).read_text(), "shared result")

    def test_refuses_to_overwrite_destination(self):
        manifest, path = self.publish_one()
        out = self.root / "out"
        out.mkdir()
        (out / manifest["filename"]).write_text("keep")
        with self.assertRaises(WorkspaceError):
            materialize(path, self.workspace, out)
        self.assertEqual((out / manifest["filename"]).read_text(), "keep")

    def test_rejects_invalid_object_path(self):
        manifest, path = self.publish_one()
        data = json.loads(path.read_text())
        data["object"] = "../../outside"
        path.write_text(json.dumps(data))
        with self.assertRaises(WorkspaceError):
            verify(path, self.workspace)

    def test_rejects_oversized_artifact(self):
        with self.assertRaises(WorkspaceError):
            publish(self.source, self.workspace, "worker", "TASK", max_bytes=2)

    def test_rejects_symlink_source(self):
        link = self.root / "link.txt"
        link.symlink_to(self.source)
        with self.assertRaises(WorkspaceError):
            publish(link, self.workspace, "worker", "TASK")


if __name__ == "__main__":
    unittest.main()
