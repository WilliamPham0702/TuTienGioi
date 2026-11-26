# SS-03 — Boss L1–L7

## 1. Mục tiêu
Tạo một khoảnh khắc chung cho cả phòng. Phần thưởng công bằng, dựa trên đóng góp thật, không dựa trên thời gian đứng xem.

## 2. Trạng thái và vòng đời

- **CONFIRMED.** Chỉ có một Boss hoạt động tại một thời điểm.
- **CONFIRMED.** Cấp Boss roll theo trọng số khi spawn:

| Cấp | Trọng số | Ở lại đến khi bị hạ? | Tự despawn |
|---|---:|---|---|
| L1 | 40% | Có | Không |
| L2 | 25% | Có | Không |
| L3 | 15% | Có | Không |
| L4 | 10% | Không | Sau 5 phút |
| L5 | 6% | Không | Sau 5 phút |
| L6 | 3% | Không | Sau 5 phút |
| L7 | 1% | Không | Sau 5 phút |

- **CONFIRMED.** Hạ Boss thì cấp kế tiếp được roll ngẫu nhiên theo trọng số.
- **CONFIRMED.** L4–L7 despawn và reset về L1 sau 5 phút nếu chưa bị hạ.
- **OPEN-06.** Với despawn, "reset về L1" được đọc là Boss tiếp theo luôn là L1. Phương án khác: roll lại theo trọng số. Mặc định trong tài liệu này: L1.

## 3. Phân bố lượt và trạng thái sống
- Mỗi cấp có HP và tốc độ theo bảng cấp (TUNABLE, đường cong xem SS-08 mục 6).
- Boss tấn công người chơi và BOT trong vùng chiến đấu (CONFIRMED: Boss có thể tấn công người chơi).
- Người chơi bị hạ không mất cảnh giới, hồi phục và quay lại tự động (CONFIRMED).

## 4. Đóng góp và phần thưởng Tu Vi (CONFIRMED)

### 4.1 Đóng góp hợp lệ
- Đóng góp = tổng sát thương hợp lệ gây lên Boss. Thời gian đứng xem, thời gian camera và thời gian online không tính.
- Sát thương hợp lệ: sau khi trừ chống trùng (dedup theo event id) và kiểm tra mục tiêu hợp lệ (TUNABLE).
- Hỗ trợ (nếu có sau này): phải được định nghĩa rõ, hiện chưa có.

### 4.2 Công thức
```
share_i      = damage_i / sum(damage)           (tỉ lệ đóng góp của nhân vật i)
TuVi_thuong_i = share_i × he_so_linh_can_i × 10.000 × cap_boss
```
- `he_so_linh_can_i`: hệ số Linh Căn của nhân vật i trong phiên đó. Với BOT sở hữu, dùng hệ số của phiên gần nhất (TUNABLE, xem SS-13).
- `cap_boss`: 1..7 (L1..L7).

Ví dụ kiểm tra:
- L3, nhân vật Tiên Linh Căn (×6), đóng góp 10%: 0,10 × 6 × 10.000 × 3 = 18.000 Tu Vi.
- L1, Tạp Linh Căn (×1), đóng góp 10%: 0,10 × 1 × 10.000 × 1 = 1.000 Tu Vi.

**Lưu ý cân bằng (TUNABLE):** với đóng góp lớn và Linh Căn cao, một trận có thể đẩy người chơi qua vài ngưỡng cảnh giới. Phải mô phỏng trước khi khóa.

## 5. Vật phẩm rơi

### 5.1 Số lượng (CONFIRMED)
| Cấp | Số vật phẩm (ngẫu nhiên đều trong khoảng) |
|---|---|
| L1 | 1–2 |
| L2 | 2–3 |
| L3 | 3–4 |
| L4 | 4–5 |
| L5 | 5–7 |
| L6 | 6–8 |
| L7 | 7–10 |

Giả định: phân bố đều trong khoảng (TUNABLE).

### 5.2 Phẩm chất
Trọng số cơ sở (CONFIRMED): Phàm 35%, Linh 25%, Huyền 18%, Địa 10%, Thiên 7%, Tiên 4%, Thần 1%.

Hệ số Boss (CONFIRMED) áp dụng cho Huyền trở lên: L1 ×1, L2 ×1,2, L3 ×1,4, L4 ×1,7, L5 ×2, L6 ×2,5, L7 ×3.

