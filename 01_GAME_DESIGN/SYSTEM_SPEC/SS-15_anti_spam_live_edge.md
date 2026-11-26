# SS-15 — Chống spam, điều kiện LIVE, reconnect và trường hợp biên LIVE

## 1. Mục tiêu
Người chơi chỉ nhận tiến trình từ hiện diện và tương tác hợp lệ. Mất kết nối không làm mất tiến trình, và không tạo tiến trình ảo.

## 2. Điều kiện LIVE hợp lệ (OPEN-22, khung TUNABLE)

Một nhân vật được coi là **hiện diện hợp lệ** khi:
1. Có sự kiện join từ nguồn LIVE đã được chấp nhận (adapter hoặc Local Simulation).
2. Có heartbeat trong khoảng 45 giây gần nhất (TUNABLE, heartbeat mỗi 15 giây).
3. Không bị chặn, không bị hạn chế bởi kiểm duyệt.
4. Phiên hiện tại là phiên duy nhất của định danh đó (SS-15 mục 4).

Nếu nguồn chỉ cung cấp join và leave (không có heartbeat), thời gian hợp lệ = khoảng giữa join và leave, có trần theo heartbeat ngoài (TUNABLE). Không gọi là "thời gian xem" (GDD_MASTER mục 7).

Không có điều kiện "hoạt động" (ví dụ phải chat) để tu luyện. Đây là đề xuất để tránh phạt người xem yên lặng (OPEN-21 xác nhận).

## 3. Reconnect (CONFIRMED về yêu cầu, TUNABLE về số)

- **CONFIRMED:** reconnect lưu trạng thái **ngay lập tức** khi rớt, và khôi phục đúng khi quay lại.
- **TUNABLE:** grace 60 giây. Trong grace, không cộng Tu Vi theo thời gian.
- **TUNABLE:** credit bù thời gian tối đa sau grace = 0. Không bù lại thời gian mất mạng. (OPEN-21)
- Khi quay lại trong grace: tiếp tục từ trạng thái đã lưu, không cộng trùng.
- Khi quay lại sau grace: tính như offline (SS-01). BOT dừng, quyền trả về.
- Không có tiến trình từ kết nối treo: heartbeat cũ quá 45 giây không được tính.

## 4. Phiên trùng lặp (TUNABLE)
- Chỉ một phiên hoạt động cho một định danh tại một thời điểm.
- Phiên thứ hai đến: phiên đầu được giữ nếu còn heartbeat, phiên thứ hai bị từ chối tiến trình cho đến khi phiên đầu hết hạn.
- Không cộng gấp đôi tu luyện từ hai phiên.

## 5. AFK (OPEN-21)
- Không có định nghĩa AFK theo hoạt động.
- Đề xuất: AFK chỉ liên quan đến heartbeat (SS-15 mục 2). Người xem đang mở LIVE và còn heartbeat vẫn được tính, dù không tương tác.
- Nếu PO muốn chặn người "treo" (ví dụ mở LIVE nhưng không xem), cần định nghĩa tín hiệu hợp lệ. Hiện không có.

## 6. Tim và like (CONFIRMED về cơ chế, TUNABLE về số)

- Mỗi tim/like hợp lệ cộng `5 × hệ số Linh Căn` Tu Vi (SS-02 mục 4.2).
- **Giới hạn người:** tối đa 60 tương tác hợp lệ mỗi phút mỗi người (TUNABLE, từ GAME_FLOW §6).
- **Vượt giới hạn:** không cộng Tu Vi. Vẫn ghi nhận để thống kê (TUNABLE).
- **Gộp theo lô:** tương tác được gộp trong cửa sổ 1 giây để giảm số cập nhật (TUNABLE).
- **Giới hạn toàn cục:** tối đa N tương tác mỗi giây toàn phiên (TUNABLE, cần mô phỏng). Vượt thì ghi nhận nhưng không cộng.
- **Client không được gửi giá trị tim** (FEATURE_SPEC §1). Server quyết định.

## 7. Bình luận (comment) (OPEN-39)

Checkpoint ghi: "Like/comment rewards use a dedicated conversion system with anti-spam/farming and valid interaction rules." Giá trị thưởng cho bình luận **chưa được định nghĩa**.

**Đề xuất (TUNABLE):**
- Một bình luận hợp lệ cộng Tu Vi nhỏ (đề xuất: bằng 1 × hệ số Linh Căn, tức bằng 1/5 tim).
- Bình luận trùng lặp hoặc lặp ký tự được coi là spam và không được cộng.
- Bình luận có trong lệnh (khiêu chiến, chọn phe) không tính thưởng thường.
- Giới hạn: 20 bình luận có thưởng mỗi phút mỗi người (TUNABLE).

## 8. Chống farm (TUNABLE)
- Dedup theo event id và theo nội dung khi nền tảng cung cấp.
- Phát hiện tương tác đồng loạt từ nhiều tài khoản mới trong thời gian ngắn: đánh dấu, không tự động cấm.
- Không cho nhận Tu Vi từ việc tự tương tác với chính mình (ví dụ tài khoản phụ tặng quà cho tài khoản chính).
- Mọi phát hiện ghi audit log để operator xem.

## 9. Điều tiết tải (CONFIRMED về nguyên tắc, TUNABLE về số)
- Ưu tiên gameplay và gộp sự kiện nhỏ, thông báo (checkpoint).
- Sự kiện trọng yếu (camera, đột phá, Boss) không bị bỏ dù tải cao (SS-07).
- Tương tác vượt giới hạn: không cộng thưởng, nhưng không gây sập hệ thống.
- Operator có nút tạm dừng nhận sự kiện (SS-14 mục 9).

## 10. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Rớt mạng rồi quay lại trong 60 giây | Tiếp tục đúng trạng thái, không cộng trong grace |
| Rớt mạng quá 60 giây | Offline; BOT tiếp quản (SS-01) |
| Heartbeat chậm nhưng vẫn về | Trong ngưỡng 45 giây thì hợp lệ, không cộng đoạn bị trễ |
| Gửi tim lặp đúng cùng id | Chỉ tính một lần |
| Adapter gửi sự kiện trễ sau khi người xem rời | Không cộng thời gian sau thời điểm rời đã ghi nhận |
| Hai nguồn cùng gửi một sự kiện | Dedup theo id chuẩn |
| Phiên LIVE kết thúc | Chốt trạng thái, không cộng sau khi kết thúc |

## 11. Nghiệm thu
- Rớt mạng 30 giây rồi về: Tu Vi không tăng trong 30 giây đó, trạng thái khớp trước khi rớt.
- Gửi cùng một tim 3 lần → cộng một lần.
- 61 tim trong một phút từ một người → cộng 60, ghi nhận đủ 61.
- Một người mở hai phiên → chỉ một phiên tính tiến trình.
- Không có đường nào cộng tiến trình từ client gửi giá trị.

## 12. Nhãn
- CONFIRMED: mục 3 (lưu tức thời và khôi phục đúng), mục 6 (cơ chế và không tin client), mục 9 (nguyên tắc).
- TUNABLE: mục 2 (heartbeat và điều kiện), mục 3 (grace), mục 4, mục 6 (số), mục 7, mục 8, mục 10, mục 11.
- OPEN: OPEN-21 (credit, AFK), OPEN-22 (điều kiện LIVE đủ điều kiện), OPEN-39 (giá trị comment).
