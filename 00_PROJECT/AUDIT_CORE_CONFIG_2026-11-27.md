# Audit: packages/core config vs GDD — 2026-11-27

Người thực hiện: Claude (AI). Base commit: `37417490e15fa0ff636f85d57b51e340dbd8f46b` (main).
Loại task: rà soát chỉ đọc (read-only). Không sửa code, không sửa quyết định đã duyệt.

## 1. Phạm vi và giới hạn
- Đã đọc: `packages/core/src/config.ts`, `engine.ts` (phần cơ duyên), `types.ts`, `test/game.test.ts` (một test), `01_GAME_DESIGN/GAME_FLOW_v0.1.md` §7 và §11, `00_PROJECT/TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md`, `00_PROJECT/DECISION_LOG.md`.
- **Chưa chạy test.** `npm ci` trong `packages/core` thất bại (lỗi npm do mạng phiên bị giới hạn) và `vitest` không có sẵn. Mọi kết luận dưới đây dựa trên đọc mã, không có bằng chứng từ test.

## 2. Khớp với quyết định đã duyệt
- Ngưỡng Tu Vi mỗi Tiểu Cảnh trong `config.ts` (300 … 1.500.000) khớp D-020 và GAME_FLOW §7.

## 3. Mâu thuẫn cần PO quyết định (KHÔNG tự sửa)

### 3.1 Trang bị / pháp bảo đang có trong code
- Checkpoint (2026-11-26) ghi rõ: "Explicitly excluded: equipment and pháp bảo systems", và "no equipment or pháp bảo" cho vật phẩm.
- Mandate dự án ghi: "Game không có hệ thống trang bị. Game không có pháp bảo."
- Nhưng `config.ts` (dòng 73–78) có `weapon` 7% và `treasure` 3% trong `fortuneTable`; `engine.ts` (dòng 349, 467–480) tính `weaponPct`/`treasurePct` vào Chiến Lực và thông báo "một kiện pháp bảo"; `test/game.test.ts` (dòng 335–340) kiểm thử hành vi này.
- `GAME_FLOW_v0.1.md` (dòng 21, 230, 243, 256) và `GDD_v0.3.md` (dòng 50, 145, 160) đưa công pháp/vũ khí/pháp bảo vào cơ duyên và Chiến Lực.
- **Quyết định cần:** giữ hay bỏ pháp bảo/vũ khí. Nếu bỏ, cần sửa đồng thời `config.ts`, `engine.ts`, `types.ts`, `test/game.test.ts` và GAME_FLOW/GDD_v0.3; đây là thay đổi thiết kế cần PO duyệt theo change-control trong DECISION_LOG. "Công pháp" (gongfa) cũng cần làm rõ vì mandate không đề cập trực tiếp.

### 3.2 Xác suất linh căn không khớp giữa hai tài liệu
- Checkpoint: Tạp 35% (×1), Song 25% (×2), Tam 18% (×3), Thiên 12% (×4), Dị 6% (×5), Tiên 3% (×6), Thánh thể 1% (×10).
- `config.ts` / GAME_FLOW: Tạp 40% (×1.0), Tứ 25% (×1.2), Tam 18% (×1.4), Song 10% (×1.7), Nhất Phẩm 5% (×2.0), Thiên 1.8% (×2.5), Dị 0.2% (×3.0).
- Hai hệ số và tên bậc khác nhau hoàn toàn. D-017 ghi bảng GAME_FLOW là tạm. **Cần PO chốt bảng nào là nguồn chính.**

### 3.3 Ngưỡng cảnh giới trong checkpoint đã cũ so với D-020
- Checkpoint ghi ngưỡng tích lũy (Luyện Khí 1.200; Trúc Cơ 6.000; … Tiên Cảnh 7.200.000) và đột phá tự động không thất bại.
- D-020 (2026-11-25) và `config.ts` dùng Tu Vi mỗi Tiểu Cảnh và tỉ lệ đột phá có thất bại (D-011). **Đề xuất:** cập nhật checkpoint theo D-011 và D-020 (chỉ là sửa tài liệu, cần PO xác nhận).

## 4. Việc chưa làm / tiếp theo
- Cài dependency và chạy `npm test` + `npm run typecheck` trong `packages/core` ở môi trường có mạng. Ghi kết quả thật vào tài liệu này.
- Chờ PO trả lời mục 3.1–3.3 trước khi sửa code cơ duyên hoặc config.
- Không merge PR này vào main: `AI_ORCHESTRATION.md` yêu cầu PO duyệt khi merge, và CI chưa được kiểm chứng.
