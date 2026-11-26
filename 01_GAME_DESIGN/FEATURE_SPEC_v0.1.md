# TuTienGioi — Feature Specification v0.1

> **Trạng thái (2026-11-27): LỊCH SỬ / ĐÃ THAY THẾ MỘT PHẦN.** Tài liệu này giữ để truy vết. Thẩm quyền hiện tại là `01_GAME_DESIGN/GDD_MASTER.md` và `01_GAME_DESIGN/GAME_FLOW_MASTER.md`, bám checkpoint `00_PROJECT/TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md`. Xung đột được ghi trong `00_PROJECT/GDD_CONFLICT_REPORT.md`. Không dùng các số liệu, thất bại đột phá, Tâm Ma, trang bị hay pháp bảo trong tài liệu này làm quyết định.

> Phạm vi: đặc tả sản phẩm cho các tính năng G-003. Mọi con số chưa có quyết định riêng trong DECISION_LOG đều là **ĐỀ XUẤT**. Các tính năng phải chạy được trong Local Simulation và không phụ thuộc connector TikTok thật.

## 1. Linh Khí Triều (MVP)

**Mục tiêu:** tạo mục tiêu cộng đồng, khuyến khích người xem cùng tham gia thay vì chỉ cạnh tranh cá nhân.

**Kích hoạt đề xuất**
- Bộ đếm tích lũy tim hợp lệ của toàn phiên.
- Khi đạt ngưỡng cấu hình X, kích hoạt Linh Khí Triều.
- Hiệu lực đề xuất: ×2 Tu Vi từ thời gian tu luyện hợp lệ trong 3 phút.
- Mỗi chu kỳ có cooldown và trần số lần kích hoạt; X, cooldown và cap phải được cân bằng qua mô phỏng.

**Luồng màn hình**
1. Thanh tiến độ cộng đồng xuất hiện ở vùng thông tin sự kiện.
2. Tim hợp lệ làm thanh tiến độ tăng; số liệu cập nhật theo lô.
3. Khi đạt X, toàn đại điện chuyển ánh sáng, pháp trận xuất hiện.
4. Hiện banner “LINH KHÍ TRIỀU” + đồng hồ 3:00.
5. Nhân vật đang tu luyện nhận hiệu ứng linh khí dày hơn; thanh Tu Vi thể hiện bonus.
6. Hết thời gian, hiệu ứng tan dần và banner kết thúc.

**Phần thưởng:** bonus Tu Vi cho mọi người chơi đủ điều kiện trong thời gian hiệu lực. Không chỉ thưởng người gửi tim cuối cùng.

**Chống lạm dụng:** dedup sự kiện, giới hạn đóng góp theo nguồn, batching, cap kích hoạt, không cho client tự gửi giá trị tim. Nếu nền tảng không cung cấp tim theo người gửi, chỉ dùng tổng cộng đồng và không giả phân bổ cá nhân.

**Tương tác:** tim là điều kiện cộng đồng. Quà không được tự động cộng thêm lượt kích hoạt trừ khi có bảng quy đổi được PO duyệt.

**Art/audio:** sóng linh khí chạy từ cửa điện vào, phù văn sáng dưới chân, cờ và đèn rung nhẹ; âm thanh gió/chuông ngắn, một câu TTS lúc bắt đầu/kết thúc.

**Rủi ro:** không được hứa rằng mọi lượt tim đều được ghi nhận; hiển thị “tim hợp lệ đã ghi nhận”. Tránh animation kéo dài che nhân vật.

## 2. Thiên Bảng (MVP)

**Mục tiêu:** tạo mục tiêu dài hạn, công nhận thành tích và phân tầng hoạt động.

**Bốn tab**
- Tu Vi: tổng Tu Vi tích lũy.
- Chiến Lực: chỉ số chiến đấu cơ sở hiện tại.
- Bế Quan: thời gian tu luyện hợp lệ trong phiên LIVE hiện tại (định nghĩa đề xuất).
- Cúng Phụng: tổng giá trị quà trong phiên hiện tại; reset theo phiên LIVE.

