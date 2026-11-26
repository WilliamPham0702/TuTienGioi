import hashlib, json, tempfile, unittest
from pathlib import Path
from receive_handoff import receive

class ReceiverSimulationTests(unittest.TestCase):
    def workspace(self, root: Path, *, corrupt=False) -> Path:
        asset=root/"ASSETS/synthetic/shared.txt"; md=root/"00_PROJECT/AGENCY/manifests"; hd=root/"00_PROJECT/AGENCY/handoffs"
        asset.parent.mkdir(parents=True); md.mkdir(parents=True); hd.mkdir(parents=True)
        content=b"cross-agent handoff fixture\n"; asset.write_bytes(content); digest=hashlib.sha256(content).hexdigest()
        handoff={"task_id":"RECEIVE-TEST-001","from_ai":"synthetic-agent-a","to_ai":"synthetic-agent-b","asset_id":"receiver-fixture-v1","artifact_path":"ASSETS/synthetic/shared.txt","sha256":"0"*64 if corrupt else digest,"next_action":"Create a downstream receipt."}
        manifest={"asset_id":"receiver-fixture-v1","producer":{"ai":"synthetic-agent-a","mode":"test"},"artifact":{"path":"ASSETS/synthetic/shared.txt","sha256":digest,"size_bytes":len(content)}}
        (md/"receiver-fixture-v1.json").write_text(json.dumps(manifest),encoding="utf-8")
        hp=hd/"receive-test-001.json"; hp.write_text(json.dumps(handoff),encoding="utf-8"); return hp
    def test_matching_handoff_accepted(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); hp=self.workspace(root); result=receive(root,hp,"synthetic-agent-b")
            self.assertEqual(result["receipt_status"],"RECEIVED_AND_VERIFIED_SIMULATION")
            self.assertEqual(result["verified_bytes"],len(b"cross-agent handoff fixture\n"))
    def test_wrong_receiver_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); hp=self.workspace(root)
            with self.assertRaisesRegex(ValueError,"receiver identity"): receive(root,hp,"wrong-agent")
    def test_checksum_mismatch_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); hp=self.workspace(root,corrupt=True)
            with self.assertRaisesRegex(ValueError,"checksum does not match"): receive(root,hp,"synthetic-agent-b")
if __name__=="__main__": unittest.main()
