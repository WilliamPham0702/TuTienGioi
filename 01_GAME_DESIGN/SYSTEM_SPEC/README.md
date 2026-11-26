# System Specs — TuTienGioi

Mục đích: đặc tả đủ cụ thể để triển khai và kiểm thử. Mỗi spec dùng cùng cấu trúc: Mục tiêu, Quy tắc, Công thức, Trường hợp biên, Nhãn, Nghiệm thu.

Đọc trước: `../GDD_MASTER.md` (nhãn, thẩm quyền, sổ OPEN) và `../GAME_FLOW_MASTER.md`.

Nguyên tắc chung cho mọi spec:
- Không biến đề xuất thành quyết định. Số liệu TUNABLE phải đọc được từ cấu hình để chỉnh sau mô phỏng.
- Mọi phần thưởng phải cố định, biết trước, có nhật ký (ledger) và chống nhận trùng.
- Mọi hệ thống có Local Simulation Mode (không phụ thuộc connector TikTok thật).
- Không phát sinh chi phí (D-008).
- Không có trang bị và pháp bảo (checkpoint).

| Mã | Spec | Nội dung | Trạng thái |
|---|---|---|---|
| SS-01 | `SS-01_population_offline_bot.md` | Dân số tối thiểu 50, BOT offline, trả quyền | CONFIRMED + OPEN |
| SS-02 | `SS-02_cultivation_realm.md` | Linh Căn, Tu Vi, cảnh giới, đột phá, đan dược | CONFIRMED + OPEN |
| SS-03 | `SS-03_boss.md` | Boss L1–L7, rơi đồ, phần thưởng | CONFIRMED + OPEN |
| SS-04 | `SS-04_top10_leaderboard.md` | Top 10 hàng giờ, quỹ, chia thưởng, Thiên Bảng | CONFIRMED + OPEN |
| SS-05 | `SS-05_gift_reward_routing.md` | Quà, định tuyến thưởng, kho chung | CONFIRMED + OPEN |
| SS-06 | `SS-06_world_events.md` | Sự kiện thế giới, Linh Khí Triều, cơ duyên | TUNABLE + OPEN |
| SS-07 | `SS-07_camera_queue.md` | Hàng đợi camera, ưu tiên, thời lượng | CONFIRMED |
| SS-08 | `SS-08_combat_challenge.md` | Chiến Lực, khiêu chiến, Trợ Chiến, công thức chiến đấu | CONFIRMED + TUNABLE + OPEN |
| SS-09 | `SS-09_economy_items.md` | Vật phẩm, linh thạch, sink, phân loại túi | CONFIRMED + OPEN |
| SS-10 | `SS-10_trading_safeguards.md` | Giao dịch người chơi và chống gian lận | CONFIRMED + TUNABLE |
| SS-11 | `SS-11_npc_quest.md` | NPC, nhiệm vụ, chức vụ do NPC giữ | TUNABLE + OPEN |
| SS-12 | `SS-12_guild_sect_roles.md` | Tông môn, chức vụ, host, guild | CONFIRMED + OPEN |
| SS-13 | `SS-13_bot_ai.md` | Hành vi BOT (người chơi và lấp chỗ) | TUNABLE + OPEN |
| SS-14 | `SS-14_live_ui.md` | Giao diện LIVE, bảng, tên, kiểm duyệt | CONFIRMED + TUNABLE |
| SS-15 | `SS-15_anti_spam_live_edge.md` | Chống spam, điều kiện LIVE, reconnect, AFK | CONFIRMED + TUNABLE + OPEN |
| SS-16 | `SS-16_post_tien_canh.md` | Hậu Tiên Cảnh và Phase 2+ | OPEN |
| SS-17 | `SS-17_notification_narration.md` | Hàng đợi thông báo, TTS, tường thuật AI | CONFIRMED + TUNABLE |
| SS-18 | `SS-18_data_persistence_recovery.md` | Dữ liệu cần lưu, không xóa nhân vật, khôi phục tất định | CONFIRMED + TUNABLE + OPEN |

Sổ OPEN đầy đủ: `../GDD_MASTER.md`, Phụ lục A.

Audit tình trạng sẵn sàng code và roadmap: `../../00_PROJECT/CODE_READINESS_AUDIT.md`.
