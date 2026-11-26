# GDD Sync Completion Report — Checkpoint 2026-11-26

| Trường | Giá trị |
|---|---|
| Issue | WilliamPham0702/TuTienGioi#40 |
| Ngày | 2026-11-27 |
| Nhánh | `docs/gdd-sync-2026-11-27` (từ `main` @ 10ed8c4) |
| Phạm vi | Chỉ tài liệu. Không đổi code, engine, stack, connector, simulator, AI Agency |
| Trạng thái PR | Draft, không merge |

## 1. Tài liệu đã tạo

| File | Nội dung |
|---|---|
| `01_GAME_DESIGN/GDD_MASTER.md` | GDD hiện hành, mục 0–22, phụ lục A (OPEN-01 đến OPEN-43), phụ lục B (tham chiếu), mục 0.3 (quyết định bị thay thế), mục 21 (nội dung đã loại) |
| `01_GAME_DESIGN/GAME_FLOW_MASTER.md` | Luồng trải nghiệm, mục 0 và A–N, bảng liên kết spec |
| `01_GAME_DESIGN/SYSTEM_SPEC/README.md` | Chỉ mục SS-01 đến SS-17 với nhãn CONFIRMED/TUNABLE/OPEN |
| `01_GAME_DESIGN/SYSTEM_SPEC/SS-01_population_offline_bot.md` | Dân số, filler, BOT sở hữu |
| `SS-02_cultivation_realm.md` | Tu Vi, Linh Căn, ngưỡng cảnh giới, đan dược |
| `SS-03_boss.md` | Boss L1–L7, thưởng, rơi đồ |
| `SS-04_top10_leaderboard.md` | Top 10 theo giờ, chia quỹ |
| `SS-05_gift_reward_routing.md` | Định tuyến quà, bậc quà |
| `SS-06_world_events.md` | Sự kiện thế giới |
| `SS-07_camera_queue.md` | Ưu tiên camera, hàng đợi |
| `SS-08_combat_challenge.md` | Chiến Lực, khiêu chiến, Trợ Chiến |
| `SS-09_economy_items.md` | Kinh tế, linh thạch, vật phẩm |
| `SS-10_trading_safeguards.md` | Giao dịch và chống gian lận |
| `SS-11_npc_quest.md` | NPC và nhiệm vụ |
| `SS-12_guild_sect_roles.md` | Tông môn, chức vụ |
| `SS-13_bot_ai.md` | AI BOT (trong game, không phải AI Agency) |
| `SS-14_live_ui.md` | Giao diện LIVE |
| `SS-15_anti_spam_live_edge.md` | Chống spam, biên LIVE |
| `SS-16_post_tien_canh.md` | Hậu Tiên Cảnh |
| `SS-17_notification_narration.md` | Thông báo, TTS, tường thuật |
| `00_PROJECT/GDD_CONFLICT_REPORT.md` | Xung đột giữa tài liệu cũ và checkpoint, C-01 đến C-56 |
| `00_PROJECT/GDD_SYNC_COMPLETION_REPORT.md` | Báo cáo này |

## 2. Tài liệu đã sửa

| File | Thay đổi |
|---|---|
| `00_PROJECT/DECISION_LOG.md` | Chỉ thêm, không xóa. Thêm ghi chú làm rõ dưới đoạn "Clarification" (C-43), bảng D-021 đến D-030 từ checkpoint, bảng trạng thái 2026-11-27 (D-011 và D-020 SUPERSEDED; D-014 và D-017 một phần) |
| `01_GAME_DESIGN/GDD_v0.1.md`, `GDD_v0.3.md`, `GAME_FLOW_v0.1.md`, `FEATURE_SPEC_v0.1.md` | Thêm khối ghi chú LỊCH SỬ ở đầu file. Nội dung cũ giữ nguyên |
| `README.md` | Thêm mục con trỏ đến GDD_MASTER và GDD_CONFLICT_REPORT. Không đổi trạng thái dự án (C-27, OPEN-43) |
| `00_PROJECT/PROJECT_BRIEF.md` | Thêm mục con trỏ đến GDD_MASTER và SYSTEM_SPEC |

Không xóa file nào. Không đổi trạng thái repo sang ARCHIVED.

