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
