# C-002 — Kế hoạch Proof of Concept (PoC)

| Mục | Nội dung |
|---|---|
| Task | C-002 — PoC so sánh Phaser 4 và Godot 4; runtime/hiệu năng; game core và dữ liệu |
| Người thực hiện | Claude (kỹ thuật). PO chạy bài đo hiệu năng trên PC. ChatGPT phản biện hình ảnh. |
| Căn cứ | Quyết định PO ngày 24/11/2026 (DECISION_LOG D-005, D-007, D-009); `TECHNICAL_ARCHITECTURE_PROPOSAL.md` |
| Trạng thái | **Kế hoạch — chưa có kết quả.** Mọi số liệu sẽ được ghi ở `08_TECHNICAL/POC_RESULTS.md` kèm log và ảnh chụp. |

---

## 1. Mục tiêu và câu hỏi cần trả lời

PoC trả lời 4 câu hỏi. Câu trả lời phải dựa trên **số liệu đo được**, không dựa trên suy đoán.

1. Với **cùng asset và cùng yêu cầu**, engine nào cho hình ảnh và animation chibi tiên hiệp tốt hơn, và tốn bao nhiêu giờ phát triển? (PoC-1)
2. Mỗi engine có giữ được **30 FPS ổn định** trong OBS ở 1080×1920 với 40/60/80 nhân vật trên PC thật của PO không? (PoC-2)
3. Game core có xử lý đúng **500–1.000 người chơi mô phỏng**, không cộng trùng, chặn được spam và khôi phục được sau crash không? (PoC-3)
4. Kết luận: **khóa Phaser 4 hay chuyển sang Godot 4?** (mục 7)

## 2. Ràng buộc (từ D-009)

- **0 VNĐ.** Chỉ dùng công cụ, thư viện và asset miễn phí theo giấy phép. Không đăng ký dịch vụ.
- **Không kết nối TikTok thật.** Không dùng connector không chính thức. Không yêu cầu hay lưu mật khẩu, cookie, session token.
- **PoC không phải sản phẩm.** Code nằm trong `poc/`, được phép bỏ đi sau khi có kết luận.
- **PoC-2 không phát LIVE:** chỉ dùng OBS trên máy (preview + ghi hình cục bộ) để đo.
- Không merge `main`, không deploy khi chưa có phê duyệt rõ ràng.

## 3. Asset dùng chung cho hai engine

| Asset | Nguồn | Giấy phép | Ghi chú |
|---|---|---|---|
| Nhân vật chibi đệ tử (6–10 lớp: đầu, mặt, tóc trước, tóc sau, thân, tay trái, tay phải, áo choàng, phụ kiện) + 3 biến thể màu áo theo cảnh giới | **Claude tự vẽ bằng SVG** | Sản phẩm gốc của dự án; không có bên thứ ba | Xuất PNG đã tách lớp + file pivot JSON. Cả hai engine dùng **cùng file PNG** |
| Tông chủ, 2 Trưởng lão | Claude tự vẽ SVG (biến thể từ cùng bộ khung) | Như trên | Đứng yên + idle |
| Nền sảnh tông môn 3–4 lớp (trời/núi, mây, kiến trúc, tiền cảnh) | Claude tự vẽ SVG | Như trên | 1080×1920; dùng cho parallax nhẹ |
| Particle linh khí, vòng ấn đột phá, tia sáng | Claude tự vẽ (PNG nhỏ) | Như trên | |
| Font tên người chơi | Noto Sans (Google Fonts) | SIL Open Font License 1.1 | Hỗ trợ đầy đủ tiếng Việt; lưu file license trong `poc/assets/LICENSES.md` |

**Lưu ý:** đây là asset **mức placeholder có chủ đích**, đủ để so sánh **khả năng engine** (lớp, pivot, tween, blend, particle, filter), **không** đại diện chất lượng art cuối. Không dùng ảnh hay asset nào từ Internet trong PoC, nên không có rủi ro giấy phép bên thứ ba.

