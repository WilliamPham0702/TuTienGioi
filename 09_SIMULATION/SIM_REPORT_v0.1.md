# C-002 — Báo cáo mô phỏng kinh tế v0.1

> Chủ trì: Claude. Trạng thái: chờ PO đọc và quyết (D-017).
> Script: `09_SIMULATION/economy_sim.py` (Python 3, không cần thư viện ngoài).
> Lệnh đã chạy (25/11/2026): `python3 09_SIMULATION/economy_sim.py` với seed 1, 2, 3; thêm biến thể `--tv-per-ha-pham 3` và `--tv-per-ha-pham 3 --heart-cap 30`.

## Cảnh báo trước khi đọc
- Hành vi người xem trong script là **giả định do Claude đặt**, chưa có dữ liệu thật: mỗi ngày ~35% người quay lại, trung vị 8 phút xem mỗi phiên, 40% người có thả tim (trung bình 20 tim/phút), 5% có tặng quà (trung bình 30 xu/phiên), 0,5% là đại gia (trung bình 1.500 xu/phiên).
- Quy đổi quà **1 xu = 200 Tu Vi** là con số tạm của Claude để chạy thử, chưa ai duyệt.
- Kết quả dùng để **so sánh tương đối** và tìm chỗ lệch, không dùng để dự báo doanh thu.
- Kết quả giữa 3 seed chênh nhau ít, nên mô hình ổn định với chính các giả định của nó.

## Kết quả chính (1.000 người chơi, seed 1)

| Nhóm | Ngày 1 | Ngày 30 |
|---|---|---|
| Miễn phí (950) | 79% Luyện Khí, 20% Trúc Cơ | phần lớn Trúc Cơ–Kim Đan, ~12% Nguyên Anh, ~2% Hóa Thần |
| Có tặng quà (43) | phần lớn Trúc Cơ, vài người Kim Đan | Nguyên Anh–Hóa Thần |
| Đại gia (7) | Nguyên Anh–Hóa Thần | Hợp Thể–Đại Thừa |

Tỉ trọng nguồn Tu Vi của người chơi miễn phí: **~50% từ thời gian xem, ~50% từ tim**.

## Phát hiện

1. **Tim đang quá mạnh.** Với 1 Hạ Phẩm Linh Thạch = 10 Tu Vi, người thả tim đều tay nhận Tu Vi từ tim gấp khoảng 3 lần từ thời gian xem. Khi hạ xuống **3 Tu Vi**, tim còn khoảng 23% tổng Tu Vi của người miễn phí, còn thời gian xem trở lại là nguồn chính.
   - Nếu PO muốn đẩy tim (tim giúp TikTok đẩy phòng lên đề xuất) thì có thể giữ 10. Đổi lại, phần quà tặng sẽ có vẻ kém giá trị hơn so với tim miễn phí.
2. **Đại gia lên Hóa Thần ngay ngày đầu**, tức là có thể khiêu chiến ghế Tông chủ ngay phiên đầu tiên. Điều này hợp với D-018 (doanh thu): ghế Tông chủ sẽ là cuộc đua giữa các đại gia. Ghế Trưởng Lão (từ Kim Đan) thì người miễn phí cày lâu vẫn với tới được, nên các ghế tự phân tầng.
3. **Đại gia chạm trần sớm.** Từ đầu lên Chân Tiên cần 22.702.400 Tu Vi tích lũy, và trong mô phỏng đại gia có khoảng 4,4–6,1 triệu sau 30 ngày. Như vậy sau khoảng 3–5 tháng họ sẽ hết chỗ để tiêu tiền. Cần nội dung cuối game, ví dụ Phi Thăng, Tiên Giới hoặc reset theo mùa có phần thưởng danh hiệu. Chưa cần làm ở MVP nhưng nên tính trước.
4. **Ngày đầu:** khoảng 18–20% người miễn phí lên Trúc Cơ (mở khiêu chiến người chơi), nên ngay phiên đầu đã có đủ người để đánh nhau.
5. **Đột phá có thể thất bại (D-011).** Tỉ lệ thành công đề xuất cho 9 lần đột phá đại cảnh là 95%, 85%, 75%, 65%, 55%, 45%, 40%, 35%, 30%, chờ 60 giây rồi thử lại. Ở cảnh giới thấp, thất bại không làm chậm đáng kể.

## Đề xuất chỉnh (chờ PO duyệt)

| Thông số | Hiện tại | Đề xuất | Lý do |
|---|---|---|---|
| Tu Vi / Hạ Phẩm Linh Thạch (tim) | 10 | **3** | Để thời gian xem là nguồn chính, quà có giá trị hơn tim |
| Trần tim / người / phút | 60 | giữ 60 | Hạ xuống 30 chỉ đổi rất ít khi đã hạ quy đổi xuống 3 |
| Tỉ lệ đột phá | chưa có | như phát hiện 5 | Có kịch tính mà không làm nản |
| Quy đổi quà | chưa có | 1 xu = 200 Tu Vi (tạm) | Cần PO chọn mức "đắt/rẻ" mong muốn |
| Thang cảnh giới | như GAME_FLOW | giữ | Phân tầng ghế hợp lý; cần thêm nội dung cuối game sau MVP |

## Việc tiếp theo
- Khi có phiên LIVE thật hoặc thử: thay giả định hành vi bằng số đo thật (phút xem, tim/phút, % tặng quà) rồi chạy lại.
- Thêm vào script: Cửa sổ Trợ Chiến, khiêu chiến giành ghế, Linh Khí Triều (chưa mô phỏng ở v0.1).