**OPEN-04 — chuẩn hóa.** Phương án mặc định (TUNABLE):
```
w'_phamchat = w_phamchat × (hệ số nếu Huyền trở lên, còn lại = 1)
p_phamchat  = w'_phamchat / sum(w')
```
Ví dụ L2 (×1,2): Huyền 18 → 21,6; Địa 10 → 12; Thiên 7 → 8,4; Tiên 4 → 4,8; Thần 1 → 1,2. Tổng = 108. Kết quả: Phàm 32,4%; Linh 23,1%; Huyền 20,0%; Địa 11,1%; Thiên 7,8%; Tiên 4,4%; Thần 1,1%.

### 5.3 "Xác suất hiếm: cấp Boss × 10%" (OPEN-03)
Checkpoint ghi "Rare chance: Boss level ×10%" nhưng không định nghĩa "hiếm". Ba cách đọc:
- **A.** Mỗi vật phẩm có xác suất `cấp × 10%` được nâng lên bảng hiếm (Thiên trở lên). Với L7 là 70%.
- **B.** Mỗi lần rơi có xác suất `cấp × 10%` để thêm một vật phẩm bonus.
- **C.** Tỉ lệ "rare" là một cờ độc lập không gắn bảng nào.

Đề xuất (TUNABLE, cần PO chọn): A, vì giữ đúng số lượng rơi và chỉ thay đổi phẩm chất. Cần kiểm tra xem tỉ lệ 70% ở L7 có quá cao không.

## 6. Phân chia vật phẩm cho người chơi (OPEN-05)
Checkpoint không nói vật phẩm rơi được chia cho ai. Đề xuất (TUNABLE):
- Mỗi vật phẩm rơi được gán cho một người tham gia bằng xổ số có trọng số theo `share_i`.
- Người không gây sát thương hợp lệ không nhận vật phẩm.
- BOT lấp chỗ không nhận vật phẩm và không nhận Tu Vi. (Đúng với SS-01 mục 6.)
- Một phần vật phẩm đi vào quỹ Top 10 (SS-04). Tỉ lệ này cần chốt (OPEN-05).

## 7. Chống khai thác
- Chống trùng sự kiện sát thương (dedup theo event id).
- Mục tiêu giả và đòn vô hiệu không tính sát thương.
- Không nhận phần thưởng từ kết nối lại nhiều lần (reward claim idempotent).
- Không cộng thưởng cho BOT lấp chỗ.
- Không cộng thưởng từ farm: không tính sát thương nếu nhân vật không ở trong vùng hợp lệ (TUNABLE).
- Mọi thưởng ghi vào ledger với `ref_event_id` duy nhất.

## 8. Đặc tính từng cấp (TUNABLE, đề xuất từ combat proposal)
| Cấp | Mô tả |
|---|---|
| L1–L2 | Đòn đánh đơn giản, ít cơ chế |
| L3–L4 | Đòn diện rộng có báo trước, một cơ chế phòng thủ |
| L5–L6 | Nhiều pha, xen kẽ áp lực và khoảng hồi |
| L7 | Nhiều pha, dấu hiệu rõ, trình diễn lớn, vẫn đọc được trên điện thoại |

Quy tắc: mọi đòn nguy hiểm có cảnh báo trước. Không có đòn không tránh được lặp lại gây wipe.

## 9. Trình diễn và camera
- Camera ưu tiên cao nhất khi Boss đang đánh (SS-07).
- Camera bám diễn biến trận, không có thời lượng cố định.
- Các đòn đánh được gom thành hiệu ứng theo lô, tránh hàng trăm hiệu ứng nhỏ cùng lúc (FEATURE_SPEC §6).

## 10. Nghiệm thu
- Spawn 10.000 lần: tỉ lệ cấp xấp xỉ trọng số (sai số thống kê cho phép).
- Hạ L3 với hai người 50/50: mỗi người nhận đúng 0,5 × hệ số × 30.000.
- Không có vật phẩm nào rơi nhiều hơn khoảng cho phép của cấp.
- L4 không bị hạ trong 5 phút → despawn; Boss kế tiếp là L1 (OPEN-06 theo mặc định).
- Kết nối lại không cộng thưởng hai lần.

## 11. Nhãn
- CONFIRMED: mục 2 (trừ OPEN-06), mục 4.2 (công thức), mục 5.1, 5.2 (trọng số và hệ số gốc).
- TUNABLE: mục 3, mục 4.1 (định nghĩa hợp lệ), mục 5.2 (chuẩn hóa), mục 6, mục 7, mục 8, mục 9.
- OPEN: OPEN-03, OPEN-04, OPEN-05, OPEN-06, OPEN-07.
