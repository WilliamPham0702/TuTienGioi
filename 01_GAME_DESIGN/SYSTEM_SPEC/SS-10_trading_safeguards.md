# SS-10 — Giao dịch người chơi và chống gian lận

## 1. Mục tiêu
Cho phép người chơi trao đổi vật phẩm và chuyển linh thạch, nhưng không để gian lận, ép buộc, hoặc hình thành chợ ngoài tầm kiểm soát.

## 2. Phạm vi (CONFIRMED về cho phép, OPEN-18 về ranh giới)
- **CONFIRMED:** giao dịch người chơi được bật trong ranh giới chống gian lận. Chuyển linh thạch được phép.
- **OPEN-18 (mặc định TUNABLE):** không có chợ công khai, không có đấu giá, không có danh sách rao bán chung. Chỉ giao dịch trực tiếp giữa hai người.
- Không chuyển: Tu Vi, cảnh giới, chức vụ, danh hiệu, đạo hiệu, nhân vật, lịch sử thành tích.

## 3. Quy trình giao dịch (TUNABLE)

```
Khởi tạo → Đưa vào (cả hai) → Khóa vật phẩm → Xác nhận (cả hai) → Hoàn tất → Ghi ledger
```

1. Người A gửi lời mời cho người B đang online. B phải chấp nhận rõ ràng.
2. Mỗi bên chọn vật phẩm và linh thạch muốn đưa.
3. Khi một bên bấm khóa, vật phẩm của bên đó bị khóa không cho đổi.
4. Cả hai bên phải xác nhận. Thay đổi sau khi khóa hủy xác nhận của cả hai.
5. Hoàn tất là nguyên tử: hoặc cả hai chuyển, hoặc không chuyển gì.
6. Có thời hạn cho giao dịch (ví dụ 120 giây). Hết hạn thì hủy và hoàn trả.

## 4. Giới hạn (TUNABLE)

| Mục | Giá trị đề xuất |
|---|---|
| Phí chuyển linh thạch | 5% (sink, SS-09 mục 5.2) |
| Số giao dịch mỗi người mỗi giờ | 10 |
| Giá trị linh thạch tối đa mỗi giao dịch | Theo bậc, cần cân bằng (OPEN) |
| Số giao dịch hoàn tất mỗi người mỗi ngày | 50 |
| Thời gian chờ giữa hai giao dịch với cùng một người | 60 giây |
| Điều kiện người nhận | Đang LIVE hợp lệ |

## 5. Không được giao dịch trong các trường hợp (TUNABLE)
- Khi đang trong trận khiêu chiến hoặc Trợ Chiến.
- Khi đang tham gia trận Boss.
- Khi một bên là BOT (sở hữu hoặc lấp chỗ).
- Với nhân vật đang bị khóa bởi quy trình khác (ví dụ đang xác nhận khiêu chiến).

## 6. Chống gian lận (TUNABLE)
- **Nguyên tử:** không chuyển một phần khi lỗi giữa chừng.
- **Chống trùng:** mỗi giao dịch có id duy nhất; retry không nhân đôi.
- **Khóa cả hai đầu:** vật phẩm và linh thạch bị khóa đến khi kết thúc.
- **Ledger:** hai bút toán đối xứng, cùng `ref_event_id`.
- **Phát hiện bất thường:** nhiều giao dịch một chiều (một người chỉ cho, người kia chỉ nhận) trong thời gian ngắn thì đánh dấu để operator xem. Không tự động khóa tài khoản.
- **Báo cáo:** người chơi có thể báo cáo giao dịch. Báo cáo ghi audit log.
- **Không ép buộc:** giao diện không cho phép giao dịch đẩy tự động (không "tặng miễn phí" có điều kiện trong trận).
- **Không tiền thật:** không hỗ trợ giao dịch ngoài game. Không cho phép nhập số tài khoản, số điện thoại hay liên kết ngoài.

## 7. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Một bên rời LIVE trong khi khóa | Hủy giao dịch, hoàn trả |
| Hết thời hạn | Hủy và hoàn trả |
| Lỗi máy chủ giữa chừng | Không chuyển; giao dịch được khôi phục hoặc hủy theo trạng thái đã ghi |
| Hai giao dịch cùng một vật phẩm | Chỉ giao dịch đầu được khóa |
| Người nhận không đủ điều kiện (ví dụ đang trong trận) | Không cho gửi lời mời |

## 8. Không được xảy ra
- Chuyển một phần khi lỗi.
- Chuyển Tu Vi, chức vụ, danh hiệu.
- Giao dịch với BOT.
- Thay đổi vật phẩm sau khi cả hai đã xác nhận.
- Giao dịch âm số dư.

## 9. Nghiệm thu
- A và B đều xác nhận, chuyển đủ hai chiều trong một ledger batch.
- A khóa, B hủy: không chuyển, không có bút toán.
- Hết thời hạn 120 giây: hoàn trả, không có bút toán chuyển.
- Retry cùng id không nhân đôi.
- Giao dịch với BOT bị từ chối.

## 10. Nhãn
- CONFIRMED: mục 2 (cho phép), mục 8 (cấm).
- TUNABLE: mục 3, 4, 5, 6, 7, 9.
- OPEN: OPEN-18 (ranh giới chợ), giá trị tối đa mỗi giao dịch theo bậc.
