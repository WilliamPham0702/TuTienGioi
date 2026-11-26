# C-002 PoC — Nhật ký phát triển (DEVLOG)

Ghi theo yêu cầu `POC_PLAN.md` mục 4: thời gian làm thực tế, số lần phải dùng editor trực quan, khả năng mở rộng.

## 1. Thời gian (giờ Việt Nam, 24–25/11/2026, người làm: Claude)

| Hạng mục | Bắt đầu | Kết thúc | Thời lượng | Ghi chú |
|---|---|---|---|---|
| Asset SVG (nhân vật 5 loại, nền 4 lớp, 3 VFX) + font tiếng Việt | 23:56 | 00:03 | ~7 phút | Dùng chung cho cả hai engine |
| Kịch bản, animation JSON, layout dùng chung | 00:03 | 00:04 | ~2 phút | `poc/shared/` |
| **Phaser 4** – cảnh sảnh (PoC-1A) | 00:04 | 00:12 | ~8 phút + ~4 phút sửa lỗi | Lỗi: tên quá dài, HUD; cách đo frame time (delta bị làm mượt) |
| **Godot 4** – cảnh sảnh (PoC-1B) + xuất Web và exe | 00:06 | 00:12 | ~6 phút + ~2 phút sửa lỗi | Lỗi: `CPUParticles2D` 2D không có emission ring |
| Game core + mô phỏng + SQLite + test (PoC-3) | 00:12 | 00:19 | ~7 phút + ~3 phút sửa lỗi | Lỗi: cú pháp TS không chạy trực tiếp được trên Node; vòng chờ bận làm sai CPU % |
| Gói đo PoC-2 (`measure/`) | 00:15 | 00:27 | ~12 phút | Kiểm thử luồng dữ liệu bằng Chrome headless |

**Cảnh báo khi đọc số giờ:**
- Đây là thời gian của **AI viết code**, không quy đổi được sang thời gian của lập trình viên người.
- **Godot được làm sau Phaser** và dùng lại toàn bộ thiết kế (rig, kịch bản, layout), nên thời gian Godot **thấp hơn thực tế** nếu làm độc lập.
- Kết luận: chênh lệch thời gian giữa hai engine ở PoC này **không đủ để làm căn cứ chọn engine**. Căn cứ chính vẫn là PoC-1 (chấm hình ảnh) và PoC-2 (đo trên máy PO).

## 2. Dùng editor trực quan

| Engine | Số lần phải mở editor trực quan | Ghi chú |
|---|---|---|
| Phaser 4 | 0 | Toàn bộ là TypeScript; build bằng `npm run build` |
| Godot 4.7.2 | 0 | Scene dựng hoàn toàn bằng GDScript; import và xuất bằng dòng lệnh `--headless`. Mình **không** dùng các thế mạnh cần editor của Godot (AnimationPlayer, Skeleton2D, chỉnh particle trực quan), để so sánh công bằng với Phaser. Nếu dùng chúng, chất lượng animation Godot có thể cao hơn, nhưng AI khó làm và PO khó review |

## 3. Kích thước code và khả năng mở rộng

| Chỉ số | Phaser 4 | Godot 4 |
|---|---|---|
| Số dòng code cảnh (không tính asset dùng chung) | 556 (`main.ts`) | 705 (`main.gd` 470 + `character.gd` 209 + shader 26) |
| Riêng hiệu ứng đột phá | 67 dòng | 105 dòng |
| Thêm 1 tier trang phục mới | 0 dòng code engine. Chỉ sửa `build_assets.py` (bảng màu + danh sách tier) | 0 dòng code engine, giống Phaser |
| Thêm 1 hiệu ứng mới | Ước tính 30–70 dòng (đo thật khi làm) | Ước tính 50–100 dòng (đo thật khi làm) |
| Kích thước bản build | ~1,4 MB JS + asset | Web: ~39 MB (`index.wasm` 38 MB). Exe: ~105 MB |

Lưu ý: số dòng chỉ phản ánh **cách mình viết PoC này**, không phải giới hạn của engine.

## 4. Các lỗi phát hiện và đã sửa (có giá trị cho quyết định)

1. **`delta` của engine bị làm mượt.** Phaser báo 60 fps trong khi máy test thực tế chỉ chạy 2–3 fps. Cả hai engine giờ đều đo **khoảng thời gian thật giữa hai khung hình** (`performance.now()` / `Time.get_ticks_usec()`). Nếu không phát hiện lỗi này, PoC-2 sẽ cho số đẹp giả.
2. **S3 (bão like) đo CPU sai** vì vòng xử lý chờ bận (busy-wait). Đã sửa thành nghỉ 1 ms khi hàng đợi rỗng.
3. **So sánh S4 với S1** phải đóng tick tới cùng một mốc thời gian, nếu không bản có sự kiện trùng chạy dài hơn và cộng thêm tu vi theo thời gian. Đây là lỗi của bài test, không phải lỗi của core.