## 3. Đối chiếu checkpoint với spec

| Mục checkpoint | Nơi áp dụng | Trạng thái |
|---|---|---|
| Dân số tối thiểu 50 nhân vật, tính người chơi thật và BOT sở hữu | SS-01 | CONFIRMED |
| Filler không bị xóa, chỉ bù phần thiếu | SS-01 mục 4 | CONFIRMED; OPEN-09 |
| 7 bậc Linh Căn và hệ số | SS-02 mục 3 | CONFIRMED |
| Tu Vi cơ bản 1/giây × hệ số | SS-02 mục 2 | CONFIRMED |
| Tim/like = 5 × hệ số | SS-02 mục 4 | CONFIRMED |
| 10 ngưỡng tích lũy đến Tiên Cảnh | SS-02 mục 5 | CONFIRMED |
| Đột phá tự động, không thất bại | SS-02 mục 6 | CONFIRMED |
| Đan dược Tụ Khí đến Hóa Thần | SS-02 mục 7 | CONFIRMED |
| Tiểu cảnh | SS-02 | OPEN-02 |
| Boss L1–L7 và trọng số | SS-03 mục 2 | CONFIRMED |
| Boss L4–L7 despawn sau 5 phút | SS-03 | CONFIRMED; OPEN-06 |
| Công thức thưởng Boss | SS-03 mục 4 | CONFIRMED |
| Bảng rơi và chất lượng vật phẩm | SS-03 mục 5 | CONFIRMED |
| Hiếm ×10% | SS-03 | OPEN-03 |
| Top 10: xếp hạng và tỉ lệ 25/18/14/11/9/7/6/4/3/3 | SS-04 | CONFIRMED |
| Quỹ 20% rơi thật, 80% thưởng thường | SS-04 | OPEN-05 |
| Giá trị vật phẩm Phàm đến Thần | SS-04 | CONFIRMED |
| Chu kỳ theo giờ | SS-04 | TUNABLE |
| Bốn tab bảng xếp hạng | SS-04 | OPEN-28 |
| Quà về kho chung khi người gửi không LIVE | SS-05 | CONFIRMED |
| Chia đều cho người online, phần dư ngẫu nhiên | SS-05 | CONFIRMED |
| Bậc quà và ngưỡng xu | SS-05 | OPEN-10 |
| Quà cộng Chiến Lực không giới hạn (D-010) | SS-05, SS-08 | CONFIRMED (PO duyệt); OPEN-31 |
| Sự kiện thế giới | SS-06 | CONFIRMED/TUNABLE; OPEN-12, OPEN-24, OPEN-34 |
| Thứ tự ưu tiên camera | SS-07 mục 2 | CONFIRMED |
| Thời lượng camera 3/5/8/12/15 giây, Boss động | SS-07 | CONFIRMED |
| Boss chặn hàng đợi | SS-07 mục 6 | OPEN-37 |
| Khiêu chiến và đổi chức vụ trong camera | SS-07 mục 8 | OPEN-38 |
| Chiến Lực, ±10%, bên bị khiêu chiến thắng khi hòa | SS-08 | CONFIRMED (±10%, D-016); làm tròn khi hòa TUNABLE, OPEN-14 |
| Trợ Chiến 30 giây | SS-08 | CONFIRMED |
| Không trang bị, không pháp bảo | SS-08, SS-09, GDD_MASTER mục 21 | CONFIRMED |
| Linh thạch không tự luyện thành Tu Vi (D-028) | SS-09 | CONFIRMED |
| Sink linh thạch | SS-09 mục 5.2 | OPEN-17 |
| Giao dịch trong ranh giới | SS-10 | CONFIRMED; OPEN-18 |
| Chống spam, giới hạn tương tác | SS-15 | TUNABLE |
| Bình luận có thưởng | SS-15 | OPEN-39 |
| Tiên Cảnh và hậu Tiên Cảnh | SS-16 | CONFIRMED (tu luyện tiếp); OPEN-16, OPEN-17 |
| Tâm Ma | GDD_MASTER mục 21, SS-06 mục 8 | SUPERSEDED |
| Thông báo và TTS | SS-17 | CONFIRMED (phân mức); OPEN-40 |
| Tên "Chân Tiên" đổi thành "Tiên Cảnh" | GDD_MASTER, SS-02 | CONFIRMED; tài sản art OPEN-29 |

