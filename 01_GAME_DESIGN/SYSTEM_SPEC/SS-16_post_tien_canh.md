# SS-16 — Hậu Tiên Cảnh và giai đoạn sau MVP

## 1. Vấn đề
Checkpoint (CONFIRMED): sau khi đạt Tiên Cảnh, người chơi tiếp tục tu luyện với một hệ thống tiến trình hậu Tiên Cảnh. Chi tiết **chưa được thiết kế** (OPEN-16).

Mô phỏng v0.1 (`09_SIMULATION/SIM_REPORT_v0.1.md`) cảnh báo nhóm chi tiêu cao có thể tiến gần trần trong vài tháng với các giả định cũ. Số liệu đó không còn áp dụng trực tiếp, nhưng cảnh báo về sink và endgame vẫn còn giá trị (OPEN-17).

## 2. Ràng buộc đã biết
- **CONFIRMED:** tu luyện tiếp sau Tiên Cảnh (checkpoint).
- **CONFIRMED:** Tu Vi không bị reset bắt buộc trong bất kỳ mùa nào (FEATURE_SPEC §11).
- **CONFIRMED:** không có trang bị, không có pháp bảo, nên không có "vũ khí cấp cao" làm lối thoát.
- **CONFIRMED:** tài khoản và cosmetic đã sở hữu không bị xóa.
- **TUNABLE:** Phi Thăng/Tiên Giới và mùa giải không nằm trong MVP.

## 3. Phương án (chọn một, PO quyết)

### Phương án A — Tu Vi tiếp tục, cột mốc thẩm mỹ (đề xuất)
- Tu Vi tiếp tục tích lũy không giới hạn, dùng cho Top 10 và Thiên Bảng.
- Cột mốc "Tiên Cảnh tầng N" (mốc Tu Vi đều nhau) mở khóa **danh hiệu và hiệu ứng thẩm mỹ**, không mở khóa chỉ số.
- Ưu điểm: không cần định nghĩa chỉ số mới, không tạo cạnh tranh sức mạnh vô hạn.
- Nhược điểm: không có mục tiêu chiến đấu dài hạn. Cần Phương án B để giữ người chơi lâu.

### Phương án B — Mùa Phi Thăng (Phase 2+)
- Mỗi mùa, các chỉ số cạnh tranh (Chiến Lực, Thiên Bảng) reset theo quy tắc công khai.
- Giữ lại danh hiệu, cosmetic và lịch sử (FEATURE_SPEC §11).
- Không reset Tu Vi bắt buộc.

### Phương án C — Tiên Giới (endgame content)
- Khu vực hoặc nội dung mới sau Tiên Cảnh.
- Chi phí cao nhất trong ba phương án, để sau.

**Đề xuất (TUNABLE):** A làm nền trong MVP, B là Phase 2+. C không làm sớm.

## 4. Sink bắt buộc trước khi mở kinh tế (OPEN-17)
Bất kể phương án, cần có ít nhất một sink linh thạch (SS-09 mục 5.2) trước khi cho người chơi Tiên Cảnh tích lũy không giới hạn.

## 5. Không được làm
- Mở khóa chỉ số bằng tiền thật hoặc quà không có giới hạn trong hậu Tiên Cảnh (D-010 không áp cho việc mua chỉ số ngoài Chiến Lực khiêu chiến).
- Reset Tu Vi người chơi mà không có sự đồng ý.
- Xóa cosmetic đã sở hữu.

## 6. Trình diễn
- Tiên Cảnh có camera 15 giây (SS-07).
- Mốc hậu Tiên Cảnh (Phương án A) là sự kiện nhỏ hoặc vừa, không là đột phá.

## 7. Nghiệm thu (khi triển khai)
- Người chơi đạt Tiên Cảnh vẫn tiếp tục nhận Tu Vi.
- Không có chỉ số nào tăng vô hạn mà không có sink.
- Mốc thẩm mỹ mở đúng theo ngưỡng đã công bố.

## 8. Nhãn
- CONFIRMED: mục 2.
- TUNABLE: mục 3 (đề xuất), mục 6, mục 7.
- OPEN: OPEN-16 (chọn phương án), OPEN-17 (sink).
