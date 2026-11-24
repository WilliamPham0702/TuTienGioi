# C-002 — Kết quả PoC (đợt 1: đã dựng xong, chờ đo trên PC của PO)

| Mục | Nội dung |
|---|---|
| Ngày | 25/11/2026 |
| Trạng thái | **CHƯA KẾT LUẬN ĐƯỢC ENGINE.** PoC-1 và PoC-2 cần số liệu và video từ PC Windows của PO; PoC-3 đã đạt trên máy cloud, chờ chạy lại trên máy PO. |
| Code | `poc/` (mã thử nghiệm, không phải sản phẩm). Nhật ký: `poc/DEVLOG.md` |
| Quy tắc | Mỗi con số trỏ tới file bằng chứng. Bài chưa chạy ghi **"chưa đo"**. |

## 0. Tóm tắt

| PoC | Trạng thái | Kết quả |
|---|---|---|
| **PoC-1** Hình ảnh và animation | **Đã dựng xong cả hai bản**; chưa chấm | Cùng asset, cùng kịch bản, cùng 60 nhân vật. Ảnh chụp trên máy cloud ở mục 1. Cần 3 video quay trên PC của PO để ChatGPT và PO chấm |
| **PoC-2** Hiệu năng trong OBS | **Chưa đo** | Gói đo tự động đã sẵn sàng (`poc/measure/`). Đã kiểm tra luồng dữ liệu đo hoạt động; **không có số hiệu năng nào được dùng làm kết luận** |
| **PoC-3** Game core và dữ liệu | **Đạt 5/5 kịch bản (MÔ PHỎNG, máy cloud)** | Mục 3. Chờ chạy lại trên PC của PO bằng `4_game_core.bat` |
| **Đề xuất engine cuối** | **Chưa đưa ra** | Theo quy tắc `POC_PLAN.md` mục 7, cần PoC-2 (bắt buộc) và điểm PoC-1 |

## 1. PoC-1 — Hình ảnh và animation

**Đã làm:** hai bản cùng đáp ứng V1–V9 (`POC_PLAN.md` mục 4):
- sảnh 4 lớp có parallax nhẹ;
- Tông chủ và 2 Trưởng lão;
- 40/60/80 đệ tử xếp 7 hàng, hàng sau nhỏ và tối hơn;
- idle (thở, đầu, tóc, áo, tay lệch pha giữa các nhân vật);
- tu luyện (bay nhẹ + hạt linh khí);
- ăn mừng, đi vào chỗ, đổi chỗ;
- đột phá: ấn pháp → hạt tụ khí → glow quanh nhân vật → cột sáng → nổ hạt → đổi màu áo → banner;
- tên tiếng Việt có dấu ở hàng đầu;
- cả hai chạy cùng một file kịch bản.

| Hạng mục | Phaser 4.2.1 | Godot 4.7.2 |
|---|---|---|
| Glow khi đột phá | Filter Glow có sẵn của Phaser 4 | Shader glow tự viết (26 dòng) trên CanvasGroup |
| Particle | ParticleEmitter | CPUParticles2D |
| Tên tiếng Việt | Đúng dấu (font Noto Sans, OFL) | Đúng dấu (cùng font) |
| Bản xuất | Web | Web (single-thread) + exe Windows |

**Ảnh chụp trên máy cloud** (render phần mềm, chỉ để kiểm tra đúng nội dung, **không phản ánh hiệu năng hay độ mượt**):
- `poc/evidence/poc1/sandbox_phaser_vs_godot_gathering.png`: giây 8,7 của kịch bản.
- `poc/evidence/poc1/sandbox_phaser_vs_godot_breakthrough.png`: giây 9,7.
- `poc/evidence/poc1/asset_characters.png`: 5 loại nhân vật.

**Nhận xét sơ bộ** (chưa phải điểm chấm):
- Ở cùng một asset, hai bản cho khung hình gần như giống hệt nhau. Với phong cách 2D/2.5D này, **khác biệt về hình ảnh giữa hai engine nhỏ**.
- Godot vẽ chữ viền mảnh và sắc hơn một chút.
- Lợi thế animation thực sự của Godot (Skeleton2D, AnimationPlayer, chỉnh trực quan) **không được dùng** trong PoC. Lý do: những công cụ này cần editor, đi ngược mục tiêu "PO + AI" (xem DEVLOG mục 2).

**Còn thiếu để chấm:** 3 video 60 giây quay bằng OBS trên PC của PO. Gói đo tự quay ở cuối `3_do_day_du.bat`.

## 2. PoC-2 — Runtime và hiệu năng

**Chưa đo.** Máy cloud dùng để phát triển không có GPU và không chạy được OBS. Theo `POC_PLAN.md` mục 8, số liệu ở đây không được dùng làm kết luận.