**Luồng UX**
- Bảng đặt ở khu vực overlay bên phải/trên cùng, chỉ mở dạng spotlight khi có sự kiện hoặc người dẫn yêu cầu.
- Mặc định chỉ hiển thị top 3–5; tên, chỉ số, huy hiệu. Không chiếm quá nhiều diện tích đại điện.
- Có chuyển tab tự động theo chu kỳ chậm hoặc thao tác operator; không đổi tab liên tục.
- Top 1 có viền/ánh sáng riêng nhưng không dùng hiệu ứng quá chói.
- Cúng Phụng phải có nhãn “phiên này” để người xem hiểu dữ liệu sẽ reset.

**Quy tắc dữ liệu**
- Tu Vi và Chiến Lực giữ theo hồ sơ.
- Bế Quan và Cúng Phụng tính theo session_id.
- Cúng Phụng không tự chuyển thành Chiến Lực; phần quà chỉ đóng góp theo bảng reward riêng đã công khai.
- Tie-break: chỉ số phụ hoặc thời điểm đạt mốc sớm hơn; quy tắc cuối cùng cần PO duyệt.

**Chống lạm dụng:** kiểm tra duplicate gift IDs, chỉ ghi nhận gift event hợp lệ; không suy ra giá trị quà từ chuỗi tên không xác thực.

**Art/audio:** bảng gỗ/sơn son thếp vàng hoặc ngọc bài tiên gia, typography rõ; âm thanh lật bảng ngắn. Không đọc toàn bộ bảng bằng TTS.

## 3. Tâm Ma (MVP)

**Mục tiêu:** biến thất bại đột phá thành khoảnh khắc cộng đồng trợ giúp, không biến nó thành mất mát trừng phạt.

**Điều kiện**
- Người chơi thất bại đột phá.
- Tu Vi không bị trừ theo D-011.
- Bắt đầu trạng thái Tâm Ma và cooldown chuẩn.
- Người xem có thể đóng góp tim hợp lệ vào thanh “Trợ Đạo”.

**Cơ chế đề xuất**
- Đạt ngưỡng tim X trong cửa sổ thời gian → cho phép thử lại ngay một lần.
- Nếu không đạt X, người chơi chờ hết cooldown rồi thử lại bình thường.
- Không tăng xác suất thành công bằng tim; chỉ rút ngắn thời gian chờ.
- Mỗi lần thất bại chỉ có tối đa một lần kích hoạt Trợ Đạo; chống spam bằng cooldown và cap.
- X, thời lượng cửa sổ và cooldown cần mô phỏng/PO duyệt.

**Luồng màn hình**
1. Màn hình chuyển sang tông tím/đen, bóng Tâm Ma xuất hiện phía sau nhân vật.
2. Hiện “TÂM MA XÂM NHẬP” và thanh Trợ Đạo.
3. Tim hợp lệ lấp đầy thanh theo lô; hiển thị số đã ghi nhận.
4. Đạt ngưỡng: pháp trận bảo hộ sáng, thông báo “Đạo hữu được trợ đạo — có thể thử lại”.
5. Nhân vật chủ động xác nhận thử lại hoặc tự động thử lại nếu PO chọn chế độ tự động.
6. Không đạt ngưỡng: cooldown tiếp tục, không mất tài nguyên.

**Tương tác:** chỉ tim miễn phí trong đặc tả này; không bắt buộc quà để cứu nhân vật.

**Art/audio:** bóng ma mờ, vết nứt năng lượng, vòng pháp trận sáng dần; âm thanh trầm, sau đó chuyển sang tiếng chuông khi được trợ đạo.

## 4. Đạo Hiệu và Danh Hiệu (MVP)

**Mục tiêu:** tạo bản sắc, ghi nhận thành tích và khuyến khích quay lại.

