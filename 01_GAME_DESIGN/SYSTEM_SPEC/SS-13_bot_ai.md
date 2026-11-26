# SS-13 — Hành vi BOT

## 1. Mục tiêu
BOT giữ thế giới sống động và đảm bảo nhân vật offline vẫn "đang tồn tại". BOT dùng cùng luật với người chơi, nhưng không được tạo lợi thế hay khai thác phần thưởng.

## 2. Hai loại BOT

| | BOT sở hữu (player-owned) | BOT lấp chỗ (filler) |
|---|---|---|
| Nguồn | Nhân vật của người chơi đang offline | Hệ thống tạo để đủ dân số (SS-01) |
| Danh tính | Đúng nhân vật người chơi | Không thuộc ai; có tên lấy từ danh sách tên đã kiểm duyệt (TUNABLE) |
| Tiến trình | Giữ nguyên | Không có, tạo mới |
| Logic chiến đấu | Giống người chơi | Hồ sơ hành vi riêng nhưng tuân thủ luật |
| Nhận thưởng Boss | OPEN-07 (mặc định: có, theo đóng góp) | Không |
| Nhận Top 10 | Không (chưa LIVE) | Không |
| Tu Vi theo thời gian | Không (không LIVE hợp lệ) | Không |
| Nhận quà | Có, khi người gửi là người đang LIVE và nhân vật tồn tại | Không |

## 3. Quy tắc chung (CONFIRMED)
- Người chơi thật và BOT sở hữu dùng cùng luật và cùng dữ liệu.
- BOT không được vượt luật (không được đọc thông tin ngoài nhân vật, không được tự tăng sát thương).
- Hành động được quyết định từ trạng thái và số ngẫu nhiên có seed để tái hiện khi debug (combat proposal).

## 4. Hành vi cơ bản (TUNABLE)
- **Di chuyển:** đi quanh đại điện theo vùng (gần khu vực đã gán, không trộn vào vùng Tông Chủ).
- **Tu luyện (hình ảnh):** ngồi thiền ở vị trí, không cộng Tu Vi khi không LIVE hợp lệ.
- **Chiến đấu:** khi Boss xuất hiện, BOT đủ điều kiện tự tham gia theo khoảng cách và trạng thái.
- **Trạng thái bị hạ:** hồi phục, quay lại trận tự động (SS-03).
- **Khi chưa có trận:** giữ nhịp hoạt động nhẹ để thế giới không đứng im.

## 5. Chọn mục tiêu và kỹ năng (combat proposal, TUNABLE)
- Ưu tiên Boss nếu đủ điều kiện, nếu không thì mục tiêu trong trận.
- Đánh thường là mặc định. Kỹ năng được chọn theo hồi chiêu, điều kiện và giá trị chiến thuật.
- Không dùng kỹ năng nếu chưa có cảnh báo tương ứng từ Boss (đối với đòn đặc biệt).

## 6. BOT lấp chỗ và đóng góp (TUNABLE, bảo vệ phần thưởng người chơi)
- Sát thương của filler **không tính vào mẫu số** đóng góp của Boss (SS-03 mục 4.2). Nếu không, filler sẽ làm loãng phần thưởng người chơi.
- Filler vẫn có mặt trong trận để trình diễn, nhưng không nhận Tu Vi, không nhận vật phẩm.
- Filler không được tham gia khiêu chiến và không được chiếm ghế (SS-08).
- Hồ sơ hành vi của filler khác với người chơi (ví dụ ít kỹ năng phức tạp hơn) để không tạo ảo giác người thật.

## 7. Linh Căn của BOT sở hữu (TUNABLE)
- BOT sở hữu dùng Linh Căn của **phiên gần nhất** của người chơi.
- Dùng cho Boss (hệ số) và Chiến Lực (qua Tu Vi đã lưu). Không roll mới khi offline.
- Khi người chơi quay lại và roll Linh Căn mới, roll mới áp dụng từ đó.

## 8. Ngân sách hiệu năng (OPEN)
Checkpoint không quy định số BOT tối đa hiển thị. Project Brief nêu "maximum simultaneous visible characters" là câu hỏi mở. Cần PoC đo số nhân vật thật trên OBS (D-019). Đề xuất (TUNABLE): render tối đa N nhân vật nổi bật, phần còn lại gom thành đám đông. Tất cả vẫn được lưu và tính.

## 9. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| BOT sở hữu bị hạ và chưa kịp hồi | Quay lại trận khi hồi xong, không tính đóng góp trong lúc hồi |
| Người chơi quay lại đúng lúc BOT đang ra đòn | Hoàn tất hoặc hủy đòn an toàn; không cộng sát thương dở (SS-01 mục 5) |
| Filler spawn quá nhiều trong một khu | Phân tán vị trí; không ảnh hưởng luật |
| BOT đứng im do lỗi AI | Watchdog đưa về trạng thái nhàn rỗi và ghi log |

## 10. Nghiệm thu
- Hai người chơi cùng luật: cùng input → cùng kết quả khi seed giống nhau.
- Filler không nhận Tu Vi và không nhận vật phẩm Boss.
- Sát thương của filler không làm thay đổi tỉ lệ đóng góp của người chơi thật.
- BOT sở hữu không cộng Tu Vi theo thời gian khi offline.

## 11. Nhãn
- CONFIRMED: mục 2 (phân loại), mục 3.
- TUNABLE: mục 4, 5, 6, 7, 9, 10.
- OPEN: OPEN-07 (BOT có nhận Boss không), mục 8 (hiệu năng).
