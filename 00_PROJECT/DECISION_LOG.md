# Decision Log — TuTienGioi

Record only decisions explicitly approved by the Product Owner. Proposals must not be treated as final decisions.

| ID | Topic | Decision / status | Owner | Date |
|---|---|---|---|---|
| D-001 | Project repository | Repository is `WilliamPham0702/TuTienGioi` | Product Owner | 2026-11-24 |
| D-002 | Product concept | Interactive TikTok LIVE cultivation game; viewers are cultivators in a sect grand hall | Product Owner | 2026-11-24 |
| D-003 | Progression fantasy | Watch time contributes cultivation; likes may contribute spiritual energy; gifts may map to pills/items, subject to platform rules | Product Owner | 2026-11-24 |
| D-004 | Visual progression | Higher realms should produce more impressive effects and better outfits | Product Owner | 2026-11-24 |
| D-005 | Technical stack | **Locked (C-002 PoC result, approved by Product Owner 2026-11-25):** Phaser 4 + TypeScript (game client); Node.js + TypeScript (game core & LIVE bridge); SQLite running locally on the PC; OBS Browser Source, 9:16, design resolution 1080×1920. Godot 4 not selected. Basis: both engines passed the 60-character performance run; no video-based image score was recorded, so the Godot-by-0.5-point rule was not met. Proposal: `08_TECHNICAL/TECHNICAL_ARCHITECTURE_PROPOSAL.md` (PR #2). | Product Owner | 2026-11-25 (locked)
| D-006 | Visual style and rendering | Approved direction: attractive chibi xianxia characters; beautiful, atmospheric sect environments; polished effects; prioritize fast delivery and reliable LIVE operation. Prefer a 2D/2.5D production approach as the starting hypothesis. Do not assume full 3D. | Product Owner | 2026-11-24 |
| D-007 | LIVE integration method | **Approved direction:** adapter-based architecture with a Local Simulation Mode for development and testing independent of TikTok. Specific TikTok connector **not approved**: no unofficial connector may be used on a real account without explicit Product Owner permission; no TikTok passwords, cookies, or session tokens may be requested or stored. | Product Owner | 2026-11-24 (direction); connector pending |
| D-008 | Budget constraint | 0 VND additional project spend. No paid APIs, subscriptions, cloud hosting, VPS, paid plugins, paid assets, or services that can incur charges without explicit prior approval. Prefer local execution and free/open-source tools. Existing computer, internet, electricity, and current AI subscriptions are outside this project-spend constraint. | Product Owner | 2026-11-24 |
| D-009 | Linh căn | Linh căn được đo ngẫu nhiên 1 lần mỗi phiên LIVE và đo lại ở phiên sau; Tu Vi, cảnh giới, vật phẩm, chức vụ được lưu qua các phiên. Xem `01_GAME_DESIGN/GAME_FLOW_v0.1.md` mục 3. | Product Owner | 2026-11-25 |
| D-010 | Quà tặng và Chiến Lực | Tu Vi/vật phẩm có được từ quà tặng tính vào Chiến Lực khiêu chiến, không giới hạn. Rủi ro pay-to-win đã được nêu và PO chấp nhận. GDD mục 6.3 cần cập nhật. Bảng quy đổi quà vẫn chờ D-007 và chính sách TikTok. | Product Owner | 2026-11-25 |
| D-011 | Đột phá | Đột phá có thể thất bại nhưng không bị phạt (không mất Tu Vi); chờ hồi rồi thử lại. Tỉ lệ cụ thể chờ duyệt. | Product Owner | 2026-11-25 |
| D-012 | Khiêu chiến và chức vụ | Khiêu chiến người chơi và giành chức Trưởng Lão / Trưởng Phái / Tông Chủ nằm trong MVP (thay cho ghi chú "phạm vi sau" ở GDD mục 9). Phụ thuộc D-007 để đọc bình luận lệnh; có chế độ mô phỏng local. | Product Owner | 2026-11-25 |
| D-013 | Nhân vật | Nhân vật chibi được phân ngẫu nhiên và cố định theo người chơi; không cho đổi nhân vật. | Product Owner | 2026-11-25 |
| D-014 | Linh thạch | Linh thạch (từ tim, quà) tự động luyện hóa thành Tu Vi; không dùng làm tiền mua đan dược. | Product Owner | 2026-11-25 |
| D-015 | Host và ghế Tông chủ | Khi người chơi giành ghế Tông chủ, nhân vật host trở thành Thái Thượng Tông Chủ, không thể bị khiêu chiến. | Product Owner | 2026-11-25 |
| D-016 | Khiêu chiến | Chiến Lực mỗi bên được nhân ngẫu nhiên ±10% mỗi trận; bằng nhau thì bên bị khiêu chiến thắng. | Product Owner | 2026-11-25 |
| D-017 | Con số kinh tế | Bảng linh căn, Tu Vi/giây, quy đổi linh thạch, thang cảnh giới, tỉ lệ cơ duyên trong GAME_FLOW_v0.1 được dùng tạm; chỉnh sau mô phỏng và cần PO duyệt lại trước khi khóa. | Product Owner | 2026-11-25 |
| D-018 | Mục tiêu doanh thu | Quà tặng TikTok là nguồn doanh thu chính; thiết kế game khuyến khích tặng quà (vd. Cửa sổ Trợ Chiến 30 giây trong khiêu chiến). Phần thưởng từ quà phải cố định, biết trước; không có phần thưởng ngẫu nhiên trả tiền. Thay dòng "gifts must not be mandatory" ở GDD 6.3. | Product Owner | 2026-11-25 |
| D-019 | C-002 proof of concept | **Authorized:** PoC-1 visual & animation (same hall scene in Phaser 4 and Godot 4, same assets, ~60 chibi characters); PoC-2 runtime & performance in OBS Browser Source 1080×1920 at 40/60/80 characters, 30 FPS target; PoC-3 game core & data with a local simulation adapter (500–1,000 simulated players, dedup, spam limits, SQLite persistence and recovery). 0 VND; no paid tools/assets/services; no real TikTok connector; no full product build; no merge to main or deploy without explicit approval. PoC assets: original vector chibi drawn by Claude. Godot measured both as Web export (Browser Source) and native exe (Window Capture). Performance runs executed by the Product Owner on their Windows PC using a prepared measurement kit. | Product Owner | 2026-11-24 |
| D-020 | Tu Vi lên cấp | Giảm 50% Tu Vi mỗi tiểu cảnh của cả 9 Đại Cảnh (Luyện Khí 300 … Độ Kiếp 1.500.000; xem `packages/core/src/config.ts` và GAME_FLOW §7). Tỉ lệ đột phá giữ nguyên. Công cụ GM để chỉnh tỉ lệ sẽ bàn sau. | Product Owner | 2026-11-25 |

## Change-control rule
Before changing an approved product decision, record the proposed change, rationale, impact, and obtain Product Owner approval.

## Clarification
D-006 is the approved art direction. 2D/2.5D is the preferred starting hypothesis, not a locked engine or implementation decision. Technical stack and LIVE integration remain open.

> Ghi chú 2026-11-27 (GDD sync, Issue #40): đoạn trên là bản gốc, giữ nguyên lịch sử. Theo D-005 (đã khóa 2026-11-25), stack kỹ thuật **đã được khóa**; chỉ tích hợp LIVE (D-007) còn mở. Xem `00_PROJECT/GDD_CONFLICT_REPORT.md`, mục C-43.

## Checkpoint decisions (2026-11-26) — bổ sung ngày 2026-11-27

Các quyết định dưới đây nằm trong `00_PROJECT/TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md` (được PO xác nhận trong snapshot 2026-11-26) nhưng trước đó chưa có dòng riêng trong bảng trên. Chỉ bổ sung để đối chiếu, không thay đổi nội dung checkpoint.

| ID | Topic | Decision / status | Owner | Date |
|---|---|---|---|---|
| D-021 | Dân số và BOT offline | Giữ tối thiểu 50 nhân vật (người chơi thật + BOT sở hữu), không trần, không xóa để ép 50. Người chơi offline chuyển sang BOT và giữ nguyên tiến trình; quay lại thì trả quyền điều khiển. BOT lấp chỗ chỉ spawn khi thiếu. Chi tiết: `GDD_DECISION_OFFLINE_BOT_POPULATION.md`, `SYSTEM_SPEC/SS-01`. | Product Owner | 2026-11-26 |
| D-022 | Linh Căn và tu luyện | 7 bậc Linh Căn với trọng số 35/25/18/12/6/3/1% và hệ số ×1/×2/×3/×4/×5/×6/×10. Tu Vi gốc 1/giây khi LIVE × hệ số. Tim/like hợp lệ 5 × hệ số. Chi tiết: `SYSTEM_SPEC/SS-02`. | Product Owner | 2026-11-26 |
| D-023 | Đột phá, cảnh giới và đan dược | Đột phá tự động, có thể nhiều lần liên tiếp, không thất bại, không mất Tu Vi. Ngưỡng Tu Vi tích lũy: 1.200 / 6.000 / 24.000 / 72.000 / 180.000 / 420.000 / 900.000 / 1.800.000 / 3.600.000 / 7.200.000 (kết thúc bằng Tiên Cảnh). Đan dược cộng Tu Vi cố định, tự nhận, không giới hạn, không cooldown. Thay thế D-011 và D-020. | Product Owner | 2026-11-26 |
| D-024 | Boss | L1–L7 với trọng số 40/25/15/10/6/3/1%. Một Boss tại một thời điểm. L4–L7 despawn sau 5 phút. Thưởng Tu Vi = tỉ lệ sát thương × hệ số Linh Căn × 10.000 × cấp Boss. Số vật phẩm rơi và trọng số phẩm chất theo checkpoint. Chi tiết: `SYSTEM_SPEC/SS-03`. | Product Owner | 2026-11-26 |
| D-025 | Top 10 hàng giờ | Xếp hạng theo cảnh giới rồi Tu Vi tích lũy; chỉ người đang LIVE khi chốt. Chia 25/18/14/11/9/7/6/4/3/3%. Quỹ 20% vật phẩm Boss rơi thật, 80% thưởng Boss thông thường. Phần dư chia cho hạng đủ điều kiện, không nợ, không chuyển sang chu kỳ sau. Chi tiết: `SYSTEM_SPEC/SS-04`. | Product Owner | 2026-11-26 |
| D-026 | Quà và kho chung | Người gửi không LIVE → kho chung, không tự tạo nhân vật. Kho chung chia đều cho người online; phần dư ngẫu nhiên. Quà cho người có nhân vật thì nâng cấp nhân vật. Quà đặc biệt có thể kích hoạt sự kiện thế giới. Bảng quy đổi quà chưa có. Chi tiết: `SYSTEM_SPEC/SS-05`. | Product Owner | 2026-11-26 |
| D-027 | Sự kiện thế giới và camera | Sự kiện ngẫu nhiên và do người chơi kích hoạt; mọi người đủ điều kiện có thể tham gia; sự kiện không xung đột có thể chạy song song. Camera ưu tiên: Boss đang đánh > Độ Kiếp > Tiên Cảnh > Đột phá > Nhận vật phẩm > Sự kiện nhỏ; không ngắt focus; FIFO trong cùng ưu tiên; không bỏ sự kiện; thời lượng 3/5/8/12/15 giây và Boss theo trận. Chi tiết: `SYSTEM_SPEC/SS-06`, `SS-07`. | Product Owner | 2026-11-26 |
| D-028 | Vật phẩm, linh thạch và giao dịch | Không trang bị, không pháp bảo. Túi không giới hạn, tự phân loại. Boss item vào túi tự động. Linh thạch hỗ trợ kinh tế, giao dịch, tính năng và nâng cấp; không tự động luyện thành Tu Vi (thay phần tự luyện hóa của D-014). Giao dịch người chơi được bật trong ranh giới chống gian lận; được chuyển linh thạch. Chi tiết: `SYSTEM_SPEC/SS-09`, `SS-10`. | Product Owner | 2026-11-26 |
| D-029 | LIVE interactions và reconnect | Like/comment có hệ thống quy đổi riêng, có chống spam và chống farm. Reconnect lưu trạng thái ngay và khôi phục đúng. Tiếng Việt mặc định; kiểm duyệt nội dung; đa ngôn ngữ có thể thêm sau. Tường thuật AI bám sự kiện thật. Chi tiết: `SYSTEM_SPEC/SS-14`, `SS-15`, `SS-17`. | Product Owner | 2026-11-26 |
| D-030 | Đội AI | Đội AI gồm ChatGPT và Claude. Copilot không thuộc workflow dự án. Các tài liệu workflow cũ vẫn nhắc Copilot, xử lý ở OPEN-36. | Product Owner | 2026-11-26 |

## Status update — 2026-11-27 (GDD sync)

Các dòng gốc ở bảng trên **không bị sửa**. Bảng dưới ghi trạng thái mới theo checkpoint 2026-11-26, theo quy tắc: mâu thuẫn được ghi rõ, áp checkpoint mới nhất, không sửa âm thầm.

| ID gốc | Trạng thái | Thay thế bởi | Ghi chú |
|---|---|---|---|
| D-011 (đột phá có thể thất bại) | SUPERSEDED | D-023 | Checkpoint: đột phá tự động, không thất bại. Tâm Ma (liên quan) cũng SUPERSEDED. |
| D-014 (linh thạch tự luyện thành Tu Vi) | SUPERSEDED (phần tự luyện hóa) | D-028 | Phần "không dùng linh thạch mua đan dược" **không bị checkpoint thay thế**, vẫn giữ trong SS-09 mục 4.3, chờ PO xác nhận (OPEN-17). |
| D-017 (con số kinh tế dùng tạm) | SUPERSEDED (phần số liệu linh căn, thang cảnh giới, tu vi/giây) | D-022, D-023 | Các số khác (quy đổi linh thạch, tỉ lệ cơ duyên) vẫn TUNABLE. |
| D-020 (giảm 50% Tu Vi mỗi tiểu cảnh) | SUPERSEDED | D-023 | Ngưỡng mới là Tu Vi tích lũy theo checkpoint. Tiểu cảnh chưa có quy định (OPEN-02). |
| D-009, D-010, D-012, D-013, D-015, D-016, D-018 | Còn hiệu lực | — | Checkpoint không mâu thuẫn. D-016 có OPEN-14 về cách làm tròn khi hòa. |
| D-003 | Còn hiệu lực | — | "Likes contribute spiritual energy" nay là Tu Vi trực tiếp (D-022). |

Mục OPEN liên quan đến các quyết định trên: xem `01_GAME_DESIGN/GDD_MASTER.md`, Phụ lục A.
