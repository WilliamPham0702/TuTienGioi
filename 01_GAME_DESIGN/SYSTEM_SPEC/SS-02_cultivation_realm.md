# SS-02 — Linh Căn, Tu Vi, cảnh giới, đột phá và đan dược

## 1. Mục tiêu
Tu Vi là chỉ số tiến trình chính. Linh Căn quyết định tốc độ. Cảnh giới tăng tự động và có hiệu ứng rõ ràng.

## 2. Ngưỡng cảnh giới (CONFIRMED)

Ngưỡng là **Tu Vi tích lũy** (cumulative). Khi tổng Tu Vi của nhân vật đạt ngưỡng, nhân vật đạt cảnh giới tương ứng.

| # | Đại Cảnh | Ngưỡng Tu Vi tích lũy |
|---|---|---:|
| 1 | Luyện Khí | 1.200 |
| 2 | Trúc Cơ | 6.000 |
| 3 | Kim Đan | 24.000 |
| 4 | Nguyên Anh | 72.000 |
| 5 | Hóa Thần | 180.000 |
| 6 | Luyện Hư | 420.000 |
| 7 | Hợp Thể | 900.000 |
| 8 | Đại Thừa | 1.800.000 |
| 9 | Độ Kiếp | 3.600.000 |
| 10 | Tiên Cảnh | 7.200.000 |

- Tiên Cảnh là cảnh giới cuối có ngưỡng. Sau đó áp dụng SS-16 (OPEN-16).
- Tên "Chân Tiên" trong tài liệu cũ đã bị thay bằng "Tiên Cảnh" (OPEN-29).
- **OPEN-01:** ngưỡng là mức để *đạt* cảnh giới (mặc định trong tài liệu này). Trạng thái trước Luyện Khí chưa có tên trong checkpoint; tạm gọi "Phàm Nhân".

## 3. Linh Căn (CONFIRMED)

| Bậc | Tên | Trọng số | Hệ số |
|---|---|---:|---:|
| 1 | Tạp Linh Căn | 35% | ×1 |
| 2 | Song Linh Căn | 25% | ×2 |
| 3 | Tam Linh Căn | 18% | ×3 |
| 4 | Thiên Linh Căn | 12% | ×4 |
| 5 | Dị Linh Căn | 6% | ×5 |
| 6 | Tiên Linh Căn | 3% | ×6 |
| 7 | Thánh Thể | 1% | ×10 |

- Tổng trọng số = 100%.
- Roll một lần mỗi phiên LIVE (D-009). Không bán lượt roll, không tăng xác suất bằng quà.
- Linh Căn ảnh hưởng: tốc độ Tu Vi gốc, tim/like, Boss (SS-03), Chiến Lực (SS-08).
- Tên "Tứ Linh Căn" và "Nhất Phẩm Linh Căn" trong GAME_FLOW_v0.1 đã bị thay thế.

## 4. Công thức Tu Vi (CONFIRMED)

### 4.1 Tu Vi theo thời gian
```
TuVi_thoi_gian_moi_giay = 1 × he_so_linh_can   (khi LIVE hợp lệ)
```

### 4.2 Tim / like
```
TuVi_moi_tim = 5 × he_so_linh_can   (cho mỗi tim/like hợp lệ, sau giới hạn SS-15)
```
Thuật ngữ "tim" và "like": xem OPEN-32.

### 4.3 Các nguồn khác
Đan dược (mục 6), Boss (SS-03), Top 10 (SS-04), sự kiện (SS-06) cộng trực tiếp vào Tu Vi.

## 5. Tu Vi tích lũy và đột phá

- Tu Vi tích lũy không giảm.
- Khi tổng ≥ ngưỡng của cảnh giới kế tiếp, đột phá **tự động** và ghi nhận cảnh giới mới.
- Có thể vượt nhiều ngưỡng trong một lần cộng (ví dụ nhận đan lớn). Mỗi ngưỡng đi qua tạo một lần đột phá, lần lượt theo thứ tự, và mỗi lần vào hàng đợi camera (SS-07).
- Không có thất bại. Không mất Tu Vi. Không có hồi chiêu đột phá.

## 6. Đan dược (CONFIRMED)

| Đan | Tu Vi cộng |
|---|---:|
| Tụ Khí Đan | +100 |
| Ngưng Khí Đan | +500 |
| Trúc Cơ Đan | +1.500 |
| Kim Đan | +5.000 |
| Nguyên Anh Đan | +15.000 |
| Hóa Thần Đan | +40.000 |

