# Thư viện hiệu ứng (VFX) — Phaser 4

Làm theo đặc tả đã duyệt: `02_ART_DIRECTION/VISUAL_SPEC_v0.1.md` §8, `01_GAME_DESIGN/GAME_FLOW_v0.1.md` §8, `02_ART_DIRECTION/CONCEPT_ART_REVIEW_BRIEF_v0.1.md` §3C (nhánh `chatgpt/g-002-g-005-design-specs`).

| Đặc tả | Hàm | Thời lượng | Thành phần |
|---|---|---|---|
| Tầng 1 – Tiểu Cảnh: vòng sáng ngắn, số Tu Vi bay lên | `minor()` | 1,3 s | vòng sáng dưới chân, lấp lánh, "+N Tu Vi", nhãn tiểu cảnh |
| Tầng 2 – Đại Cảnh: cột sáng, phù văn, linh khí xoáy, đổi trang phục | `major()` | 4,5 s | phù văn mở dưới chân + sau lưng, linh khí xoáy vào người, cột sáng, sóng xung kích, đổi áo, hào quang, banner |
| Tầng 3 – Thiên Kiếp: mây tụ, sét có hướng, pháp trận bảo hộ, rung nhẹ, không flash trắng toàn màn hình | `tribulation()` | 6,5–7,5 s | mây đen kéo vào, tối viền, pháp trận bát quái + màn chắn, 3 đạo sét có nhánh đánh vào pháp trận, rung 0,18 s, mây tan + tia sáng trời + đổi áo |
| Tầng 4 – Thiên Phạt → Chân Tiên: nhiều đợt, tiên quang | `ascension()` | ~13 s | 5 đạo sét, mây tan, cột tiên quang, vầng hào quang, hoa rơi khắp sân, banner |
| Linh Khí Triều: sóng sáng chạy qua các hàng đệ tử, hạt linh khí dày | `tide()` | theo cấu hình | banner + đồng hồ, sóng sáng mỗi 2,6 s, hạt linh khí |
| Tâm Ma: bóng sau nhân vật, viền tím, không che mặt | `heartDemon()` | 6 s | tối viền tím, bóng ma sau lưng (mắt đỏ tím), thanh Trợ Đạo |
| Trợ Chiến: linh quang/ấn ký bay vào phe đã chọn, màu + biểu tượng | `assist()` | 1,5 s | ấn ký bay theo đường cong có vệt, màu phe + mũi tên ◀ ▶ |
| Cơ duyên: thẻ hệ thống, tia sáng từ trên xuống | `fortune()` | 3 s | cột sáng xanh, thẻ "【 HỆ THỐNG 】" |
| Tu luyện thường: hào quang thở nhẹ | `aura()` | lặp | quầng sáng + vòng dưới chân |

**Quy tắc đã cài trong code:**
- `Director` chỉ chạy **một hiệu ứng lớn** tại một thời điểm, xếp hàng theo ưu tiên (Thiên Kiếp > Đại Cảnh/Tâm Ma/Triều > khác).
- Không có flash trắng toàn màn hình. Flash chỉ cục bộ, tối đa 1 lần mỗi 0,9 s để không nhấp nháy dày.
- Bloom chỉ áp cho lớp hiệu ứng (camera riêng). Tắt được bằng `?bloom=0` cho máy yếu.
- Toàn bộ texture hiệu ứng được vẽ bằng code (`textures.ts`, `lightning.ts`): 0 VNĐ, dùng được với bất kỳ bộ art nào. Khi có art VFX từ ChatGPT, chỉ cần thay texture.

**Xem thử:** `vfx.html` (`?ui=1` hiện nút bấm, `?fx=tribulation` lặp một hiệu ứng, `?hud=1` hiện FPS).
Nền và nhân vật trong lab là **placeholder**, sẽ thay bằng art của ChatGPT.
