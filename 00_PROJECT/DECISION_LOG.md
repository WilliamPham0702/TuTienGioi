# Decision Log — TuTienGioi

Record only decisions explicitly approved by the Product Owner. Proposals must not be treated as final decisions.

| ID | Topic | Decision / status | Owner | Date |
|---|---|---|---|---|
| D-001 | Project repository | Repository is `WilliamPham0702/TuTienGioi` | Product Owner | 2026-11-24 |
| D-002 | Product concept | Interactive TikTok LIVE cultivation game; viewers are cultivators in a sect grand hall | Product Owner | 2026-11-24 |
| D-003 | Progression fantasy | Watch time contributes cultivation; likes may contribute spiritual energy; gifts may map to pills/items, subject to platform rules | Product Owner | 2026-11-24 |
| D-004 | Visual progression | Higher realms should produce more impressive effects and better outfits | Product Owner | 2026-11-24 |
| D-005 | Technical stack | Not decided. Compare suitable free/local-first options after the visual and MVP scope are defined. | Product Owner / Tech Lead | Pending |
| D-006 | Visual style and rendering | Approved direction: attractive chibi xianxia characters; beautiful, atmospheric sect environments; polished effects; prioritize fast delivery and reliable LIVE operation. Prefer a 2D/2.5D production approach as the starting hypothesis. Do not assume full 3D. | Product Owner | 2026-11-24 |
| D-007 | LIVE integration method | Not decided; must verify supported and policy-compliant methods, with a local simulation fallback | Product Owner / Tech Lead | Pending |
| D-008 | Budget constraint | 0 VND additional project spend. No paid APIs, subscriptions, cloud hosting, VPS, paid plugins, paid assets, or services that can incur charges without explicit prior approval. Prefer local execution and free/open-source tools. Existing computer, internet, electricity, and current AI subscriptions are outside this project-spend constraint. | Product Owner | 2026-11-24 |
| D-009 | Linh căn | Linh căn được đo ngẫu nhiên 1 lần mỗi phiên LIVE và đo lại ở phiên sau; Tu Vi, cảnh giới, vật phẩm, chức vụ được lưu qua các phiên. Xem `01_GAME_DESIGN/GAME_FLOW_v0.1.md` mục 3. | Product Owner | 2026-11-25 |
| D-010 | Quà tặng và Chiến Lực | Tu Vi/vật phẩm có được từ quà tặng tính vào Chiến Lực khiêu chiến, không giới hạn. Rủi ro pay-to-win đã được nêu và PO chấp nhận. GDD mục 6.3 cần cập nhật. Bảng quy đổi quà vẫn chờ D-007 và chính sách TikTok. | Product Owner | 2026-11-25 |
| D-011 | Đột phá | Đột phá có thể thất bại nhưng không bị phạt (không mất Tu Vi); chờ hồi rồi thử lại. Tỉ lệ cụ thể chờ duyệt. | Product Owner | 2026-11-25 |
| D-012 | Khiêu chiến và chức vụ | Khiêu chiến người chơi và giành chức Trưởng Lão / Trưởng Phái / Tông Chủ nằm trong MVP (thay cho ghi chú "phạm vi sau" ở GDD mục 9). Phụ thuộc D-007 để đọc bình luận lệnh; có chế độ mô phỏng local. | Product Owner | 2026-11-25 |

## Change-control rule
Before changing an approved product decision, record the proposed change, rationale, impact, and obtain Product Owner approval.

## Clarification
D-006 is the approved art direction. 2D/2.5D is the preferred starting hypothesis, not a locked engine or implementation decision. Technical stack and LIVE integration remain open.