- Đạo Hiệu: danh xưng người chơi có thể hiển thị cạnh tên, có thể do hệ thống cấp theo cột mốc.
- Danh Hiệu: huy hiệu thành tích hoặc chức vụ, ví dụ “Tân Tú”, “Người Độ Kiếp”, “Trấn Điện Trưởng Lão”.
- Chức vụ là trạng thái riêng, không gộp vào cosmetic title.
- Chỉ hiển thị tối đa một Đạo Hiệu và hai huy hiệu nhỏ để tránh rối.
- Không cho phép người chơi tự nhập nội dung tùy ý ở MVP; danh sách chọn lọc do hệ thống quản lý.
- Một số danh hiệu có thể theo mùa/phiên; phải ghi rõ thời hạn.

**UX:** khi đạt mốc, hiện thẻ vinh danh 3–4 giây, sau đó thu về nameplate. Người chơi có thể được nhắc tên bằng TTS ở các danh hiệu hiếm, không đọc liên tục mọi lần đổi title.

**Chống lạm dụng:** cấp dựa trên ledger sự kiện và điều kiện xác định; không cho operator sửa thành tích mà không có audit log.

## 5. Cửa sổ Trợ Chiến (MVP)

**Mục tiêu:** tạo cao trào tương tác trong khiêu chiến và làm rõ đóng góp của người xem.

**Luồng**
1. Hai bên xuất hiện ở khu vực chiến đấu.
2. Hiển thị tên, chức vụ/realm, Chiến Lực cơ sở và luật ±10%.
3. Mở đồng hồ Trợ Chiến 30 giây (đề xuất).
4. Người xem chọn phe bằng lệnh bình luận được hỗ trợ; Local Simulation có nút chọn phe.
5. Quà hợp lệ được cộng Chiến Lực ngay theo bảng cố định, công khai; người gửi phải nhìn thấy phe nhận trước khi gửi hoặc hệ thống phải có quy tắc lựa chọn minh bạch.
6. Kết thúc đồng hồ, khóa đóng góp, áp hệ số ±10%, xác định kết quả.
7. Hiện animation giao chiến 5–8 giây, công bố thắng/thua và cập nhật ghế.

**Tương tác**
- Đấu thủ tặng quà: cộng cho chính họ.
- Người xem khác: cộng cho phe đã chọn.
- Nếu chưa chọn phe: không tự động cộng cho một phía; hiển thị cách chọn hoặc để phần quà không được tính vào trận theo quy tắc công khai.
- Reward per gift cố định; không có random reward.

**Chống lạm dụng:** dedup theo gift ID; giới hạn tốc độ event intake; khóa kết quả một lần; mọi điều chỉnh operator có audit log.

**Art/audio:** thanh lực hai phe, biểu tượng trợ chiến bay vào, đồng hồ lớn, hai nhân vật có pose đối đầu; âm thanh chiến trường tăng dần, một câu TTS cho quà lớn và kết quả.

**Rủi ro:** có thể tạo cảm giác pay-to-win; đây là hướng monetization PO đã chọn, cần minh bạch tỷ lệ và theo dõi churn/complaints. Chưa bật trên LIVE thật trước khi D-007/policy gate được duyệt.

## 6. Yêu Thú Công Sơn (Giai đoạn 2)

**Mục tiêu:** hoạt động hợp tác phòng thủ, tạo mục tiêu chung theo đợt.

- Một yêu thú xuất hiện theo lịch hoặc khi operator kích hoạt.
- Người chơi gây sát thương theo Chiến Lực/đóng góp hợp lệ; quà có thể thêm sát thương theo bảng cố định đã công khai.
- Toàn phòng nhận mốc thưởng chung nếu đạt ngưỡng; phần thưởng cá nhân dựa trên đóng góp có giới hạn để tránh một người chiếm toàn bộ.
- Không có loot box trả tiền. Nếu có vật phẩm ngẫu nhiên thì chỉ được trao qua hoạt động miễn phí và phải có tỷ lệ minh bạch.
- MVP không triển khai; cần mô phỏng tải và cân bằng trước.

