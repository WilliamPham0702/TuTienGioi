# tiktok-probe — PoC-3: đo xem TikTok LIVE thực sự cho game những gì

**Chỉ đọc.** Không đăng nhập, không cookie, không gửi bình luận, không tặng quà. Chạy trên **máy của PO**, trong LIVE của chính PO.

## Cái này trả lời câu hỏi nào
Báo cáo `report.txt` trả lời T1–T6 trong `08_TECHNICAL/CORE_AND_SPEC_REVIEW_v0.1.md`: có sự kiện rời phòng không, có thấy người xem im lặng không, ID người xem có ổn định không, tim có đi kèm người gửi không, quà có giá trị kim cương và combo không, lệnh `!` có đến nguyên vẹn (kể cả dấu tiếng Việt) không, kết nối rớt bao nhiêu lần.

## Quyền riêng tư
- Không lưu tên hiển thị, không lưu nội dung bình luận. Chỉ lưu số đếm và **tên các trường dữ liệu**.
- ID người xem chỉ nằm trong bộ nhớ, băm bằng muối ngẫu nhiên mỗi lần chạy, không ghi ra file.
- Có test tự động kiểm tra điều này (`analyze.test.mjs`).

## Cách chạy (PO tự làm — Claude không làm thay được)
1. Cài Node 22 (đã dùng cho `packages/core`). Trong thư mục này: `npm install`
2. Thử không cần mạng: `node probe.mjs --dry-run` (dữ liệu **giả**, chỉ để thấy đường ống chạy).
3. Khởi động LIVE bình thường trên TikTok, rồi: `node probe.mjs ten_tai_khoan_cua_ban --minutes 30`
   - Nên nhờ vài người vào xem, thả tim, bình luận `!ung A`, tặng 1 quà nhỏ (hoặc combo) để có dữ liệu.
4. Gửi lại file `probe-out-.../report.txt` (và `report.json`) cho Claude.

## Khóa Euler Stream (không bắt buộc)
Không có khóa vẫn thử được nhưng có thể bị giới hạn. Nếu muốn: **PO tự tạo** tài khoản miễn phí tại Euler Stream, rồi đặt biến môi trường `EULER_API_KEY` (không ghi vào file, không đưa vào repo, không dán vào chat). Chỉ dùng gói miễn phí.

## Cảnh báo — PO cần đọc
- Đây **không phải API chính thức** của TikTok; thư viện `tiktok-live-connector` là kỹ thuật đảo ngược, có thể ngừng hoạt động bất cứ lúc nào.
- Giấy phép thư viện là **AGPL (xem trường license trong package của thư viện)**. Chưa xác minh được tác động nếu dùng cho sản phẩm thương mại/đóng — cần PO cân nhắc trước khi đưa vào game chính.
- **Điều khoản TikTok và chính sách kiếm tiền LIVE chưa được xác minh.** PO cần tự đọc trong ứng dụng trước khi triển khai thật.
- Công cụ này chưa từng được chạy với TikTok thật; kết quả đầu tiên có thể lộ lỗi trong chính công cụ.

## Kiểm thử
`node --test` (5 test, dữ liệu giả).
