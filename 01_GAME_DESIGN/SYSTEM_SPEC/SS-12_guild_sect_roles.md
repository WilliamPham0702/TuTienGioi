# SS-12 — Tông môn, chức vụ, host và guild

## 1. Mục tiêu
Một tông môn có thứ bậc rõ ràng. Người chơi tranh chức vụ công bằng, chức vụ được lưu qua phiên, và có cơ chế cộng đồng (guild) mà không tạo lợi thế trả tiền không cân bằng được.

## 2. Thứ bậc (CONFIRMED về tên, TUNABLE về số)

| Chức vụ | Số ghế | Cổng cảnh giới khiêu chiến | Khiêu chiến được? |
|---|---:|---|---|
| Thái Thượng Tông Chủ | 1 (host) | — | Không (CONFIRMED, D-015) |
| Tông Chủ | 1 | Hóa Thần | Có |
| Trưởng Phái | 2 | Nguyên Anh | Có |
| Trưởng Lão | 4 | Kim Đan | Có |
| Đệ tử | Không giới hạn | Trúc Cơ (khiêu chiến người chơi khác) | Có (người chơi khác) |

- Số ghế và cổng cảnh giới: TUNABLE (theo GAME_FLOW_v0.1 §9, không có trong checkpoint).
- Chấp Sự: vai trò vận hành, không giữ chức vụ có khiêu chiến (SS-11).

## 3. Host và Thái Thượng (CONFIRMED, D-015)
- Host mặc định là Tông Chủ hiện tại (theo chữ "host").
- Khi người chơi giành ghế Tông Chủ, host chuyển lên Thái Thượng Tông Chủ, ngồi vị trí cao hơn, không bị khiêu chiến.
- Người chơi giữ Tông Chủ cho đến khi bị đánh bại (TUNABLE: chưa có cơ chế tự nhường).

**Câu hỏi mở (thuộc OPEN-19):** host là nhân vật của ai khi chưa có người chơi giành Tông Chủ? Mặc định (TUNABLE): NPC Host (SS-11).

## 4. Guild (OPEN-19)

Checkpoint: "Guilds/groups are supported for community play." Không có cấu trúc.

**Phương án mặc định (TUNABLE):**
- Guild do người chơi tạo, có tên đã qua kiểm duyệt (SS-14).
- Số thành viên tối đa: 20 (TUNABLE).
- Vai trò trong guild: Bang chủ (một người) và Thành viên. Không có vai trò tranh giành chức vụ tông môn.
- Mời thành viên cần chấp nhận rõ ràng từ người được mời.
- Rời guild được phép bất cứ lúc nào, không phạt.
- Phí tạo guild bằng linh thạch (sink, SS-09).

**Không được làm (đề xuất):**
- Guild không cấp chỉ số chiến đấu, không cấp Tu Vi hay vật phẩm để tránh tạo lợi thế trả tiền không cân bằng được.
- Guild không tự động chiếm ghế tông môn.
- Không cho phép tạo guild bằng tài khoản phụ để gom chỗ (chống sybil): giới hạn theo định danh.

## 5. Quan hệ với chức vụ
- Một người chơi giữ tối đa **một** ghế (TUNABLE). Nếu giành ghế cao hơn, ghế cũ được giải phóng.
- Chức vụ, người giữ ghế và Chiến Lực được lưu qua phiên (CONFIRMED).
- Khi người giữ chức rời LIVE, đối thủ đấu với hồ sơ đã lưu (SS-08 mục 3.2).
- Danh hiệu chức vụ (ví dụ "Trấn Điện Trưởng Lão") là danh hiệu riêng, không gộp với chức vụ (FEATURE_SPEC §4).

## 6. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Người giữ Tông Chủ bị đánh bại | Ghế về người thắng; người cũ thành Trưởng Phái hoặc Trưởng Lão theo cảnh giới (TUNABLE, cần chốt) hoặc về Đệ tử |
| Guild đang có bang chủ rời | Chuyển bang chủ cho thành viên lâu nhất (TUNABLE) |
| Hai người mời vào guild cùng lúc vượt số | Chấp nhận theo thứ tự, người sau nhận thông báo đầy |
| Tài khoản phụ gom guild | Giới hạn theo định danh (chống sybil) |

## 7. Nghiệm thu
- Thái Thượng Tông Chủ không nhận được lệnh khiêu chiến.
- Người chơi giành Tông Chủ → host chuyển lên Thái Thượng.
- Chức vụ giữ được qua phiên mới.
- Guild không tạo ra chỉ số hay vật phẩm.
- Giới hạn thành viên không bị vượt.

## 8. Nhãn
- CONFIRMED: mục 2 (tên chức vụ), mục 3 (D-015), mục 5 (lưu qua phiên).
- TUNABLE: số ghế và cổng, mục 4 (phương án guild), mục 5 (một ghế), mục 6.
- OPEN: OPEN-19 (guild đầy đủ), chuyển ghế khi bị đánh bại (người cũ về đâu).