Công cụ (miễn phí): Node.js LTS, Phaser 4 (MIT), Vite (MIT), Godot 4.5 (MIT) kèm export templates chính thức, OBS Studio (GPL), Chrome/Edge sẵn có. Các file giấy phép được liệt kê trong `poc/assets/LICENSES.md` và `poc/THIRD_PARTY.md`.

## 4. PoC-1 — Hình ảnh và animation (Phaser 4 và Godot 4)

**Yêu cầu chung cho cả hai bản:**

| # | Yêu cầu |
|---|---|
| V1 | Sảnh tông môn 1080×1920, nền 3–4 lớp, parallax nhẹ (dao động chậm) |
| V2 | Tông chủ ở bệ trung tâm, 2 Trưởng lão hai bên |
| V3 | **60 đệ tử** xếp theo hàng; hàng sau nhỏ và mờ hơn (chiều sâu 2.5D) |
| V4 | Idle: thở, tóc và áo đung đưa lệch pha giữa các nhân vật |
| V5 | Chuyển động cơ bản: đệ tử đi vào chỗ (lần đầu xuất hiện), đổi chỗ, giơ tay ăn mừng |
| V6 | Linh khí: hạt sáng bay lên quanh nhân vật đang tu luyện |
| V7 | Đột phá: tụ khí → vòng ấn → bùng sáng (glow/bloom) → đổi màu áo sang tier mới → thông báo |
| V8 | Nameplate tiếng Việt có dấu, 2 dòng (tên, cảnh giới), đọc được ở hàng trước |
| V9 | Nhận lệnh từ cùng một file kịch bản sự kiện (JSON), để hai bản chạy **cùng kịch bản** |

**Cách đánh giá:**
- **Chất lượng hình ảnh/animation:** ChatGPT và PO chấm theo thang 1–5 cho từng mục V1–V8, dựa trên **cùng một video quay 60 giây** của mỗi bản ở cùng kịch bản. Tiêu chí lấy từ Art Brief §3, §5, §9.
- **Thời gian phát triển:** Claude ghi **số giờ làm thực tế** cho từng bản ở `poc/DEVLOG.md`, tách theo hạng mục: dựng scene, animation, VFX, nameplate, sửa lỗi.
- **Khả năng mở rộng:** số dòng code và số file phải sửa để **thêm 1 tier trang phục mới** và **thêm 1 hiệu ứng mới**. Đo bằng diff thật trên mỗi bản.
- **Khả năng AI bảo trì:** đếm số lần Claude phải dùng editor trực quan (Godot editor) so với chỉ sửa file text. Ghi trong DEVLOG.

## 5. PoC-2 — Runtime và hiệu năng

### 5.1 Ma trận đo

| Cấu hình | Cách đưa vào OBS | Số nhân vật |
|---|---|---|
| A. Phaser 4 (Web) | Browser Source 1080×1920, 30 fps | 40 / 60 / 80 |
| B. Godot 4 (Web export) | Browser Source 1080×1920, 30 fps | 40 / 60 / 80 |
| C. Godot 4 (exe native) | Window Capture. Game render nội bộ 1080×1920, cửa sổ hiển thị thu nhỏ vừa màn hình; ghi rõ độ phân giải capture thực tế | 40 / 60 / 80 |

- Mỗi ô chạy **10 phút** ở kịch bản "bình thường" (đột phá thưa).
- Thêm **1 lần "bão đột phá"** (10 đột phá trong 30 giây) ở mức 60 nhân vật.
- Tổng: 3 cấu hình × (3 + 1) = **12 lần chạy, khoảng 2,5 giờ máy**. PO có thể chia làm nhiều buổi.
- **Ghi chú về Godot Web:** sẽ dùng chế độ xuất Web không cần đa luồng, để chạy trong Browser Source mà không cần header đặc biệt. Nếu chế độ này không chạy được trong OBS, mình sẽ ghi rõ kèm ảnh lỗi. **Đó cũng là một kết quả.**

### 5.2 Chỉ số và cách đo

