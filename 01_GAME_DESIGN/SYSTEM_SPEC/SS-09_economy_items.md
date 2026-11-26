# SS-09 — Vật phẩm, linh thạch và kinh tế

## 1. Mục tiêu
Kinh tế đủ để có động lực kiếm và chi, nhưng không tạo đường tắt mua Tu Vi ngoài các nguồn đã duyệt. Mọi thay đổi số dư có ledger.

## 2. Phạm vi vật phẩm (CONFIRMED)
- **Được phép:** vật phẩm tiêu hao, vật liệu, và vật phẩm có chức năng xác định.
- **Không có:** trang bị (equipment), pháp bảo (pháp khí). Không có ô trang bị. Không có chỉ số cộng từ trang bị.
- **Túi đồ:** không giới hạn sức chứa. Tự phân loại.

## 3. Nhóm vật phẩm

| Nhóm | Ví dụ | Trạng thái |
|---|---|---|
| Đan dược | Tụ Khí Đan, Ngưng Khí Đan … Hóa Thần Đan | CONFIRMED (SS-02 mục 6) |
| Vật liệu | Vật liệu đột phá, nội đan quái | CONFIRMED về loại, TUNABLE về danh mục |
| Linh thạch | Hạ, Trung, Thượng, Cực Phẩm | CONFIRMED là tài nguyên kinh tế (mục 4) |
| Vật phẩm Boss | Vật phẩm rơi theo phẩm chất Phàm → Thần | CONFIRMED (SS-03) |
| Vật phẩm chức năng | Vật phẩm có hiệu ứng xác định, không phải trang bị | TUNABLE |
| Công pháp | Tăng % Chiến Lực hoặc tốc độ tu luyện | OPEN-13 |

Tự động phân loại theo nhóm trong túi (CONFIRMED).

## 4. Linh thạch (CONFIRMED về vai trò; TUNABLE về bậc)

### 4.1 Vai trò
- Hỗ trợ kinh tế, giao dịch, tính năng và nâng cấp (checkpoint).
- Được chuyển giữa người chơi trong ranh giới chống gian lận (SS-10).
- **Không tự động chuyển thành Tu Vi** (thay thế D-014 phần tự luyện hóa).

### 4.2 Bậc (TUNABLE, giữ tỉ lệ từ GAME_FLOW_v0.1)

| Bậc | Quy đổi |
|---|---|
| Hạ Phẩm | Đơn vị cơ sở |
| Trung Phẩm | 100 Hạ Phẩm |
| Thượng Phẩm | 100 Trung Phẩm |
| Cực Phẩm | 100 Thượng Phẩm |

Tỉ lệ này chưa được xác nhận. Nếu không đổi bậc thì không cần giữ.

### 4.3 Ràng buộc đan dược (giữ từ D-014 phần không bị thay thế)
- Đan dược **không mua bằng linh thạch** (OPEN-17 xác nhận vì checkpoint không nói rõ).

## 5. Nguồn và đích (OPEN-17)

### 5.1 Nguồn linh thạch
- Phần thưởng Top 10 (SS-04).
- Sự kiện thế giới (SS-06) và cơ duyên nếu có bảng linh thạch.
- Phần thưởng quà đã định nghĩa trong bảng quy đổi (OPEN-10).

**Tim không cộng linh thạch.** Tim cộng Tu Vi trực tiếp (SS-02 mục 4.2).

### 5.2 Đích và sink (TUNABLE, đề xuất)
Checkpoint yêu cầu sink nhưng chưa định nghĩa. Đề xuất:
- **Phí giao dịch:** một tỉ lệ nhỏ trên mỗi lần chuyển linh thạch (ví dụ 5%) (SS-10).
- **Nâng cấp vật phẩm** có phí linh thạch (cần danh mục nâng cấp).
- **Phí tính năng:** tạo guild (SS-12), đổi đạo hiệu, mở rộng số danh hiệu hiển thị.
- **Không** có mua đan dược bằng linh thạch (mục 4.3).

Cảnh báo từ `09_SIMULATION/SIM_REPORT_v0.1.md`: nhóm chi tiêu cao có thể tiến gần Tiên Cảnh trong vài tháng với các giả định cũ. Cần sink và endgame trước khi mở kinh tế (SS-16).

## 6. Ledger (CONFIRMED về yêu cầu, TUNABLE về cấu trúc)
Mọi thay đổi vật phẩm và linh thạch ghi một bút toán:
- `id`, `player_id`, `resource` (tu_vi / linh_thach / vat_pham / dan), `amount`, `source` (thoi_gian / tim / qua / boss / top10 / su_kien / giao_dich / admin / dot_pha / nang_cap), `ref_event_id` (UNIQUE), `created_at`.
- Operator điều chỉnh phải có audit log.

## 7. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Túi đồ quá nhiều mục | Không giới hạn (CONFIRMED). Hiển thị theo nhóm và phân trang |
| Vật phẩm không còn định nghĩa chức năng | Giữ nguyên trong túi, không dùng được, không bị xóa |
| Đan dược đến khi đang BOT | Cộng vào nhân vật (nhân vật tồn tại) |
| Linh thạch về 0 | Hợp lệ, không âm |

## 8. Không được xảy ra
- Trang bị hoặc pháp bảo xuất hiện trong bất kỳ bảng nào.
- Linh thạch tự động chuyển thành Tu Vi.
- Mua Tu Vi bằng linh thạch.
- Số dư âm.
- Mất vật phẩm khi chuyển BOT hoặc khi thua trận.

## 9. Nghiệm thu
- Boss rơi vật phẩm → vào túi tự động, đúng nhóm.
- 1.000 mục vật phẩm trong túi → không bị từ chối nhận.
- Linh thạch nhận từ Top 10 không làm tăng Tu Vi.
- Mỗi thay đổi số dư có một bút toán trong ledger.
- Không có nơi nào trong UI hiển thị ô trang bị.

## 10. Nhãn
- CONFIRMED: mục 2, mục 4.1, mục 8 (các cấm).
- TUNABLE: mục 3 (danh mục), mục 4.2, mục 5.2, mục 6, mục 7, mục 9.
- OPEN: OPEN-13, OPEN-17, OPEN-10.
