# Game Flow Master — TuTienGioi

| Trường | Giá trị |
|---|---|
| Phiên bản | 1.0 (đồng bộ checkpoint 2026-11-26) |
| Ngày | 2026-11-27 |
| Thay thế | `GAME_FLOW_v0.1.md` (giữ lịch sử, không dùng làm nguồn) |
| Nguồn chính | `GDD_MASTER.md`, `SYSTEM_SPEC/` |

Mục này mô tả luồng chơi end-to-end từ lúc người xem vào LIVE đến khi họ rời đi và quay lại. Nhãn CONFIRMED, TUNABLE, OPEN, SUPERSEDED giữ nguyên ý nghĩa như trong `GDD_MASTER.md` mục 0.1.

---

## 0. Bản đồ luồng

```
Người xem vào LIVE
  → (A) Gán nhân vật cố định (một lần)
  → (B) Nếu chưa có hồ sơ: vào hàng đo Linh Căn
  → (C) Đo Linh Căn của phiên (ngẫu nhiên, một lần mỗi phiên)
  → (D) Tu luyện: Tu Vi gốc 1/s × hệ số Linh Căn khi LIVE hợp lệ
  → (E) Tương tác: tim/like cộng Tu Vi; quà; đan dược; sự kiện thế giới
  → (F) Đột phá tự động khi đạt ngưỡng; có thể nhiều lần liên tiếp
  → (G) Boss: tham gia tự động; phần thưởng theo tỉ lệ sát thương
  → (H) Khiêu chiến và Trợ Chiến; tranh chức vụ
  → (I) Top 10 hàng giờ; chia thưởng
  → (J) Camera xử lý hàng đợi sự kiện; thông báo
  → (K) Người xem rời LIVE → nhân vật chuyển BOT
  → (L) Quay lại → trả quyền điều khiển, khôi phục đúng trạng thái
Song song: dân số tối thiểu 50 (BOT lấp chỗ khi thiếu)
```

---

## A. Vào LIVE và nhận nhân vật

- **CONFIRMED (D-013).** Nhân vật chibi được gán ngẫu nhiên một lần và cố định. Không đổi nhân vật.
- **TUNABLE.** Người quay lại với cùng định danh giữ nhân vật cũ, không random lại.
- **TUNABLE.** Hiệu ứng: nhân vật bước ra từ cổng sơn môn hoặc mây, tên hiện trên đầu.
- **CONFIRMED.** Tên dựa trên định danh TikTok. Tên đi qua kiểm duyệt trước khi hiển thị hoặc đọc (SS-14 mục 6).
- **Lỗi định danh:** nếu không có định danh bền vững thì không tự gộp người chơi. Dùng hồ sơ tạm và không cấp tiến trình bền vững cho đến khi xác định được (GDD_MASTER mục 5).

## B. Hàng đo Linh Căn (người mới)

- **TUNABLE.** Người mới tự động đi đến Đá Đo Linh Căn. Nhiều người vào cùng lúc thì xếp hàng, mỗi lượt đo khoảng 3–5 giây.
- **TUNABLE.** Thông báo nhắc đo mỗi 3–5 phút, hoặc khi có ≥3 người mới. Không phát khi đang có sự kiện lớn.
- **Lưu ý kỹ thuật:** khung chữ đỏ không ghi được vào bình luận gốc của TikTok. Thông báo hiển thị trong khung do game tự vẽ trên LIVE (cần kiểm chứng khi có connector, D-007).

## C. Đo Linh Căn của phiên

- **CONFIRMED (D-009).** Linh Căn được roll một lần mỗi phiên LIVE theo bảng trọng số của checkpoint (Tạp 35%, Song 25%, Tam 18%, Thiên 12%, Dị 6%, Tiên 3%, Thánh thể 1%). Hệ số: ×1, ×2, ×3, ×4, ×5, ×6, ×10.
- **CONFIRMED.** Hệ thống đọc to tên và Linh Căn. Khi nhiều người đo liên tục thì gộp thông báo.
- **TUNABLE.** Linh Căn có hệ số từ ×4 trở lên (Thiên ×4, Dị ×5, Tiên ×6, Thánh thể ×10) được thông báo toàn tông môn và kích hoạt hiệu ứng đặc biệt. Đây là định nghĩa "hiếm" tạm thời để thống nhất với bậc hệ số.
- **OPEN (Thánh thể):** Thánh thể có trọng số 1% và hệ số ×10. Chưa có quy định hiệu ứng riêng.
- **TUNABLE.** Trong offline, BOT sử dụng Linh Căn của phiên gần nhất (OPEN, xem SS-13).

Tên bậc Linh Căn theo checkpoint: Tạp Linh Căn, Song Linh Căn, Tam Linh Căn, Thiên Linh Căn, Dị Linh Căn, Tiên Linh Căn, Thánh Thể. Các bậc Tứ Linh Căn và Nhất Phẩm trong GAME_FLOW_v0.1 đã bị thay thế.