**UX/art:** boss chiếm khu vực giữa điện; thanh máu lớn; các đòn đánh được gom thành hiệu ứng theo lô; tránh 100 hiệu ứng nhỏ cùng lúc.

## 7. Bí Cảnh (Giai đoạn 2)

**Mục tiêu:** tạo mục tiêu khám phá và tiến trình ngoài vòng lặp tu luyện.

- Mở theo khung giờ hoặc sự kiện.
- Người chơi tham gia một lượt thử thách theo cấp cảnh giới.
- Kết quả dựa trên chỉ số và lựa chọn đơn giản; tránh yêu cầu thao tác phức tạp khi người chơi chỉ đang xem LIVE.
- Phần thưởng cố định theo mốc hoặc xác suất miễn phí công khai; không bán lượt quay.
- Cần UI cho trạng thái mở/đóng, thời gian còn lại và top thành tích.

## 8. Sư Đồ (Giai đoạn 2)

**Mục tiêu:** giữ chân người chơi lâu năm bằng quan hệ mentor/đệ tử.

- Người chơi đủ cảnh giới có thể nhận số lượng đệ tử giới hạn.
- Tiến trình của đệ tử tạo điểm sư môn cho cả hai; phần thưởng không được nhân vô hạn.
- Có chống tự mời tài khoản phụ, giới hạn số quan hệ và thời gian cooldown.
- Cần luồng chấp nhận rõ ràng; không tự gán quan hệ.

## 9. Điểm Danh và Bế Quan (Giai đoạn 2)

**Mục tiêu:** tạo nhịp quay lại và hoạt động có thể diễn ra giữa các phiên LIVE.

- Điểm danh theo phiên/ngày chỉ khi có bằng chứng hiện diện hợp lệ.
- Bế Quan có thể tích lũy tiến trình offline có giới hạn, nhưng phải tránh cấp tiến trình vô hạn khi game tắt.
- Không gọi là “thời gian xem”; tách rõ tiến trình offline và thời gian tham gia LIVE.
- Công thức, cap và chu kỳ reset phải được PO duyệt.

## 10. Tông Môn Đại Bỉ (Giai đoạn 2)

**Mục tiêu:** sự kiện cạnh tranh theo mùa/đợt.

- Thi đấu theo bảng hoặc vòng loại với quy tắc công khai.
- Chỉ số chiến đấu có thể dùng Chiến Lực nhưng cần chuẩn hóa để không biến sự kiện thành cuộc đua quà đơn thuần.
- Có lịch, bracket, kết quả và danh hiệu mùa.
- Chưa thuộc MVP.

## 11. Nội dung cuối game: Phi Thăng/Tiên Giới (Giai đoạn 2+)

Mô phỏng v0.1 cho thấy nhóm chi tiêu cao có thể tiến gần trần Chân Tiên trong vài tháng theo các giả định hiện tại. Đây không phải dự báo thực tế, nhưng là cảnh báo cần có sink/endgame trước khi kinh tế mở rộng.

Đề xuất:
- Sau Chân Tiên mở Phi Thăng/Tiên Giới hoặc mùa giải danh hiệu.
- Giữ lại danh hiệu/di sản; không reset bắt buộc toàn bộ Tu Vi.
- Nếu có mùa giải, reset chỉ số cạnh tranh theo quy tắc công khai, không xóa hồ sơ/cosmetic đã sở hữu.
- Không triển khai trong MVP.

## 12. Nguyên tắc chung và nghiệm thu

- Mọi tính năng có Local Simulation adapter.
- Không phụ thuộc TikTok LIVE connector chưa được duyệt.
- Không phát sinh chi phí dự án.
- Mọi phần thưởng từ quà cố định, công khai; không có random reward trả tiền.
- Không giả lập dữ liệu người gửi khi connector không cung cấp.
- Có dedup, rate limit, cooldown, audit log cho thay đổi quan trọng.
- Mọi con số là đề xuất cho đến khi PO duyệt.
- Kiểm thử tối thiểu: happy path, spam/burst, duplicate event, reconnect, offline target, operator pause, restart/recovery.