Đã kiểm tra bộ đo hoạt động đúng luồng (máy cloud, Chrome headless thay cho OBS):
- bộ đo phục vụ được cả hai bản Web;
- game gửi frame time về bộ đo;
- bộ đo tính FPS, p50/p95/p99, tỷ lệ giật và ghi file JSON kết quả.

**Đã phát hiện và sửa một lỗi đo quan trọng:**
- `delta` của Phaser bị làm mượt nên báo **60 fps trong khi thực tế chỉ 2–3 fps** (render phần mềm).
- Cả hai bản giờ đều đo **khoảng thời gian thật giữa hai khung hình**.

Cần PO chạy `poc/measure/3_do_day_du.bat` (khoảng 2,5 giờ, tự động) rồi gửi file zip kết quả.

## 3. PoC-3 — Game core và dữ liệu (MÔ PHỎNG)

**Máy chạy:** máy cloud Linux, Intel Xeon 2,1 GHz, 2 nhân, 7,8 GB RAM, Node.js 22.23.5.
**Bằng chứng:** `poc/evidence/poc3/poc3-linux-2026-11-24T17-32-08-877Z.json`. Ngoài ra có 8 unit test (Vitest) đều đạt (`poc/core/test/core.test.ts`).

| Kịch bản | Thông số (mô phỏng) | Kết quả | Đạt |
|---|---|---|---|
| S1 Bình thường | 1.000 người chơi, 300 hoạt động cùng lúc, 30 phút thời gian mô phỏng, 36.032 sự kiện | Xử lý 36.032 sự kiện trong 2,99 s (≈12.000 sự kiện/s); 1.000 người chơi trong DB; tổng tu vi từ quà khớp tính độc lập (17.870 = 17.870); 0 lệch giữa bảng tiến trình và ledger; 0 ref trùng | ✅ |
| S2 Spam | 20 người, 60 comment/phút, 15 like/giây | Linh khí tối đa của một người trong một phút = **60** (đúng trần 60); 84.000 linh khí bị từ chối | ✅ |
| S3 Bão like | 1.000 like/giây trong 60 giây, chạy thời gian thực | 60.000/60.000 sự kiện được xử lý, không mất sự kiện nào, hàng đợi tối đa 25 (trần 5.000); độ trễ p95 = 1,16 ms, p99 = 1,23 ms; CPU tiến trình ≈ 4,9% của 1 nhân | ✅ |
| S4 Trùng lặp | Mỗi sự kiện gửi 1–3 lần, bản sao trễ tới 30 giây | Loại đúng 36.337/36.337 bản trùng; tổng tu vi và linh khí **giống hệt** luồng sạch | ✅ |
| S5 Crash | Kill tiến trình đột ngột (SIGKILL) khi đang chạy, rồi khởi động lại | 5 lần kill giữa chừng, lần thứ 6 chạy xong; kết quả **giống hệt** lần chạy không crash; sao lưu → khôi phục giống hệt | ✅ |

**Giới hạn của kết quả này, nói thẳng:**
- Đây là **dữ liệu mô phỏng**. Nó chứng minh **logic xử lý** đúng: chống trùng, giới hạn spam, lưu và khôi phục.
- Nó **không** chứng minh được TikTok gửi sự kiện đầy đủ hay đúng tần suất giả định (ví dụ like bị gộp, join không đủ), cũng không chứng minh connector ổn định. Những điểm đó chỉ đo được ở **PoC-LIVE** (đang hoãn).
- Ở S5, mô phỏng phát lại được sự kiện từ điểm đã lưu nên không mất gì. **Với TikTok thật** (không phát lại được), mỗi lần crash sẽ mất tối đa sự kiện của tick đang mở (≤ 5 giây).
- Số liệu S1/S3 đo trên máy cloud 2 nhân; cần đo lại trên PC của PO.

## 4. Quan sát thêm cần ChatGPT xem (thiết kế)

- **Giao diện LIVE của TikTok** (bình luận, nút quà) che phần dưới khung dọc. Trong layout PoC, **hàng đệ tử gần nhất và tên của họ** nằm đúng vùng dễ bị che. Đề xuất ChatGPT kiểm tra vùng an toàn khi thiết kế layout thật.
- Tên dài (ví dụ "Sư muội Lan 23") không vừa một ô ở hàng đầu khi có 9 người/hàng. PoC đang cắt còn khoảng 9 ký tự.

## 5. Bước tiếp theo

1. PO tải gói đo `TuTienGioi_PoC_C002.zip` (Claude gửi trong chat), chạy theo `HUONG_DAN.md`, gửi lại file zip kết quả và 3 video.
2. Claude phân tích, cập nhật file này với số liệu PoC-2 và PoC-3 trên máy PO.
3. ChatGPT và PO chấm PoC-1 theo `POC_PLAN.md` mục 4.
4. Claude đề xuất engine cuối theo `POC_PLAN.md` mục 7; PO khóa D-005.