## D. Tu luyện

- **CONFIRMED.** Tu Vi gốc: 1 mỗi giây khi LIVE hợp lệ × hệ số Linh Căn.
- **CONFIRMED.** Hợp lệ theo SS-15: có heartbeat, không tính khi rớt mạng trong grace, không tính trùng phiên.
- **CONFIRMED.** Không dùng cụm "thời gian xem" nếu nguồn chỉ cung cấp tham gia hoặc tương tác. Dùng "thời gian tham gia hợp lệ".
- **TUNABLE.** Hiệu ứng: nhân vật ngồi thiền, linh khí bay vào. Linh Căn cao thì hạt linh khí dày hơn.

## E. Tương tác nhận Tu Vi và tài nguyên

| Nguồn | Hiệu lực | Trạng thái |
|---|---|---|
| Thời gian tham gia hợp lệ | 1/s × hệ số | CONFIRMED |
| Tim/like hợp lệ | 5 × hệ số, có giới hạn tốc độ | CONFIRMED (SS-15 giới hạn: TUNABLE) |
| Quà | Phần thưởng cố định theo bảng | CONFIRMED về nguyên tắc; bảng OPEN-10 |
| Đan dược | Tu Vi theo bảng (Tụ Khí +100 … Hóa Thần +40.000); tự nhận, không cooldown, không giới hạn | CONFIRMED |
| Sự kiện thế giới (cơ duyên) | Ngẫu nhiên trong người đang hiện diện | TUNABLE (SS-06) |
| Linh Khí Triều | ×2 Tu Vi tu luyện trong 3 phút | TUNABLE |
| Boss | Tỉ lệ sát thương × hệ số × 10.000 × cấp Boss | CONFIRMED |
| Top 10 | Đan dược, linh thạch, vật phẩm | CONFIRMED |
| Linh thạch | Tài nguyên kinh tế; không chuyển thành Tu Vi | CONFIRMED (SS-09) |

**SUPERSEDED.** Tim → Hạ Phẩm Linh Thạch → Tu Vi (GAME_FLOW_v0.1 §6); Linh thạch tự luyện thành Tu Vi (D-014 cũ); Tụ Khí Đan tăng tốc 20% trong 5 phút (thay bằng bảng Tu Vi của checkpoint).

## F. Cảnh giới và đột phá

- **CONFIRMED.** 10 Đại Cảnh với ngưỡng Tu Vi tích lũy (SS-02 mục 2).
- **CONFIRMED.** Đột phá tự động, không thất bại, không mất Tu Vi.
- **CONFIRMED.** Có thể đột phá nhiều lần liên tiếp nếu Tu Vi vượt nhiều ngưỡng.
- **CONFIRMED.** Mỗi lần đột phá tạo một mục trong hàng đợi camera (ưu tiên "Đột phá", hoặc cao hơn nếu là Độ Kiếp hoặc Tiên Cảnh).
- **TUNABLE.** Trình diễn theo cảnh giới:
  - Đại Cảnh thấp: cột sáng nhỏ, đổi trang phục nhẹ, chữ lớn và TTS.
  - Kim Đan trở lên: thiên kiếp nhỏ, mây đen, toàn màn hình rung nhẹ, thông báo toàn tông môn.
  - Độ Kiếp: thiên kiếp lớn, 12 giây (SS-07).
  - Tiên Cảnh: cảnh đặc biệt, 15 giây.
- **OPEN-02.** Tiểu cảnh chưa được định nghĩa trong checkpoint.
- **OPEN-25.** Thiên kiếp có tương tác (người xem có thể tác động) hay chỉ trình diễn.

## G. Boss

- **CONFIRMED.** Một Boss hoạt động tại một thời điểm. Cấp L1–L7 roll theo trọng số 40/25/15/10/6/3/1%.
- **CONFIRMED.** Người chơi tham gia tự động theo chỉ số và cảnh giới. Boss có thể tấn công người chơi.
- **CONFIRMED.** Người chơi bị hạ không mất cảnh giới, hồi phục rồi tự quay lại trận.
- **CONFIRMED.** L1–L3 ở lại đến khi bị hạ. L4–L7 despawn sau 5 phút nếu không hạ.
- **CONFIRMED.** Hạ Boss thì cấp tiếp theo được roll ngẫu nhiên.
- **CONFIRMED.** Camera ưu tiên cao nhất khi Boss đang đánh và theo diễn biến trận, không có thời lượng cố định.
- **OPEN-06.** Sau despawn, Boss tiếp theo là L1 hay roll ngẫu nhiên (xem SS-03 mục 3).
- **TUNABLE.** Kỹ năng và pha đánh của từng cấp (SS-08 mục 5).

## H. Khiêu chiến và chức vụ