| Chỉ số | Công cụ (miễn phí, có sẵn) |
|---|---|
| FPS, frame time p50/p95/p99, số khung > 50 ms (giật) | Logger trong game ghi frame time từng khung, gửi về script đo local hoặc ghi file. Script tự tính phân vị |
| Khung OBS bị rớt do render/encode | Cửa sổ **Stats** của OBS: chụp màn hình đầu và cuối mỗi lần chạy |
| CPU %, RAM theo tiến trình (OBS, trình duyệt/Godot, Node) | `typeperf` của Windows, chạy tự động bằng file `.bat`, ghi CSV mỗi 1 giây |
| Cấu hình máy | `dxdiag /t` và `systeminfo` ghi ra file text |
| Điều kiện kiểm thử | Phiên bản OBS, độ phân giải và fps output, encoder, các ứng dụng đang mở, nguồn điện (cắm sạc hay pin) |

### 5.3 Ngưỡng đạt (mỗi cấu hình, mỗi mức nhân vật)

| Chỉ số | Ngưỡng |
|---|---|
| FPS trung bình | ≥ 30 |
| Frame time p95 | ≤ 40 ms |
| Khung > 50 ms | ≤ 0,5% tổng số khung |
| Khung OBS bị rớt (render + encode) | < 1% |
| CPU tổng trung bình | < 70% |
| RAM tăng trong 10 phút | < 10% (không rò rỉ) |
| Bão đột phá (60 nhân vật) | FPS không xuống dưới 25 quá 1 giây liên tục |

### 5.4 Gói đo cho PO

Claude chuẩn bị thư mục `poc/measure/` gồm:
- `1_setup.bat`: kiểm tra và hướng dẫn cài Node.js LTS, OBS (đều miễn phí). Không cài gì khác.
- `2_run.bat`: chọn cấu hình và số nhân vật, tự bật game và bộ ghi CPU/RAM, đếm 10 phút, tự dừng.
- `3_collect.bat`: gom log, CSV, file cấu hình máy vào một file `.zip` để PO gửi lại.
- `HUONG_DAN.md`: từng bước kèm ảnh, gồm cả cách thêm Browser Source và Window Capture trong OBS.

PO chỉ cần làm theo hướng dẫn và gửi file `.zip`. Claude phân tích và ghi vào `POC_RESULTS.md`.

## 6. PoC-3 — Game core và dữ liệu

### 6.1 Thành phần dựng

- `SimulationAdapter`: sinh sự kiện `join`, `comment`, `like`, `gift` theo kịch bản cấu hình được. Có chế độ phát lại file JSONL.
- `Ingest`: chuẩn hóa → chống trùng → tính phần tăng của gift streak → gộp like → rate limit theo người và toàn cục → hàng đợi có trần.
- `GameCore`: tick cố định (mặc định 5 giây); presence theo "tham gia tích cực" (cấu hình N phút); cộng tu vi và linh khí; đột phá khi đủ ngưỡng (**giá trị cân bằng là giả, chỉ để test**).
- `Store`: SQLite chế độ WAL. Các bảng `players`, `ledger` (`ref_event_id` UNIQUE), `progression`, `sessions`.

### 6.2 Kịch bản mô phỏng (mặc định, chỉnh được)

| Kịch bản | Thông số |
|---|---|
| S1 Bình thường | 1.000 người chơi trong DB; 300 hoạt động cùng lúc; mỗi người 1–3 comment/phút; like 0–20/phút/người; quà 1%/phút/người; chạy 30 phút (thời gian mô phỏng tăng tốc) |
| S2 Spam | 20 người chơi gửi 60 comment/phút và like liên tục |
| S3 Bão like | 1.000 like/giây trong 60 giây |
| S4 Trùng lặp | Mỗi sự kiện bị gửi lại 1–3 lần ngẫu nhiên; gift streak gửi tổng cộng dồn |
| S5 Crash | Kill process ngẫu nhiên 10 lần trong S1, khởi động lại |

### 6.3 Ngưỡng đạt

