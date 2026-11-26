# SS-17 — Hàng đợi thông báo, TTS và tường thuật AI

## 1. Mục tiêu
Người xem biết chuyện gì đang xảy ra mà không bị thông báo làm rối hay lặp. Mọi câu tường thuật đều bám sự kiện thật.

## 2. Hàng đợi thông báo (CONFIRMED về nguyên tắc, TUNABLE về số)

| Mức | Ví dụ | Hình thức |
|---|---|---|
| Cao | Đổi chức vụ, Thiên Kiếp, Linh Căn hiếm (hệ số ≥ ×4), cơ duyên hiếm | Chữ + TTS |
| Trung | Lên Đại Cảnh, kết quả khiêu chiến, cơ duyên thường, quà lớn | Chữ + TTS hoặc chỉ chữ |
| Thấp | Đo Linh Căn thường, nhắc người mới đo | Chỉ chữ, có thể gộp |
| Chỉ chữ | Lên tiểu cảnh (nếu có), nhận linh thạch nhỏ | Chỉ chữ |

- Mọi thông báo đi qua một hàng đợi trung tâm có ưu tiên.
- Thông báo ưu tiên thấp có thể gộp hoặc bỏ khi hàng đợi dài (không áp dụng cho sự kiện camera, SS-07).

## 3. Gộp và nhịp (TUNABLE)
- Tối đa khoảng 1 câu TTS mỗi 3–4 giây.
- Nhiều người đột phá hoặc đo cùng lúc → gộp thành một câu ("Chúc mừng 3 vị đạo hữu...").
- Quà lặp → gộp theo streak (SS-05 mục 8).
- Không đọc tên người chơi chưa qua kiểm duyệt (SS-14 mục 6).

## 4. TTS (OPEN-40)
- TTS chạy local, miễn phí (D-008).
- Chất lượng tiếng Việt và đọc tên có ký tự đặc biệt **chưa được kiểm chứng**. Phải thử trong PoC trước khi dùng cho sự kiện lớn.
- Nếu chất lượng chưa đạt: dùng chữ hoặc giảm TTS xuống mức cao nhất.

## 5. Tường thuật AI (CONFIRMED về nguyên tắc)

**Nguyên tắc:**
- Bám sự kiện thật từ ledger, không bịa sự kiện, không bịa con số.
- Không nhắc tên người chơi không xuất hiện trong sự kiện.
- Không spam: giới hạn tần suất và độ dài.
- Không nội dung chính trị, xúc phạm, hoặc kích động.

**Triển khai (TUNABLE):**
- Ưu tiên mẫu câu đã duyệt, điền dữ liệu từ sự kiện.
- Nếu dùng mô hình sinh văn bản, đầu vào chỉ gồm dữ liệu sự kiện đã xác thực. Đầu ra được kiểm tra: tên và con số phải khớp sự kiện.
- Mẫu câu thất bại kiểm tra thì không đọc, ghi log.

## 6. Mẫu câu đã có và trạng thái
File `04_CONTENT/SYSTEM_VOICE_LINES_v0.1.md` có các mẫu câu. Trạng thái (TUNABLE):
- Mẫu liên quan **Tâm Ma** (HEART_DEMON_START, các mẫu trợ đạo) **SUPERSEDED**, không dùng vì cơ chế đã bỏ (SS-06 mục 8).
- Mẫu liên quan **Chân Tiên** cần đổi thành **Tiên Cảnh** (OPEN-29).
- Mẫu liên quan **vũ khí, pháp bảo** trong cơ duyên cần cập nhật theo SS-06 mục 6.
- Mẫu liên quan quà và Trợ Chiến dùng được, nhưng phải khớp SS-08 mục 4.

## 7. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| TTS lỗi giữa câu | Hiển thị chữ, bỏ phần đọc, ghi log |
| Tên có ký tự không đọc được | Dùng tên thay thế (SS-14 mục 6) |
| Hàng đợi TTS đầy | Gộp; thông báo ưu tiên thấp bị bỏ |
| Tường thuật không khớp sự kiện | Không đọc, ghi log |

## 8. Nghiệm thu
- Ba thông báo cao đến cùng lúc → đọc theo ưu tiên, không chồng lên nhau.
- Mười người đo Linh Căn trong 3 giây → một câu gộp.
- Tên vi phạm không được đọc.
- Không có câu tường thuật nhắc đến sự kiện không có trong ledger.
- Không có câu nào nhắc Tâm Ma.

## 9. Nhãn
- CONFIRMED: mục 2 (phân mức), mục 5 (nguyên tắc tường thuật).
- TUNABLE: mục 2 (số), mục 3, mục 5 (triển khai), mục 6, mục 7, mục 8.
- SUPERSEDED: mẫu Tâm Ma và các mẫu liên quan thất bại.
- OPEN: OPEN-40 (chất lượng TTS), OPEN-29 (đổi tên Chân Tiên).