- **CONFIRMED (D-012).** Khiêu chiến người chơi và giành chức vụ thuộc MVP.
- **CONFIRMED (D-016).** Chiến Lực mỗi bên nhân ngẫu nhiên ±10% mỗi trận. Bằng nhau thì người bị khiêu chiến thắng.
- **CONFIRMED (D-015).** Người giữ Tông Chủ trở thành Thái Thượng Tông Chủ (host) và không bị khiêu chiến.
- **TUNABLE.** Cổng cảnh giới và số ghế (SS-08 mục 3).
- **TUNABLE.** Cooldown khiêu chiến và miễn trừ sau thắng (SS-08 mục 3).
- **TUNABLE.** Trợ Chiến 30 giây trước khi phân thắng thua (SS-08 mục 4).
- **TUNABLE.** Khi người giữ chức rời LIVE, hệ thống dùng hồ sơ đã lưu để đại diện (không giả vờ người đó đang online).
- **OPEN-15.** Cách bình luận lệnh khiêu chiến và chọn phe, phụ thuộc D-007.

## I. Top 10 hàng giờ

- **CONFIRMED.** Xếp hạng theo cảnh giới rồi Tu Vi tích lũy. Hòa thì người đạt mốc trước xếp trên.
- **CONFIRMED.** Chỉ người đang LIVE tại thời điểm chốt mới đủ điều kiện.
- **CONFIRMED.** Chia thưởng 25/18/14/11/9/7/6/4/3/3%. Quỹ và phần dư theo SS-04.
- **TUNABLE.** Chốt đầu mỗi giờ (`Asia/Ho_Chi_Minh`).
- **OPEN-05.** Ý nghĩa "quỹ 20% / 80%".

## J. Camera và thông báo

- **CONFIRMED.** Thứ tự ưu tiên: Boss đang đánh > Độ Kiếp > Tiên Cảnh > Đột phá > Nhận vật phẩm > Sự kiện nhỏ.
- **CONFIRMED.** Không ngắt focus đang chạy. Sự kiện mới vào hàng đợi, không bị bỏ.
- **CONFIRMED.** Thời lượng: nhỏ 3s, vừa 5s, lớn 8s, Độ Kiếp 12s, Tiên Cảnh 15s, Boss theo trận.
- **CONFIRMED.** Hàng đợi trống thì về camera tổng quan.
- **TUNABLE.** Chi tiết trong SS-07 và SS-17.

## K. Rời LIVE và chuyển BOT

- **CONFIRMED.** Nhân vật giữ nguyên danh tính, cảnh giới, Tu Vi, vật phẩm, chức vụ và mọi dữ liệu.
- **CONFIRMED.** Nhân vật chuyển sang BOT và tiếp tục hoạt động trong thế giới.
- **CONFIRMED.** Nếu người chơi đang giữ chức vụ thì vẫn giữ chức và có thể bị khiêu chiến (SS-08 mục 3, đại diện bằng hồ sơ đã lưu).
- **TUNABLE.** Trong offline, BOT không tăng Tu Vi theo thời gian (vì điều kiện là LIVE hợp lệ). BOT có thể nhận thưởng chiến đấu Boss (OPEN-07).
- **OPEN-08.** Thời hạn giữ BOT cho người không quay lại.

## L. Quay lại và khôi phục

- **CONFIRMED.** Khi quay lại, BOT dừng và người chơi nhận lại quyền điều khiển trên đúng nhân vật.
- **CONFIRMED.** Reconnect lưu trạng thái ngay và khôi phục đúng. Không cộng trùng và không xóa tiến trình.
- **TUNABLE.** Grace 60 giây khi rớt mạng; trong grace không cộng Tu Vi.
- **TUNABLE.** Người chơi quay lại không bị phạt; không mất tài nguyên.

## M. Dân số (chạy nền)

- **CONFIRMED.** Tối thiểu 50 nhân vật đang hoạt động (người chơi thật + BOT do người chơi sở hữu).
- **CONFIRMED.** Thiếu thì spawn BOT lấp chỗ. Đủ hoặc vượt thì không spawn.
- **CONFIRMED.** Không kick, không xóa nhân vật để ép về 50.
- **OPEN-09.** BOT lấp chỗ có rút khi người thật vào không.

## N. Vòng lặp người chơi (điều kiện nghiệm thu)

Một người xem thật phải đi hết vòng này trong một phiên LIVE: vào, có nhân vật, đo Linh Căn, thấy Tu Vi tăng, nhận một tương tác được phép, lên được cảnh giới có hiệu ứng, và rời rồi quay lại vẫn đúng nhân vật.

## Phụ lục: Liên kết spec

| Mục luồng | Đặc tả |
|---|---|
| C, D, F | SS-02 |
| E, I | SS-04, SS-05, SS-09 |
| G | SS-03 |
| H | SS-08, SS-12 |
| J | SS-07, SS-17 |
| K, L, M | SS-01, SS-13, SS-15 |
| Chợ và giao dịch | SS-10 |
| Hậu Tiên Cảnh | SS-16 |
| Giao diện | SS-14 |
