# SS-18 — Dữ liệu, lưu trữ và khôi phục

## 1. Mục tiêu
Mọi tiến trình người chơi (Tu Vi, cảnh giới, vật phẩm, linh thạch, chức vụ, cosmetic, lịch sử thưởng) phải còn nguyên sau khi tắt đột ngột, và mọi thay đổi có thể truy vết. Người chơi không bao giờ mất tiến trình do lỗi hệ thống.

## 2. Nguồn quy tắc
- **CONFIRMED (checkpoint):** Tu Vi không reset bắt buộc trong bất kỳ mùa nào; cosmetic đã sở hữu và tài khoản không bị xóa (SS-16 mục 2, FEATURE_SPEC §11).
- **CONFIRMED (checkpoint, population):** nhân vật không bao giờ bị xóa; BOT được trả quyền sở hữu khi người chơi trở lại (SS-01).
- **CONFIRMED (D-008):** không phát sinh chi phí lưu trữ bên thứ ba cho MVP.
- **TUNABLE:** lưu cục bộ bằng SQLite; khôi phục từ điểm lưu gần nhất (nền tảng đã có trong code, xem `00_PROJECT/CODE_READINESS_AUDIT.md`).

## 3. Dữ liệu phải được lưu
| Nhóm | Dữ liệu | Ghi chú |
|---|---|---|
| Nhân vật | Tu Vi tích lũy, Linh Căn, cảnh giới, thời điểm đạt cảnh giới | Tu Vi không giảm trừ khi có lý do được ghi trong nhật ký |
| Sở hữu | Vật phẩm, linh thạch, đan dược, cosmetic | Không có trang bị, không có pháp bảo (checkpoint) |
| Xã hội | Chức vụ, tông môn, lịch sử khiêu chiến | Chức vụ là trạng thái hiện tại; lịch sử là nhật ký |
| Thưởng | Sổ thưởng (ledger) cho Boss, Top 10, quà, sự kiện | Mỗi khoản thưởng có mã duy nhất để chống nhận trùng |
| Vận hành | Nhật ký thao tác GM, số điều chỉnh cấu hình | Chuỗi băm, không sửa lịch sử |

## 4. Quy tắc
1. **Không xóa nhân vật.** Nhân vật không online và không có BOT thì chuyển sang trạng thái nghỉ, không bị xóa (SS-01).
2. **Không reset Tu Vi** mà không có sự đồng ý của người chơi và quyết định PO đã ghi nhật ký (SS-16 mục 5).
3. **Ghi theo giao dịch.** Mỗi thay đổi về tiến trình và phần thưởng được ghi trong một giao dịch; giao dịch hoặc được ghi đầy đủ hoặc không ghi gì.
4. **Chống nhận trùng.** Mỗi sự kiện đầu vào (quà, like, lệnh) có mã duy nhất; cùng mã không được áp dụng hai lần.
5. **Khôi phục tất định.** Sau khi tắt đột ngột, trạng thái khôi phục phải cho kết quả giống hệt lần chạy không bị tắt, với cùng chuỗi sự kiện và cùng số ngẫu nhiên đã lưu.
6. **Sao lưu nóng.** Có thể sao lưu trong lúc chạy mà không dừng game.
7. **Lưu tối thiểu thay đổi.** Chỉ ghi nhân vật đã thay đổi, để giữ tốc độ khi đông người chơi.

## 5. Trường hợp biên
| Tình huống | Xử lý |
|---|---|
| Tắt đột ngột giữa lúc đang ghi | Giao dịch chưa hoàn tất bị bỏ; khôi phục về điểm lưu gần nhất |
| Sự kiện trùng mã khi khôi phục | Bỏ qua, không áp dụng lần thứ hai |
| Tệp dữ liệu bị hỏng | Dừng ghi, báo operator, không tự ghi đè bản sao lưu |
| Nâng cấp schema | Có bước di chuyển dữ liệu có thể đảo ngược; không xóa cột cũ trước khi kiểm chứng |
| Dữ liệu cấu hình cũ (số trong config) | Nhật ký ghi phiên bản cấu hình đang áp dụng cho từng thay đổi |

## 6. Ngoài phạm vi MVP
- Đồng bộ đa máy chủ, đám mây, sao lưu tự động lên bên thứ ba: **OPEN-44** (đề xuất: để sau khi có quyết định hạ tầng; MVP chạy cục bộ).
- Xuất dữ liệu người chơi theo yêu cầu quyền riêng tư: **OPEN-45** (cần PO và quy định áp dụng).

## 7. Nghiệm thu
- Tắt đột ngột ở 20 thời điểm khác nhau, khôi phục cho kết quả khớp bản không tắt.
- Không có khoản thưởng nào được ghi hai lần khi gửi lại cùng sự kiện.
- Không có nhân vật nào bị xóa khi người chơi rời đi.
- Mọi thay đổi Tu Vi có nguồn trong nhật ký.

## 8. Nhãn
- CONFIRMED: mục 2 (checkpoint, D-008), mục 4.1, 4.2.
- TUNABLE: mục 2 (SQLite cục bộ), mục 4.3–4.7, mục 5.
- OPEN: OPEN-44 (hạ tầng nhiều máy chủ), OPEN-45 (xuất dữ liệu cá nhân).
