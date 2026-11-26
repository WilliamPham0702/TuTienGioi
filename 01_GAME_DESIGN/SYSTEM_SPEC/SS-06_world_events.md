# SS-06 — Sự kiện thế giới, Linh Khí Triều và cơ duyên

## 1. Mục tiêu
Thế giới có nhịp chung. Mọi người chơi đủ điều kiện có thể tham gia. Sự kiện không lấn át gameplay và không tạo lợi thế không cân bằng được.

## 2. Phân loại (CONFIRMED)
- **Sự kiện ngẫu nhiên:** hệ thống chọn theo lịch hoặc xác suất.
- **Sự kiện do hành động người chơi:** ví dụ tim cộng đồng đạt ngưỡng, quà đặc biệt (SS-05 mục 6).
- Mọi người chơi đủ điều kiện đều có thể tham gia (CONFIRMED).

## 3. Vòng đời (TUNABLE)
```
Được kích hoạt → Thông báo (vào hàng đợi camera) → Đang hiệu lực → Kết thúc → Ghi ledger
```
- Sự kiện chỉ phát thưởng khi đang hiệu lực. Sự kiện không khởi động được thì ghi log và bỏ qua, không phát thưởng dở.
- Sự kiện có id duy nhất và thời lượng cố định, trừ khi ghi khác.

## 4. Danh mục (OPEN-12; đề xuất TUNABLE)

| Mã | Tên | Kích hoạt | Hiệu lực | Ghi chú |
|---|---|---|---|---|
| WE-01 | Linh Khí Triều | Tim cộng đồng trong phiên đạt 2.000 | 3 phút, ×2 Tu Vi tu luyện | Mục 5 |
| WE-02 | Nhịp linh khí | Lịch 15 phút | 30 giây, cộng nhỏ Tu Vi cho người đang online | Tên tạm, tiếp theo cơ duyên |
| WE-03 | Cơ duyên | Ngẫu nhiên mỗi 5–10 phút | Tức thì | Mục 6 |
| WE-04 | Mưa linh thạch | Quà đặc biệt hoặc lịch | Tức thì, chia theo SS-05 mục 4 | Chỉ khi có quà đặc biệt |
| WE-05 | Quái xâm nhập | Quà bậc 3 trở lên | Ngắn | OPEN, cần thiết kế |
| WE-06 | Boss phụ | Theo OPEN-12 | Theo SS-03 | OPEN |

Cảnh báo: tên và mã là tạm. Không được coi là danh mục đã duyệt.

## 5. Linh Khí Triều (TUNABLE, FEATURE_SPEC §1)

- **Bộ đếm:** tích lũy tim hợp lệ của toàn phiên.
- **Kích hoạt:** khi đạt 2.000 (TUNABLE, cân bằng bằng mô phỏng, OPEN-34).
- **Hiệu lực:** ×2 Tu Vi từ **thời gian tu luyện hợp lệ** (không áp cho tim) trong 3 phút, cho mọi người đủ điều kiện đang online.
- **Cooldown:** 10 phút giữa hai lần kích hoạt.
- **Trần:** tối đa 6 lần mỗi phiên.
- **Quà:** quà không tự cộng vào bộ đếm, trừ khi có bảng quy đổi được PO duyệt (FEATURE_SPEC §1).
- **Chống lạm dụng:** dedup sự kiện, giới hạn đóng góp theo nguồn, batching, không cho client gửi giá trị tim.
- **Hiển thị:** chỉ hiển thị "tim hợp lệ đã ghi nhận", không hứa mọi lượt tim đều được ghi.
- **Nguồn tim cá nhân:** nếu nền tảng không cung cấp tim theo người gửi, chỉ dùng tổng cộng đồng và không phân bổ giả cho từng cá nhân.

## 6. Cơ duyên (WE-03, TUNABLE)

- Mỗi 5–10 phút, chọn ngẫu nhiên một người đang có mặt hợp lệ. Chọn đều, không ưu tiên người tặng quà, không bán lượt.
- Bảng phần thưởng (xem GDD_MASTER mục 15):

| Loại | Ví dụ | Tỉ lệ |
|---|---|---:|
| Tu Vi | +10% Tu Vi tiểu cảnh hiện tại (OPEN-02) | 45% |
| Đan dược | Tụ Khí Đan, Trúc Cơ Đan | 30% |
| Công pháp | Tăng % Chiến Lực hoặc tốc độ tu luyện (OPEN-13) | 15% |
| Vật liệu / linh thạch | Vật liệu đột phá hoặc linh thạch nhỏ | 10% |

- **SUPERSEDED.** Vũ khí và pháp bảo trong bảng cũ đã bị loại theo checkpoint.
- Bảng công khai trong game nếu dùng xác suất (FEATURE_SPEC §8).
- Hiệu ứng: bảng hệ thống kiểu xuyên không, giọng máy (SS-17).
- Giới hạn tần suất và nhật ký cấp thưởng (ledger).

## 7. Đồng thời và xung đột (TUNABLE)

- Sự kiện không xung đột có thể chạy song song (CONFIRMED).
- Xung đột khi hai sự kiện cùng chiếm **lớp toàn màn hình**. Chỉ một hiệu ứng toàn màn hình ưu tiên cao chạy tại một thời điểm (VISUAL_SPEC §70).
- Xung đột khi cùng sửa một chỉ số (ví dụ hai bonus nhân trên cùng Tu Vi). Quy tắc: nhân các bonus có cùng loại thì không cộng dồn không giới hạn; lấy bonus lớn nhất (TUNABLE).
- Sự kiện xung đột không bị bỏ. Đặt vào hàng đợi camera (SS-07).

## 8. Tâm Ma (SUPERSEDED)
Tâm Ma và Trợ Đạo được thiết kế cho đột phá thất bại (FEATURE_SPEC §3). Checkpoint đã bỏ thất bại, nên Tâm Ma không còn trigger. Không triển khai. OPEN-24 nếu PO muốn dùng lại cho cơ chế khác.

## 9. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Hai sự kiện cùng lúc | Xếp vào hàng đợi camera; cả hai cùng hiệu lực nếu không xung đột |
| Sự kiện đang hiệu lực khi phiên kết thúc | Kết thúc sớm, ghi ledger đến thời điểm đó |
| Người chơi offline giữa hiệu lực | Không nhận thưởng tu luyện theo thời gian (không LIVE hợp lệ). Không phát bù |
| Cooldown Linh Khí Triều chưa hết | Bộ đếm tiếp tục nhưng không kích hoạt |
| Vượt trần 6 lần mỗi phiên | Bộ đếm vẫn tích lũy để hiển thị, không kích hoạt |

## 10. Nghiệm thu
- 2.000 tim trong một phiên → WE-01 kích hoạt đúng một lần, ×2 trong 3 phút.
- Trong cooldown 10 phút, không kích hoạt lần hai.
- Sau 6 lần trong một phiên, không kích hoạt lần 7.
- Cơ duyên chọn người đang hiện diện, không chọn BOT, không chọn người offline.
- Mọi sự kiện có ledger và không phát thưởng hai lần khi restart.

## 11. Nhãn
- CONFIRMED: mục 2, mục 7 (song song và không bỏ sự kiện).
- TUNABLE: mục 3, 4, 5, 6 (trừ phần công khai SUPERSEDED), 7 (quy tắc xung đột), 9, 10.
- SUPERSEDED: Tâm Ma (mục 8), vũ khí và pháp bảo trong cơ duyên.
- OPEN: OPEN-11, OPEN-12, OPEN-13, OPEN-02, OPEN-24, OPEN-34.