- Tự nhận khi có. Không giới hạn số lượng. Không cooldown.
- Đan là tiêu hao. Cộng Tu Vi ngay khi được nhận (OPEN-27 cho nguồn đan).
- Thay thế: Tụ Khí Đan tăng tốc 20% trong 5 phút và Trúc Cơ Đan tăng tỉ lệ đột phá đã bị loại (SUPERSEDED).

## 7. Tiểu cảnh (OPEN-02)

Checkpoint không định nghĩa tiểu cảnh. Tài liệu cũ dùng Sơ Kỳ, Trung Kỳ, Hậu Kỳ, Đại Viên Mãn.

**Đề xuất tạm (TUNABLE, không phải quyết định):** chia mỗi khoảng Đại Cảnh thành 4 phần bằng nhau theo Tu Vi tích lũy.

Ví dụ: Luyện Khí = 0 → 1.200; chia 4 thì Sơ Kỳ 0–300, Trung Kỳ 300–600, Hậu Kỳ 600–900, Đại Viên Mãn 900–1.200.

Nếu PO chọn cách khác, chỉ thay mục này, không đổi các ngưỡng ở mục 2.

Cần lưu ý: vì ngưỡng là cumulative và khoảng cách giữa các cảnh tăng nhanh (Luyện Khí 1.200 vs Tiên Cảnh 7.200.000), chia đều theo Đại Cảnh sẽ tạo ra số tiểu cảnh rất khác nhau. PO nên quyết trước khi làm UI.

## 8. Hiệu ứng theo cảnh giới (TUNABLE)

| Sự kiện | Trình diễn | Thông báo | Ưu tiên camera |
|---|---|---|---|
| Tiểu cảnh (nếu có) | Vòng sáng ngắn, số Tu Vi bay | Chữ | Sự kiện nhỏ |
| Đại Cảnh thấp (Luyện Khí → Kim Đan) | Cột sáng, linh khí xoáy, đổi trang phục | Chữ lớn + TTS | Đột phá |
| Kim Đan trở lên | Thiên kiếp nhỏ, mây đen, sấm | Toàn tông môn + TTS | Đột phá |
| Độ Kiếp | Thiên kiếp lớn, 12 giây | Toàn tông môn | Độ Kiếp (ưu tiên 2) |
| Tiên Cảnh | Cảnh đặc biệt, 15 giây | Toàn phiên | Tiên Cảnh (ưu tiên 3) |

OPEN-25: Độ Kiếp vừa là cảnh giới vừa là sự kiện thiên kiếp. Hiện tại: cảnh giới ở ngưỡng 3.600.000 và thiên kiếp là hiệu ứng trình diễn khi đạt cảnh.

## 9. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Tu Vi âm | Không xảy ra. Mọi nguồn chỉ cộng |
| Đột phá khi offline (BOT) | Không tăng Tu Vi theo thời gian khi offline. Chỉ tăng từ nguồn được phép |
| Hai nguồn cộng đồng thời | Cộng theo thứ tự nhận; ghi ledger với ref_event_id để tránh trùng |
| Phiên mới, Linh Căn đổi | Tu Vi giữ nguyên. Hệ số mới áp dụng từ thời điểm roll |
| Đạt Tiên Cảnh | Chuyển sang SS-16 |

## 10. Nghiệm thu
- Nhân vật 0 Tu Vi, Tạp Linh Căn, LIVE 60 giây → +60 Tu Vi.
- Nhân vật Thánh Thể nhận 1 tim → +50 Tu Vi.
- Nhận 10.000 Tu Vi tức thì → Luyện Khí, Trúc Cơ đều đột phá, mỗi lần một mục camera, theo thứ tự.
- Không có đường đi nào làm Tu Vi giảm.
- Tổng đan Tụ Khí × 1000 → +100.000 Tu Vi, không giới hạn số lượng.

## 11. Nhãn
- CONFIRMED: mục 2 (trừ OPEN-01, OPEN-29), mục 3, mục 4, mục 5, mục 6.
- TUNABLE: mục 8, mục 9.
- OPEN: mục 7 (OPEN-02), OPEN-01, OPEN-25, OPEN-27, OPEN-29, OPEN-32.
