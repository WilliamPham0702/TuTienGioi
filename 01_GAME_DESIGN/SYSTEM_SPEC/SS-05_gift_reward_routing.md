# SS-05 — Quà tặng, định tuyến thưởng và kho chung

## 1. Mục tiêu
Quà là nguồn doanh thu chính (D-018). Phần thưởng phải cố định, biết trước, định tuyến rõ ràng, và không nhận trùng.

## 2. Nguyên tắc (CONFIRMED)
- Mọi phần thưởng gắn với một loại quà phải cố định, biết trước và công khai (D-018).
- Không quay thưởng, hộp bí ẩn, rút thăm, hay phần thưởng ngẫu nhiên kích hoạt bằng thanh toán.
- Quà không tạo trang bị hay pháp bảo (checkpoint).
- Quà đặc biệt có thể kích hoạt sự kiện thế giới (checkpoint).
- Quà cộng Chiến Lực không giới hạn (D-010). Xem OPEN-31 về nguyên tắc proposal.

## 3. Định tuyến theo người gửi (CONFIRMED trừ ghi chú)

| Trạng thái người gửi | Người nhận thưởng | Ghi chú |
|---|---|---|
| Đang LIVE và có nhân vật | Nhân vật của người gửi | Thưởng cá nhân |
| Đang LIVE, chưa có nhân vật | Theo luồng tạo nhân vật bình thường (TUNABLE) | Không tạo trùng |
| Không LIVE | Kho chung (shared-world pool) | **Không tự tạo nhân vật** (CONFIRMED) |
| Tặng cho người chơi đã có nhân vật | Nhân vật đó được nâng cấp | CONFIRMED: "gifts to an existing player enhance their existing character" |

Nếu người gửi đang LIVE và có nhân vật, sự kiện đó đồng thời có thể kích hoạt sự kiện thế giới (mục 6).

## 4. Kho chung và chia đều (CONFIRMED)
- Phần thưởng vào kho chung được chia đều cho người chơi đủ điều kiện đang online.
- Phần dư (không chia hết) được gán ngẫu nhiên cho một người đủ điều kiện.
- Snapshot đủ điều kiện được ghi lại tại thời điểm chia để tránh nhận trùng (TUNABLE).
- Mỗi lần chia có biên nhận (receipt) với danh sách người nhận và số lượng.

Ví dụ: kho chung có 100 Tu Vi, 7 người online → mỗi người 14, dư 2 gán ngẫu nhiên cho một người (tổng 100).

## 5. Bậc quà (TUNABLE, tên tạm)

| Bậc | Tên tạm | Hiệu lực tóm tắt |
|---|---|---|
| 1 | Thường | Thưởng cá nhân nhỏ |
| 2 | Không thường | Thưởng cá nhân + khả năng nhỏ kích hoạt sự kiện nhỏ |
| 3 | Hiếm | Thưởng cá nhân đáng kể và/hoặc sự kiện chung |
| 4 | Sử thi | Sự kiện thế giới lớn hoặc bổ sung chỉ số trận |
| 5 | Huyền thoại | Sự kiện thế giới trình diễn lớn, cộng đồng tham gia |
| 6 | Thần thoại | Sự kiện hiếm toàn server, khoảnh khắc camera riêng |

- Ngưỡng xu (coin) của từng bậc **chưa có**. Phải lấy từ catalog quà TikTok thật, không đoán (OPEN-10).
- Bảng thưởng cụ thể của từng quà **chưa có** (OPEN-10).
- Không đặt ngưỡng dựa trên giá trị không xác thực.

## 6. Quà đặc biệt và sự kiện thế giới (OPEN-11)
- Quà đặc biệt kích hoạt sự kiện thế giới. Danh sách quà nào là đặc biệt chưa có.
- Sự kiện được kích hoạt phải được xếp vào hàng đợi camera (SS-07) đúng ưu tiên.
- Sự kiện từ quà phải nằm trong danh mục sự kiện (SS-06).
- Một quà không được tạo lợi thế vĩnh viễn không thể cân bằng bằng gameplay thông thường (nguyên tắc từ proposal, OPEN-31).

## 7. Chiến Lực từ quà (D-010, CONFIRMED về nguyên tắc)
- Tu Vi và vật phẩm nhận từ quà được tính vào Chiến Lực khiêu chiến, không giới hạn (D-010).
- Quy đổi quà → Tu Vi/vật phẩm/Chiến Lực là bảng cố định, công khai (D-018). Bảng chưa có (OPEN-10).
- Trong Trợ Chiến (SS-08 mục 4), quà cộng Chiến Lực cố định theo bảng riêng (TUNABLE).
- Cúng Phụng (Thiên Bảng) là tổng giá trị quà trong phiên, không tự chuyển thành Chiến Lực (FEATURE_SPEC §2).

## 8. Chống lạm dụng (CONFIRMED về yêu cầu, TUNABLE về số)
- **Dedup theo gift event id.** Một id chỉ ghi nhận một lần.
- **Xác thực:** người gửi, mã quà, số lượng và tính xác thực của sự kiện phải được kiểm tra. Không suy ra giá trị quà từ chuỗi tên không xác thực.
- **Streak:** với quà có streak, chỉ cộng phần tăng thêm của `repeatCount` theo từng streak (TUNABLE, từ TECHNICAL_ARCHITECTURE_PROPOSAL).
- **Gộp:** quà lặp gộp thành một presentation cho camera và thông báo (CONFIRMED: aggregate).
- **Rate limit:** giới hạn số sự kiện quà nhận mỗi giây theo người và toàn cục (TUNABLE).
- **Ledger:** mọi thưởng ghi một bút toán có `ref_event_id` UNIQUE. Retry không được nhân đôi thưởng.
- **Audit:** mỗi quà ghi: sự kiện, người gửi, người nhận, phần thưởng, kết quả sự kiện.

## 9. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Webhook gửi lại cùng sự kiện | Dedup, không nhận lần hai |
| Người gửi rời LIVE trước khi thưởng được ghi | Dùng trạng thái lúc sự kiện xảy ra. Không đổi định tuyến giữa chừng |
| Kho chung không có người online | Giữ trong kho, không chia cho người offline (BOT không nhận quà chung) |
| Quà vượt giới hạn tốc độ | Gộp vào lô tiếp theo, không bỏ |
| Người gửi đang LIVE tặng cho nhân vật đang BOT (người nhận offline) | Nâng cấp nhân vật đó ngay, vì nhân vật vẫn tồn tại và là "người chơi có nhân vật" (TUNABLE, chưa có quy định trong checkpoint) |
| Quà tặng cho người không có định danh | Không gán. Vào kho chung hoặc bỏ (TUNABLE, cần OPEN-23) |

## 10. Nghiệm thu
- Tặng quà khi không LIVE → kho chung, không tạo nhân vật.
- Tặng quà cho người chơi đã có nhân vật → nhân vật được nâng cấp đúng bảng.
- Gửi cùng một sự kiện quà 3 lần → ghi nhận 1 lần.
- 7 người online, kho 100 → chia đều, dư ngẫu nhiên, tổng đúng 100.
- Không có quà nào tạo trang bị hoặc pháp bảo.

## 11. Nhãn
- CONFIRMED: mục 2, 3 (trừ ghi chú TUNABLE của hàng 3), 4, 7 (về nguyên tắc), 8 (về yêu cầu).
- TUNABLE: mục 5 (tên bậc), mục 8 (số), mục 9.
- OPEN: OPEN-10, OPEN-11, OPEN-23, OPEN-31.