| Chỉ số | Ngưỡng |
|---|---|
| Bản ghi ledger trùng `ref_event_id` | 0 |
| Tổng tu vi trong DB = tổng tính độc lập từ file sự kiện (S1, S4) | Khớp 100% |
| Linh khí từ một người spam (S2) | Không vượt trần cấu hình |
| Bão like (S3) | Không treo; hàng đợi không vượt trần; độ trễ xử lý p95 ≤ 1 giây; CPU tiến trình Node < 50% (đo trên PC của PO) |
| Dữ liệu mất mỗi lần crash (S5) | ≤ 1 tick |
| Khôi phục từ file sao lưu sang thư mục khác | Thành công, dữ liệu khớp |
| Test tự động (Vitest) | Chạy được bằng 1 lệnh; kết quả lưu trong `poc/core/test-results/` |

### 6.4 Phân biệt mô phỏng và thực tế

Mọi kết quả PoC-3 được gắn nhãn **"MÔ PHỎNG"**. PoC-3 chứng minh **logic xử lý** đúng với tải giả định. **Không** chứng minh được:
- tần suất và độ đầy đủ sự kiện TikTok gửi thật (ví dụ like bị TikTok gộp hoặc bỏ, join không đủ);
- độ ổn định của connector;
- độ trễ mạng thật.

Những điểm này chỉ trả lời được bằng **PoC-LIVE**, đang hoãn chờ PO cho phép.

## 7. Quy tắc ra quyết định cuối (Phaser 4 hay Godot 4)

1. **Loại** engine nào trượt ngưỡng hiệu năng ở **60 nhân vật** trong cấu hình Browser Source (A hoặc B). Riêng Godot được xét thêm cấu hình C (native) **nếu PO chấp nhận dùng Window Capture**.
2. Nếu cả hai đạt hiệu năng, so điểm hình ảnh và animation (PoC-1):
   - Godot hơn Phaser **≥ 0,5 điểm trung bình** (thang 5) → đề xuất Godot.
   - Ngược lại → giữ Phaser, vì Phaser có lợi thế đã chấm ở C-001 (một ngôn ngữ, AI bảo trì, tích hợp LIVE).
3. Số giờ phát triển và chỉ số mở rộng dùng làm **căn cứ phụ** khi điểm hình ảnh chênh nhau dưới 0,5.
4. Kết luận ghi ở `POC_RESULTS.md`, kèm bảng số liệu, đường dẫn log và video. **PO là người khóa D-005.**

## 8. Bằng chứng và cách báo cáo

- Mỗi con số trong `POC_RESULTS.md` phải trỏ tới **file log, CSV, ảnh chụp hoặc video** trong `poc/evidence/`.
- Không ghi "đạt" khi chưa chạy. Bài nào chưa chạy ghi **"chưa đo"**.
- Số liệu đo trên máy cloud của Claude (Linux, không GPU) **chỉ dùng để kiểm tra logic**, không dùng để kết luận hiệu năng.
- **Không commit** dữ liệu cá nhân hay thông tin máy nhạy cảm. Tên máy và tên người dùng Windows được xóa khỏi log trước khi commit.

## 9. Lịch dự kiến và phụ thuộc

| Bước | Việc | Ai | Ước tính |
|---|---|---|---|
| 1 | Asset SVG + Phaser scene (PoC-1A) | Claude | 1–2 ngày làm việc |
| 2 | Godot scene với cùng asset (PoC-1B) | Claude | 1–2 ngày làm việc |
| 3 | Game core + mô phỏng + test (PoC-3) | Claude | 1–2 ngày làm việc |
| 4 | Gói đo `poc/measure/` | Claude | 0,5 ngày |
| 5 | Chạy 12 lần đo + quay video 60 giây mỗi bản | **PO** | 2,5–3 giờ máy, chia nhiều buổi |
| 6 | Chấm hình ảnh | **ChatGPT + PO** | — |
| 7 | Phân tích, viết `POC_RESULTS.md`, đề xuất cuối | Claude | 0,5 ngày |

**Phụ thuộc:** bước 5 cần PC Windows của PO (dự kiến có OBS và Node.js). Cấu hình máy chưa có; sẽ được ghi tự động bởi gói đo.

## 10. Việc ngoài phạm vi PoC

- Console vận hành đầy đủ, BXH, UI hoàn chỉnh, âm thanh, cân bằng kinh tế thật.
- Kết nối TikTok thật (PoC-LIVE).
- Art cuối, nhiều cảnh, nhiều loại nhân vật.
