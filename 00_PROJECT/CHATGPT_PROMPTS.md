# Prompt giao việc cho ChatGPT (v0.1, 2026-11-25)

Cách dùng: PO copy từng prompt dán vào ChatGPT. Nếu ChatGPT chưa nối GitHub, dán kèm nội dung các file được nhắc.
Repo: WilliamPham0702/TuTienGioi — các tài liệu mới nằm ở nhánh `docs/game-flow-v0.1` (PR #3) cho đến khi PO merge.

---

## G-002 — Cập nhật GDD v0.3
```
Bạn là Product Design Lead của dự án TuTienGioi (game TikTok LIVE tu tiên).
Đọc repo WilliamPham0702/TuTienGioi, nhánh docs/game-flow-v0.1: 01_GAME_DESIGN/GAME_FLOW_v0.1.md, 00_PROJECT/DECISION_LOG.md (D-009..D-018), 01_GAME_DESIGN/GDD_v0.1.md, 09_SIMULATION/SIM_REPORT_v0.1.md.
Nhiệm vụ G-002: viết GDD v0.3 khớp hoàn toàn với GAME_FLOW và D-009..D-018. Lưu ý: GDD mục 6.3 đã được Claude sửa theo lệnh PO (D-010, D-018); mục 9 phải đổi thành "khiêu chiến + chức vụ thuộc MVP" (D-012); mục 3 thêm Thái Thượng Tông Chủ (D-015).
Không đổi quyết định đã duyệt. Mọi con số chưa duyệt ghi "đề xuất".
Đầu ra: (1) GDD v0.3 hoàn chỉnh, (2) danh sách thay đổi so với v0.2, (3) câu hỏi còn mở cho PO.
```

## G-003 — Đặc tả tính năng mở rộng
```
Dự án TuTienGioi (repo WilliamPham0702/TuTienGioi, đọc GAME_FLOW_v0.1.md, DECISION_LOG.md, SIM_REPORT_v0.1.md).
Mục tiêu kinh doanh (D-018): quà tặng là nguồn doanh thu chính; phần thưởng từ quà luôn cố định, biết trước, KHÔNG có phần thưởng ngẫu nhiên trả tiền.
Nhiệm vụ G-003: viết đặc tả cho:
- MVP: Linh Khí Triều (cả phòng thả đủ X tim → ×2 Tu Vi 3 phút), Thiên Bảng (Tu Vi / Chiến Lực / Bế Quan / Cúng Phụng, Cúng Phụng reset mỗi phiên), Tâm Ma (đột phá thất bại → người xem thả tim trợ đạo để thử lại ngay), Đạo Hiệu & Danh Hiệu, Cửa sổ Trợ Chiến (đã có ở GAME_FLOW 11.1, chỉ bổ sung UX).
- Giai đoạn 2: Yêu Thú Công Sơn, Bí Cảnh, Sư Đồ, Điểm Danh Bế Quan, Tông Môn Đại Bỉ, nội dung cuối game cho người chơi đã chạm trần (SIM_REPORT phát hiện 3).
Mỗi tính năng: mục tiêu (giữ chân / ra tiền), điều kiện kích hoạt, luồng trên màn hình 9:16, phần thưởng, chống spam, tương tác (tim / quà / lệnh bình luận), nhu cầu hình ảnh & âm thanh, rủi ro chính sách TikTok.
Ràng buộc: chi phí thêm 0đ; chạy được ở chế độ mô phỏng local. Con số ghi "đề xuất".
```

## G-004 — Lời thoại hệ thống
```
Nhiệm vụ G-004 cho TuTienGioi (đọc GAME_FLOW_v0.1.md mục 12).
Viết bộ câu thông báo giọng "Thiên Đạo / Hệ Thống xuyên không", tiếng Việt, mỗi câu đọc to không quá 6 giây, dùng biến {ten}, {linh_can}, {canh_gioi}, {vat_pham}, {chuc_vu}, {so_luong}.
Sự kiện: người mới vào; nhắc đo linh căn; kết quả 7 bậc linh căn (Tạp, Tứ, Tam, Song, Nhất phẩm, Thiên, Dị); lên tiểu cảnh; lên đại cảnh; Thiên Kiếp; Tâm Ma; đột phá thất bại / thành công; cơ duyên theo độ hiếm; khiêu chiến bắt đầu / Trợ Chiến mở / thắng / thua; nhận chức vụ; Thái Thượng Tông Chủ lên ngôi; Linh Khí Triều; lên Thiên Bảng; cảm ơn quà theo bậc.
Mỗi sự kiện 3–5 biến thể. Đánh dấu câu nào đọc to, câu nào chỉ hiện chữ, câu cố định nên thu âm sẵn (không có tên người chơi).
Đầu ra dạng bảng: mã sự kiện | ưu tiên | đọc/chữ | biến thể.
```

## G-005 — Quy cách hình ảnh
```
Nhiệm vụ G-005 cho TuTienGioi (đọc 02_ART_DIRECTION/ART_DIRECTION_BRIEF_v0.1.md, GDD, GAME_FLOW_v0.1.md, 08_TECHNICAL/TECHNICAL_ARCHITECTURE_LIVE_ADDENDUM.md mục 6).
Phong cách đã duyệt: chibi tiên hiệp 2D/2.5D, khung dọc 1080×1920, hiển thị rõ tối đa ~60 nhân vật.
Cần: (1) bố cục màn hình 9:16: đại điện, ghế Thái Thượng Tông Chủ / Tông Chủ / Trưởng Phái / Trưởng Lão, Đá Đo Linh Căn, khu khiêu chiến + thanh Trợ Chiến, khung thông báo/chat tự vẽ (dòng đỏ), Thiên Bảng; (2) nhân vật chibi module tách lớp (thân, mặt, tóc, áo, phụ kiện, vũ khí); (3) 10 bộ trang phục + màu hào quang theo cảnh giới; (4) hiệu ứng 4 tầng (tiểu cảnh, đại cảnh, Thiên Kiếp, Thiên Phạt) + 7 màu linh căn + Tâm Ma + Trợ Chiến; (5) danh sách hình P0 tối thiểu, ghi kích thước px, định dạng PNG trong suốt / spritesheet, tên file.
Ràng buộc: chữ đọc được trên màn hình điện thoại; chỉ dùng hình tự tạo hoặc giấy phép miễn phí dùng thương mại; không dùng nhân vật có bản quyền.
```

## G-006 — Tạo bộ hình P0
```
Dựa trên quy cách G-005 đã được PO duyệt, tạo bộ hình P0 cho TuTienGioi bằng công cụ tạo ảnh trong gói ChatGPT hiện có (không phát sinh chi phí).
Ưu tiên: 1 nền đại điện 1080×1920, 1 nhân vật chibi gốc tách lớp + 3 biến thể tóc/áo, 3 bộ trang phục đầu (Luyện Khí, Trúc Cơ, Kim Đan), Đá Đo Linh Căn, khung thông báo.
Giữ cùng một phong cách và bảng màu giữa các hình. Ghi rõ hình nào cần Claude cắt lớp/ghép spritesheet. Xác nhận điều khoản sử dụng thương mại của ảnh tạo ra.
```
