# SS-14 — Giao diện LIVE, nhãn tên và kiểm duyệt

## 1. Mục tiêu
Người xem trên điện thoại đọc được tên, cảnh giới và sự kiện mà không bị che khuất gameplay. Mọi thông tin hiển thị đã được kiểm duyệt.

## 2. Nền tảng (CONFIRMED)
- Bố cục dọc 9:16, thiết kế 1080×1920 (D-005, OBS Browser Source).
- Tiếng Việt mặc định. Đa ngôn ngữ có thể thêm sau (checkpoint).
- Phải dễ đọc khi thu nhỏ trên màn hình điện thoại.

## 3. Vùng bố cục (TUNABLE)

| Vùng | Nội dung | Ghi chú |
|---|---|---|
| Trên | Tên đại điện, sự kiện hiện tại, đồng hồ Linh Khí Triều | Không quá cao, tránh vùng TikTok giao diện |
| Giữa | Đại điện, Tông Chủ, nhân vật | Gameplay chính |
| Phải hoặc trên phải | Thiên Bảng thu gọn (top 3–5) | Mở spotlight khi có sự kiện |
| Dưới | Hàng thông báo ngắn, Trợ Chiến | Không che nhân vật |
| Vùng an toàn | Viền 5% mỗi cạnh | Không đặt chữ quan trọng sát mép |

## 4. Nhãn nhân vật (TUNABLE)
- Tên hiển thị (đã kiểm duyệt).
- Cảnh giới (tên ngắn).
- Thanh tiến độ nhỏ (không cần số chính xác).
- Đạo hiệu (nếu có, tối đa một) và tối đa hai huy hiệu nhỏ.
- Không hiển thị định danh nội bộ, không hiển thị dữ liệu nhạy cảm.

## 5. Đám đông và ưu tiên hiển thị (TUNABLE)
- Lưu và tính tất cả người chơi đủ điều kiện, dù chỉ render một tập con.
- Ưu tiên render: đang có sự kiện, chức vụ, cảnh giới cao, vừa đột phá.
- Đông người: gom thành nhóm, không vẽ hàng trăm nhãn chồng nhau.
- Hiệu ứng nhỏ chạy dưới dạng icon hoặc particle ngắn (VISUAL_SPEC).

## 6. Kiểm duyệt tên (OPEN-23, khung TUNABLE)

**Quy tắc:**
1. Chuẩn hóa Unicode và bỏ ký tự điều khiển, khoảng trắng thừa.
2. Giới hạn độ dài hiển thị (ví dụ 16 ký tự, TUNABLE).
3. Lọc từ ngữ xấu theo danh sách tiếng Việt và biến thể viết tắt, viết lệch (TUNABLE).
4. Tên vi phạm: hiển thị tên thay thế do hệ thống cấp, ví dụ "Đạo hữu #xxxx" (TUNABLE). Tên vi phạm không được đọc bằng TTS.
5. Chặn tên giả mạo vai trò hệ thống, NPC, hoặc Tông Chủ.
6. Tên trùng lặp không ảnh hưởng định danh (định danh không phải tên).
7. Operator có quyền ẩn tên và ghi audit log.

Đây là khung. Danh sách từ và quy trình kháng nghị cần thiết kế riêng (OPEN-23).

## 7. Ngôn ngữ và văn bản (CONFIRMED)
- Tiếng Việt mặc định.
- Mọi chuỗi hiển thị dùng khóa để dễ thêm ngôn ngữ sau.
- Dấu tiếng Việt phải hiển thị đúng trên OBS (kiểm tra font, xem VISUAL_SPEC).

## 8. Bảng xếp hạng (TUNABLE)
- Thiên Bảng thu gọn, chuyển tab theo chu kỳ chậm hoặc theo operator.
- Top 1 có viền riêng nhưng không quá chói.
- Cúng Phụng có nhãn "phiên này".
- Không đọc toàn bảng bằng TTS.
- Không nhấp nháy liên tục.

## 9. Điều khiển của operator (CONFIRMED, từ Project Brief)
- Tạm dừng nhận sự kiện.
- Kiểm duyệt (ẩn tên, gỡ thông báo).
- Theo dõi sự kiện, hàng đợi và lỗi.
- Khôi phục sau lỗi.
- Mọi thao tác có audit log.

## 10. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Tên dài hoặc toàn ký tự đặc biệt | Cắt theo giới hạn sau chuẩn hóa; nếu không đọc được thì dùng tên thay thế |
| Quá nhiều hiệu ứng cùng lúc | Gộp theo SS-07 mục 5, giảm độ phức tạp |
| Một nhân vật bị che bởi hiệu ứng lớn | Hiệu ứng lớn phải đi kèm mờ nền hoặc đẩy lên để giữ tên |
| Font không đủ dấu | Không cho phát hành. Kiểm tra trước khi LIVE |

## 11. Nghiệm thu
- Với 60 nhân vật trên màn hình, không có chữ quan trọng nào bị che.
- Trên điện thoại, cảnh giới và tên đọc được ở kích thước nhỏ.
- Tên vi phạm không xuất hiện trên màn hình và không được đọc.
- Operator tạm dừng nhận sự kiện, và sự kiện mới không vào hàng đợi.
- Không có chữ tiếng Việt nào hiển thị sai dấu.

## 12. Nhãn
- CONFIRMED: mục 2, mục 7, mục 9.
- TUNABLE: mục 3, 4, 5, 8, 10, 11.
- OPEN: OPEN-23 (kiểm duyệt đầy đủ).