## 4. Quyết định PO đã ghi vào DECISION_LOG

Chỉ thêm D-021 đến D-030 từ checkpoint. Không ghi quyết định mới ngoài checkpoint. Các chỗ cần PO chốt đều để OPEN.

## 5. Mục OPEN

Danh sách đầy đủ, kèm đề xuất mặc định, nằm ở `GDD_MASTER.md` phụ lục A (OPEN-01 đến OPEN-43). Các mục quan trọng nhất trước khi triển khai:

- OPEN-01, OPEN-02: tên trạng thái trước Luyện Khí và tiểu cảnh.
- OPEN-03: nghĩa của "hiếm ×10%".
- OPEN-05: cách hiểu "quỹ" 20% trong Top 10.
- OPEN-10: bảng quà và ngưỡng xu (phải lấy từ danh mục TikTok thật).
- OPEN-16, OPEN-17: hậu Tiên Cảnh và sink kinh tế.
- OPEN-31: quà cộng Chiến Lực không giới hạn có thể gây pay-to-win.
- OPEN-37: Boss chặn hàng đợi camera.
- OPEN-40: chất lượng TTS tiếng Việt chưa được kiểm chứng.
- OPEN-43: trạng thái ARCHIVED trong README (giữ nguyên, PO quyết cách ghi).

## 6. Mục TUNABLE chính

Đề xuất để mô phỏng, chưa phải quyết định: Linh Khí Triều (×2 trong 3 phút), chu kỳ Top 10 theo giờ, giới hạn 60 tương tác/phút/người, heartbeat 45 giây, grace 60 giây, làm tròn Chiến Lực khi hòa, đề xuất sân camera Boss chia đoạn, tiêu chí phân mức thông báo, số câu TTS mỗi 3–4 giây.

## 7. Kiểm tra (validation)

| Kiểm tra | Kết quả |
|---|---|
| Liên kết markdown tương đối trong GDD_MASTER, GAME_FLOW_MASTER, SYSTEM_SPEC và GDD_CONFLICT_REPORT | Đạt, không có liên kết hỏng |
| Mã OPEN được định nghĩa trong phụ lục A và được tham chiếu trong các spec | Đạt, OPEN-01 đến OPEN-43 khớp hai chiều, không trùng |
| Chân Tiên xuất hiện ngoài dòng SUPERSEDED hoặc ghi chú đổi tên | Đạt, chỉ còn trong dòng đổi tên và OPEN-29 |
| Trang bị và pháp bảo xuất hiện như nội dung được duyệt | Đạt, chỉ còn trong dòng cấm (SS-09 mục 7, SS-17) |
| Mã xung đột C-27 và C-43 khớp với tham chiếu trong GDD_MASTER và DECISION_LOG | Đạt |
| Không có file code, config, engine hoặc connector bị sửa | Đạt, `git diff --stat` chỉ có file tài liệu |
| Không có thông tin đăng nhập TikTok, cookie hoặc token | Đạt |

Lưu ý: kiểm tra trên là kiểm tra tự động bằng grep và đối chiếu thủ công. Chưa có bước đọc toàn văn từng spec bởi người review, nên PO nên đọc GDD_MASTER trước khi merge.

## 8. Việc để lại ngoài phạm vi (FLAG)

- `packages/core/src/config.ts` còn số liệu cũ (C-54). Cần task code riêng.
- `09_SIMULATION/` dựa trên số cũ (C-55). Chạy lại sau khi chốt OPEN-01, OPEN-05, OPEN-17.
- Art, content và technical docs còn Tâm Ma, vũ khí, Chân Tiên (C-52, C-53).
- Workflow AI còn nhắc Copilot (C-51, OPEN-36).
- `AI_HANDOFF.md` đọc GDD_v0.1 (C-50).

## 9. Kết luận

GDD đã đồng bộ với checkpoint 2026-11-26 ở cấp tài liệu. Các điểm checkpoint chưa xác định được giữ ở trạng thái OPEN với đề xuất mặc định TUNABLE, không được coi là đã duyệt. PR ở trạng thái Draft và chờ PO xác nhận trước khi merge.
