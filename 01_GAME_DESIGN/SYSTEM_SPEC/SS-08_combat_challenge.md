# SS-08 — Chiến Lực, khiêu chiến, Trợ Chiến và chiến đấu

## 1. Mục tiêu
Khiêu chiến là một phần MVP (D-012). Mọi trận có kết quả công bằng có thể giải thích, có ngẫu nhiên giới hạn, và không phụ thuộc vào vật phẩm trang bị.

## 2. Chiến Lực cơ sở (OPEN-14)

Checkpoint không có công thức Chiến Lực. Nguồn duy nhất là GAME_FLOW_v0.1 và D-010, D-016, đã bị sửa để bỏ vũ khí và pháp bảo.

**Phương án mặc định (TUNABLE):**
```
ChienLuc_co_so = TuVi_tich_luy × (1 + sum(%_cong_phap))
```
- `TuVi_tich_luy` đã bao gồm hệ số Linh Căn (vì Tu Vi tích lũy đã nhân hệ số ở SS-02). Không nhân hệ số lần hai.
- `%_cong_phap`: tổng phần trăm từ công pháp (OPEN-13). Nếu công pháp không được giữ, số hạng này bằng 0.
- **Quà và Tu Vi:** Tu Vi nhận từ quà đã nằm trong `TuVi_tich_luy`, nên được tính tự động (D-010).
- **Vật phẩm quà khác Tu Vi:** cộng cố định vào Chiến Lực theo bảng quy đổi (OPEN-10). Chưa có bảng nên hiện bằng 0.

Không có vũ khí hay pháp bảo trong công thức (checkpoint).

## 3. Khiêu chiến (CONFIRMED về quy tắc chính, TUNABLE về số)

### 3.1 Điều kiện
- Người khiêu chiến phải đang LIVE hợp lệ (TUNABLE).
- Cổng cảnh giới (TUNABLE):

| Mục tiêu | Cảnh giới tối thiểu | Số ghế |
|---|---|---:|
| Người chơi khác | Trúc Cơ | — |
| Trưởng Lão | Kim Đan | 4 |
| Trưởng Phái | Nguyên Anh | 2 |
| Tông Chủ | Hóa Thần | 1 |

- **Thái Thượng Tông Chủ** không bị khiêu chiến (CONFIRMED, D-015).
- Không tự khiêu chiến chính mình.
- Mỗi người khiêu chiến tối đa 1 lần / 5 phút (TUNABLE).
- Người vừa giữ chức và vừa thắng được miễn khiêu chiến 2 phút (TUNABLE).

### 3.2 Người giữ chức rời LIVE (TUNABLE)
- Vẫn giữ chức và vẫn có thể bị khiêu chiến.
- Đối thủ đấu với **hồ sơ đã lưu** của người giữ chức (chỉ số tại thời điểm rời LIVE). Không giả vờ người đó đang online.
- Đây là đại diện, không phải BOT điều khiển.

### 3.3 Thắng thua (CONFIRMED, D-016)
```
CL_tran_A = (CL_co_so_A + ho_tro_A) × ngau_nhien(0,90 .. 1,10)
CL_tran_B = (CL_co_so_B + ho_tro_B) × ngau_nhien(0,90 .. 1,10)
Bên có CL_tran cao hơn thắng. Bằng nhau: người bị khiêu chiến thắng.
```
- `ho_tro_*`: Chiến Lực cộng từ Trợ Chiến (mục 4).
- Mỗi bên có một số ngẫu nhiên độc lập trong trận. Ngẫu nhiên dùng seeded RNG để có thể replay (combat proposal).

### 3.4 Kết quả
- Người thắng chiếm ghế. Người thua giữ nguyên cảnh giới (không mất Tu Vi).
- Chuyển ghế được ghi vào ledger và đưa vào camera (SS-07 mục 2, OPEN-38).
- Hết trận, thông báo kết quả (SS-17).

## 4. Trợ Chiến (D-018, TUNABLE chi tiết)

- Mở cửa sổ **30 giây** sau khi trận bắt đầu (TUNABLE).
- **Đấu thủ** tặng quà: Chiến Lực cộng cho **chính họ**.
- **Người xem khác** tặng quà: Chiến Lực cộng cho **phe đã chọn**.
- **Chưa chọn phe:** quà không cộng cho bên nào (TUNABLE, FEATURE_SPEC §5 không cho phép mặc định bên nhận). OPEN-33.
- Chọn phe bằng lệnh bình luận (phụ thuộc D-007, OPEN-15). Local Simulation có nút chọn.
- Quà cộng Chiến Lực cố định theo bảng công khai (OPEN-10). Không ngẫu nhiên.
- Màn hình hiển thị phe đang được chọn, và cách đổi phe khi còn trong cửa sổ.
- Hết 30 giây: khóa đóng góp, áp dao động ±10% (mục 3.3), công bố kết quả.

