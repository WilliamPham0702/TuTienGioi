# SS-04 — Top 10 hàng giờ và bảng xếp hạng

## 1. Mục tiêu
Tạo mục tiêu ngắn hạn mỗi giờ và phần thưởng cho người đứng đầu, đồng thời hiển thị bảng xếp hạng rõ ràng.

## 2. Đủ điều kiện (CONFIRMED)
- Chỉ người chơi **đang LIVE tại thời điểm chốt** mới đủ điều kiện.
- BOT sở hữu không đủ điều kiện, dù có cảnh giới cao.
- BOT lấp chỗ không đủ điều kiện.

## 3. Thứ hạng (CONFIRMED)

Thứ tự so sánh:
1. Cảnh giới cao hơn xếp trên.
2. Tu Vi tích lũy cao hơn xếp trên.
3. Hòa: người đạt mốc sớm hơn xếp trên.

Định nghĩa "mốc sớm hơn" (TUNABLE): thời điểm nhân vật đạt cảnh giới hiện tại. Nếu vẫn hòa thì thời điểm tạo nhân vật sớm hơn xếp trên.

## 4. Quỹ thưởng (CONFIRMED về tỉ lệ; OPEN-05 về nguồn)

### 4.1 Nội dung quỹ
Phần thưởng gồm: đan dược, linh thạch, nội đan quái, vật liệu đột phá, vật phẩm Boss.

### 4.2 Quy định nguồn (CONFIRMED)
- 20% quỹ đến từ **vật phẩm Boss rơi thật** trong chu kỳ.
- 80% quỹ đến từ **thưởng Boss thông thường**.

### 4.3 Giá trị vật phẩm để quy đổi (CONFIRMED)
| Phẩm chất | Giá trị |
|---|---:|
| Phàm | 1 |
| Linh | 2 |
| Huyền | 4 |
| Địa | 8 |
| Thiên | 16 |
| Tiên | 32 |
| Thần | 64 |

### 4.4 Cách đọc quỹ (OPEN-05, mặc định TUNABLE)
Checkpoint không nói rõ "thưởng Boss thông thường" có phải tiền thật hay không. Phương án mặc định:
```
V = tổng giá trị quỹ của chu kỳ
V_drop     = 0,20 × V   (giá trị vật phẩm Boss rơi thật trong chu kỳ)
V_thuong   = 0,80 × V   (giá trị nội dung thưởng thông thường, đối chiếu từ bảng nguồn)
```
Hệ quả: quỹ đủ dùng khi vật phẩm Boss rơi thật chiếm 20% giá trị. Nếu rơi ít hơn, phần 20% không đủ và phần thiếu được bù bằng thưởng thông thường (TUNABLE, để PO quyết).

Cần PO xác nhận cách đọc trước khi chạy.

## 5. Chia thưởng (CONFIRMED)

| Hạng | Tỉ lệ |
|---:|---:|
| 1 | 25% |
| 2 | 18% |
| 3 | 14% |
| 4 | 11% |
| 5 | 9% |
| 6 | 7% |
| 7 | 6% |
| 8 | 4% |
| 9 | 3% |
| 10 | 3% |

Tổng = 100%.

- Mỗi hạng nhận phần quỹ theo tỉ lệ, quy đổi về vật phẩm có sẵn trong quỹ.
- Nếu một hạng không đủ điều kiện (ví dụ người đứng hạng 4 offline lúc chốt), hạng đó được bỏ, không chuyển cho người khác theo thứ tự sau (TUNABLE). Phần đó đi vào phần dư.

## 6. Phần dư (CONFIRMED)
- Phần không chia hết (làm tròn hoặc hạng không đủ điều kiện) chia cho các hạng đủ điều kiện.
- Không nợ.
- Không chuyển sang chu kỳ sau (no rollover).
- Cách chia phần dư (TUNABLE): theo thứ tự hạng, mỗi hạng đủ điều kiện nhận thêm một phần bằng nhau, phần lẻ vào hạng cao nhất.

## 7. Chu kỳ (TUNABLE)
- Chu kỳ: 1 giờ.
- Chốt đầu mỗi giờ theo `Asia/Ho_Chi_Minh`.
- Quỹ và thứ hạng được chốt tại cùng một thời điểm (snapshot). Không đổi giữa chừng.
- Phát thưởng idempotent: một chu kỳ chỉ phát một lần.

## 8. Bảng xếp hạng hiển thị (TUNABLE)
Bốn tab theo GDD v0.3 (OPEN-28):
- **Tu Vi:** tổng Tu Vi tích lũy (theo hồ sơ).
- **Chiến Lực:** Chiến Lực cơ sở hiện tại.
- **Bế Quan:** thời gian tham gia hợp lệ trong phiên hiện tại. Không gọi là "watch time".
- **Cúng Phụng:** tổng giá trị quà trong phiên hiện tại, reset khi phiên kết thúc. Phải ghi nhãn "phiên này".

Hiển thị: top 3–5, chuyển tab chậm theo chu kỳ hoặc khi operator điều khiển. Không đọc toàn bảng bằng TTS (SS-14).

Top 10 hàng giờ là CONFIRMED và luôn là bảng chính khi đến giờ chốt.

## 9. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Ít hơn 10 người đủ điều kiện | Chia cho số người có, theo tỉ lệ hạng đầu, phần dư theo mục 6 |
| Không có người đủ điều kiện | Quỹ không phát, không nợ, không chuyển |
| Quỹ không có vật phẩm Boss rơi thật | Phần 20% thành 0, không bù bằng vật phẩm ảo (TUNABLE) |
| Người đứng đầu rời LIVE đúng lúc chốt | Không đủ điều kiện, các hạng sau dịch lên theo mục 5 |
| Hai người hòa tuyệt đối | Theo mục 3 (thời điểm đạt mốc, thời điểm tạo nhân vật) |

## 10. Nghiệm thu
- Với 15 người đủ điều kiện, phát đúng 10 hạng theo tỉ lệ.
- Hai người hòa Tu Vi và cảnh giới, người đạt mốc sớm hơn đứng trên.
- Không ai có mặt ở chốt mà không đủ điều kiện được nhận thưởng.
- Chu kỳ không phát hai lần khi restart.
- Tổng vật phẩm và giá trị phát ra khớp với quỹ (sai số làm tròn xử lý theo mục 6).

## 11. Nhãn
- CONFIRMED: mục 2, 3, 4.2, 4.3, 5, 6 (ý tưởng phần dư), 7 (chu kỳ 1 giờ theo checkpoint: "Top 10 hourly").
- TUNABLE: mục 4.4, 6 (cách chia phần dư), 7 (múi giờ và snapshot), 8, 9.
- OPEN: OPEN-05, OPEN-28.
