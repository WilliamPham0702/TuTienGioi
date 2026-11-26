import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from quality_review import review_receipt


def receipt(**overrides):
    data = {
        "task_id": "TASK-29",
        "agent_id": "worker-code",
        "mode": "local-cli",
        "branch": "feature/task-29",
        "status": "REVIEW",
        "updated_at_utc": "2026-11-26T00:00:00Z",
        "deliverables": ["src/change.py"],
        "test_summary": "Ran unit tests; one skipped.",
        "auto_merge": False,
    }
    data.update(overrides)
    return data


class QualityReviewTests(unittest.TestCase):
    def test_valid_receipt_reaches_human_signoff_not_done(self):
        result = review_receipt(receipt())
        self.assertTrue(result["passed"])
        self.assertEqual(result["decision"], "ACCEPT_FOR_HUMAN_SIGNOFF")
        self.assertTrue(result["human_signoff_required"])
        self.assertFalse(result["auto_merge"])

    def test_missing_deliverables_requests_revision(self):
        result = review_receipt(receipt(deliverables=[]))
        self.assertFalse(result["passed"])
        self.assertEqual(result["decision"], "NEEDS_REVISION")
        self.assertIn("INVALID_RECEIPT", [x["code"] for x in result["findings"]])

    def test_missing_test_summary_requests_revision(self):
        result = review_receipt(receipt(test_summary=""))
        self.assertFalse(result["passed"])
        self.assertIn("MISSING_TEST_SUMMARY", [x["code"] for x in result["findings"]])

    def test_invalid_deliverable_shape_requests_revision(self):
        result = review_receipt(receipt(deliverables=[{"unexpected": "value"}]))
        self.assertFalse(result["passed"])
        self.assertIn("INVALID_DELIVERABLE", [x["code"] for x in result["findings"]])

    def test_invalid_lifecycle_is_blocked(self):
        result = review_receipt(receipt(status="DONE"))
        self.assertFalse(result["passed"])
        self.assertIn("INVALID_RECEIPT", [x["code"] for x in result["findings"]])

    def test_verified_workspace_artifact_is_reported(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "result.txt"
            source.write_text("verified payload")
            digest = hashlib.sha256(b"verified payload").hexdigest()
            obj = root / "workspace" / "objects" / "sha256" / digest[:2] / digest
            obj.parent.mkdir(parents=True)
            obj.write_bytes(source.read_bytes())
            manifest = {
                "schema_version": 1, "artifact_id": digest, "sha256": digest,
                "size_bytes": len(b"verified payload"), "filename": "result.txt",
                "object": f"objects/sha256/{digest[:2]}/{digest}"
            }
            manifest_path = root / "manifest.json"
            manifest_path.write_text(json.dumps(manifest))
            result = review_receipt(receipt(artifact_manifests=[str(manifest_path)]),
                                    root / "workspace")
            self.assertTrue(result["passed"])
            self.assertEqual(result["verified_artifacts"][0]["sha256"], digest)

    def test_corrupt_workspace_artifact_requests_revision(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            digest = hashlib.sha256(b"original").hexdigest()
            obj = root / "workspace" / "objects" / "sha256" / digest[:2] / digest
            obj.parent.mkdir(parents=True)
            obj.write_text("tampered")
            manifest = {"schema_version": 1, "artifact_id": digest, "sha256": digest,
                        "size_bytes": 8, "filename": "result.txt",
                        "object": f"objects/sha256/{digest[:2]}/{digest}"}
            path = root / "manifest.json"
            path.write_text(json.dumps(manifest))
            result = review_receipt(receipt(artifact_manifests=[str(path)]), root / "workspace")
            self.assertFalse(result["passed"])
            self.assertIn("ARTIFACT_INTEGRITY_FAILED", [x["code"] for x in result["findings"]])

    def test_worker_test_summary_is_not_treated_as_proof(self):
        result = review_receipt(receipt(test_summary="All tests passed"))
        self.assertTrue(result["test_summary_is_self_reported"])
        check = next(x for x in result["checks"] if x["id"] == "test_summary_present")
        self.assertIn("not independently verified", check["details"][0])


if __name__ == "__main__":
    unittest.main()