## 5. Chiến đấu Boss và thuộc tính (combat proposal, TUNABLE)

Mỗi nhân vật có thuộc tính dẫn xuất: HP, Tấn công, Phòng thủ, Tốc độ, tỉ lệ và sát thương chí mạng, và Chiến Lực tóm tắt.

- Thuộc tính lấy từ cảnh giới, Tu Vi trong cảnh giới, hệ số Linh Căn và tăng trưởng nhân vật.
- Không có trang bị và không có pháp bảo.
- Giới hạn trên và dưới để tránh chênh lệch cực đoan (soft cap).
- Đường cong HP, tấn công, phòng thủ theo cảnh giới: **chưa có** (cần mô phỏng).

Thứ tự gây sát thương (combat proposal):
1. Chọn mục tiêu theo luật (Boss ưu tiên cho người đủ điều kiện, nếu không thì mục tiêu của trận).
2. Quyết định trúng hay trượt theo tấn công và phòng thủ.
3. Tính sát thương thô theo tấn công và hệ số kỹ năng.
4. Trừ phòng thủ, có giảm dần; sát thương tối thiểu dương khi trúng.
5. Quay chí mạng và nhân hệ số.
6. Áp khiên hoặc hiệu ứng nếu có.
7. Ghi lại sát thương thực để tính đóng góp (SS-03).

Tránh one-shot, trừ các cơ chế Boss được báo trước và đã kiểm thử.

## 6. Đường cong và tham số (TUNABLE, chưa có số)
- HP, tấn công, phòng thủ, tốc độ theo cảnh giới.
- Xác suất trúng, né, chí mạng và trần.
- Hệ số, hồi chiêu, tầm đánh, cảnh báo, pha.
- Hành vi BOT (SS-13).
- Chi phí hiệu năng khi nhiều nhân vật (cần PoC).

## 7. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Hai người khiêu chiến cùng ghế cùng lúc | Chỉ một trận được mở. Người đến sau xếp hàng hoặc bị từ chối |
| Người bị khiêu chiến rời LIVE giữa trận | Trận tiếp tục với hồ sơ đã lưu |
| Quà đến sau khi khóa Trợ Chiến | Không cộng, ghi nhật ký |
| Trận Chiến Lực bằng nhau | Người bị khiêu chiến thắng (D-016) |
| Người giữ Tông Chủ bị khiêu chiến khi là Thái Thượng | Không xảy ra, không cho khiêu chiến |
| Kết quả trận bị hủy do lỗi | Hoàn về trạng thái trước trận, không ghi thắng |

## 8. Nghiệm thu
- Trúc Cơ khiêu chiến người chơi Luyện Khí: hợp lệ. Luyện Khí khiêu chiến Trưởng Lão: bị từ chối.
- Hai nhân vật có CL_co_so bằng nhau: tỉ lệ người bị khiêu chiến thắng xấp xỉ 50% (roll độc lập). Quy tắc hòa chỉ áp dụng khi CL_tran sau làm tròn bằng nhau (xem ghi chú).
- Thái Thượng Tông Chủ không nhận được lệnh khiêu chiến.
- Trợ Chiến: đấu thủ tặng quà → cộng cho chính họ. Người xem không chọn phe → không cộng.
- Người giữ chức rời LIVE: đấu với hồ sơ đã lưu, không hiển thị là online.

Ghi chú: D-016 viết "bằng nhau thì bên bị khiêu chiến thắng" nhưng CL_tran là số thực sau nhân ngẫu nhiên nên gần như không bao giờ bằng nhau tuyệt đối. Đề xuất (TUNABLE): làm tròn CL_tran về số nguyên trước khi so sánh; khi hai giá trị đã làm tròn bằng nhau thì bên bị khiêu chiến thắng. Với cách này, quy tắc hòa có tác dụng thực tế và được ghi rõ. Cần PO xác nhận cách làm tròn (OPEN-14).

## 9. Nhãn
- CONFIRMED: mục 3.1 (trừ số ghế và cooldown), mục 3.3 (D-016), mục 3.4 (chiếm ghế), Thái Thượng (D-015), mục 5 (nguyên tắc không trang bị).
- TUNABLE: mục 2 (công thức đề xuất), mục 3.1 (số), mục 3.2, mục 4, mục 5 (thứ tự), mục 7.
- OPEN: OPEN-13, OPEN-14, OPEN-15, OPEN-33.
