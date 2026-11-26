# SS-07 — Hàng đợi camera

## 1. Mục tiêu
Camera là lớp trình diễn cho người xem. Camera không bao giờ tạm dừng hay thay đổi kết quả gameplay. Mọi sự kiện đáng chú ý được trình diễn đúng thứ tự và không bị bỏ.

## 2. Ưu tiên (CONFIRMED)

| Hạng | Loại | Ghi chú |
|---:|---|---|
| 1 | Boss đang đánh | Cao nhất |
| 2 | Độ Kiếp | |
| 3 | Tiên Cảnh | |
| 4 | Đột phá cảnh giới | |
| 5 | Nhận vật phẩm | |
| 6 | Sự kiện nhỏ | Thấp nhất |

Hạng số càng nhỏ càng ưu tiên cao.

**OPEN-38.** Khiêu chiến và đổi chức vụ không có trong bảng checkpoint. Mặc định (TUNABLE): bắt đầu và kết thúc khiêu chiến là **Sự kiện vừa** (5 giây) và xếp hạng 6 nếu không đổi chức vụ. Đổi chức vụ được xếp hạng 4 (cùng đột phá) cho đến khi PO quyết.

## 3. Thời lượng (CONFIRMED)

| Loại | Thời lượng |
|---|---:|
| Sự kiện nhỏ | 3 giây |
| Sự kiện vừa | 5 giây |
| Sự kiện lớn | 8 giây |
| Độ Kiếp | 12 giây |
| Tiên Cảnh | 15 giây |
| Boss | Theo diễn biến trận (không cố định) |

Hết thời lượng cố định thì quay về camera tổng quan nếu hàng đợi trống, hoặc chuyển sang mục kế tiếp.

## 4. Quy tắc hàng đợi (CONFIRMED)

1. **Một focus tại một thời điểm.**
2. **Không ngắt focus đang chạy.** Sự kiện mới đến trong lúc focus chạy thì vào hàng đợi.
3. **Sau mỗi focus kết thúc:** sắp xếp hàng đợi theo ưu tiên, rồi chọn mục đầu tiên.
4. **Cùng ưu tiên:** FIFO theo thời điểm đến.
5. **Không bỏ sự kiện.** Mọi mục đều được xử lý.
6. **Sự kiện trùng hoặc cùng loại** xếp chung, gộp thành một trình diễn và hiển thị đủ người liên quan.
7. **Quá tải:** gộp các sự kiện nhỏ để rút ngắn thời gian trình diễn, không bỏ.
8. **Hàng đợi trống:** quay về camera tổng quan.

## 5. Gộp (TUNABLE)

- Cửa sổ gộp: các mục cùng loại đang nằm trong hàng đợi trong 5 giây được gộp (TUNABLE).
- Gộp sự kiện nhỏ: khi hàng đợi có quá 8 mục (TUNABLE), các sự kiện nhỏ được gộp thành một trình diễn 3 giây hiển thị nhiều người (CONFIRMED: aggregate, không bỏ).
- Gộp không đổi thứ hạng ưu tiên của các mục khác.

## 6. Boss và hàng đợi (OPEN-37)

**Vấn đề:** Boss đang đánh có ưu tiên cao nhất và không có thời lượng cố định (CONFIRMED). Nếu Boss focus cứ chiếm hàng đợi, các mục khác sẽ không bao giờ được xử lý trong suốt trận dài.

**Phương án mặc định (TUNABLE, cần PO chọn):**
- Boss focus chạy theo **đoạn** (ví dụ 10 giây hoặc theo mốc diễn biến).
- Hết mỗi đoạn, nếu hàng đợi có mục không phải Boss, mục ưu tiên cao nhất trong đó được xử lý (xen kẽ 1 đoạn Boss, 1 mục khác).
- Nếu không có mục khác, Boss focus tiếp tục.
- Điều này không vi phạm "không ngắt focus" vì đoạn Boss kết thúc tại mốc diễn biến, không giữa chừng.

Cần PO xác nhận vì nó trực tiếp thay đổi trải nghiệm trận Boss.

## 7. Nguyên tắc trình diễn
- Camera chỉ trình diễn. Không tạm dừng combat, không đổi kết quả (combat proposal).
- Camera không che tên, cảnh giới hoặc điểm số quan trọng (SS-14).
- Sự kiện nhỏ chạy dưới dạng icon hoặc particle ngắn, không chiếm toàn màn hình (VISUAL_SPEC).
- Chỉ một hiệu ứng toàn màn hình ưu tiên cao tại một thời điểm.

## 8. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Boss bắt đầu đánh khi đang có Độ Kiếp | Độ Kiếp hoàn tất (12 giây), sau đó Boss focus |
| Tiên Cảnh và Độ Kiếp đến cùng lúc | Độ Kiếp trước (ưu tiên cao hơn) |
| Hai đột phá cùng lúc | FIFO |
| Ba mục nhận vật phẩm đến liên tiếp | Gộp (cùng loại) |
| Hàng đợi rất dài trong giờ cao điểm | Gộp sự kiện nhỏ; không bỏ mục nào |
| Phiên kết thúc khi còn mục trong hàng đợi | Chuyển sang kết thúc phiên, các mục chưa trình diễn được ghi nhật ký và không phát lại |
| Camera lỗi | Ghi log, bỏ qua mục đó, không ảnh hưởng gameplay |

## 9. Nghiệm thu
- Đột phá Luyện Khí đến trong lúc focus nhận vật phẩm → chờ focus đó hết trước.
- Ba sự kiện đến cùng lúc: Đột phá, Độ Kiếp, nhận vật phẩm → thứ tự Độ Kiếp, Đột phá, nhận vật phẩm.
- Hai đột phá cùng ưu tiên → FIFO.
- Không mục nào biến mất khỏi hàng đợi mà chưa được trình diễn hoặc ghi nhật ký.
- Hàng đợi trống → camera tổng quan trong vòng 1 giây.
- Trận Boss kéo dài 3 phút với hàng đợi có mục khác → các mục khác vẫn được trình diễn (sau khi OPEN-37 được quyết).

## 10. Nhãn
- CONFIRMED: mục 2 (bảng ưu tiên), mục 3, mục 4, mục 7.
- TUNABLE: mục 5, mục 6 (đề xuất), mục 8, mục 9 (một phần).
- OPEN: OPEN-37 (Boss và hàng đợi), OPEN-38 (phân loại khiêu chiến).
