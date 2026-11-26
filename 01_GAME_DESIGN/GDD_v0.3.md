# Game Design Document — TuTienGioi v0.3

> **Trạng thái (2026-11-27): LỊCH SỬ / ĐÃ THAY THẾ MỘT PHẦN.** Tài liệu này giữ để truy vết. Thẩm quyền hiện tại là `01_GAME_DESIGN/GDD_MASTER.md` và `01_GAME_DESIGN/GAME_FLOW_MASTER.md`, bám checkpoint `00_PROJECT/TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md`. Xung đột được ghi trong `00_PROJECT/GDD_CONFLICT_REPORT.md`. Không dùng các số liệu, thất bại đột phá, Tâm Ma, trang bị hay pháp bảo trong tài liệu này làm quyết định.

> Trạng thái: **bản đặc tả sản phẩm cập nhật theo GAME_FLOW_v0.1 và D-009..D-018**. Các thông số kinh tế chưa được PO khóa vẫn mang nhãn **ĐỀ XUẤT / DÙNG TẠM**. Đây là tài liệu thiết kế, không phải xác nhận tính khả thi của kết nối TikTok.

## 1. Tóm tắt sản phẩm

TuTienGioi là game tu tiên tương tác được trình chiếu trên TikTok LIVE. Người xem trở thành tu sĩ có nhân vật chibi riêng trong một tông môn. Họ tích lũy Tu Vi theo thời gian hiện diện hợp lệ, nhận Linh Thạch từ tương tác được hỗ trợ, thăng cảnh giới, nhận cơ duyên, khiêu chiến và tranh chức vụ trong tông môn.

Trải nghiệm có hai lớp song song:
- **Lớp cá nhân:** nhân vật, Linh Căn theo phiên, Tu Vi, cảnh giới, vật phẩm, công pháp, vũ khí, Chiến Lực, chức vụ và danh hiệu.
- **Lớp cộng đồng:** đại điện, Linh Khí Triều, Trợ Chiến, bảng xếp hạng, thông báo và các sự kiện chung.

## 2. Trải nghiệm cốt lõi

1. Người xem được nhận diện qua nguồn sự kiện hợp lệ hoặc Local Simulation.
2. Game tạo hoặc khôi phục hồ sơ tu sĩ.
3. Người chơi được gán một nhân vật chibi ngẫu nhiên, cố định theo tài khoản/định danh bền vững được phép sử dụng.
4. Người mới tự động đến Đá Đo Linh Căn; Linh Căn được đo ngẫu nhiên một lần trong mỗi phiên LIVE.
5. Tu sĩ bắt đầu tu luyện; Tu Vi tăng theo thời gian hiện diện hợp lệ và hệ số Linh Căn.
6. Tim, quà và cơ duyên có thể cấp Linh Thạch, Tu Vi, vật phẩm hoặc hiệu ứng theo bảng quy đổi công khai.
7. Đủ điều kiện thì người chơi đột phá; thất bại không làm mất Tu Vi.
8. Ngoại hình, trang phục, hào quang và danh hiệu thể hiện tiến trình.
9. Người chơi đủ điều kiện có thể khiêu chiến người chơi khác hoặc ghế chức vụ.
10. Những sự kiện quan trọng được thông báo bằng chữ và giọng đọc Thiên Đạo/Hệ Thống.

## 3. Thế giới và hệ thống chức vụ

### 3.1 Không gian chính

Một đại điện tông môn là bối cảnh LIVE chính. Bố cục phải thể hiện rõ thứ bậc và tạo cảm giác có nhiều tu sĩ cùng sinh hoạt trong một thế giới liên tục.

### 3.2 Ghế và nhân vật chủ trì

- **Thái Thượng Tông Chủ:** nhân vật host mặc định. Khi một người chơi giành ghế Tông Chủ, host chuyển lên vị trí Thái Thượng Tông Chủ và không thể bị khiêu chiến.
- **Tông Chủ:** một ghế do người chơi đủ điều kiện khiêu chiến và giành được; có thể bị thách đấu theo luật.
- **Trưởng Phái:** các ghế lãnh đạo cấp trung; số ghế và ngưỡng cảnh giới là thông số cấu hình.
- **Trưởng Lão:** các ghế trưởng lão; số ghế và ngưỡng cảnh giới là thông số cấu hình.
- **Đệ tử:** tất cả người chơi khác.

Việc người chơi giành chức vụ là một phần của MVP theo D-012. Chức vụ, người giữ ghế và Chiến Lực phải được lưu qua các phiên LIVE. Nếu người giữ ghế rời LIVE, hệ thống dùng hồ sơ đã lưu để đại diện cho họ khi bị thách đấu; không được giả vờ người đó vẫn đang trực tuyến.

## 4. Hồ sơ người chơi và nhân vật

Hồ sơ tối thiểu:
- Định danh người chơi được phép lưu; tên hiển thị đã qua kiểm duyệt.
- ID nhân vật chibi cố định.
- Linh Căn của phiên hiện tại.
- Tu Vi, Đại Cảnh, Tiểu Cảnh.
- Linh Thạch/nguồn nhận đã được tự động luyện hóa theo D-014.
- Đan dược, công pháp, vũ khí, pháp bảo.
- Chiến Lực, chức vụ, Đạo Hiệu và Danh Hiệu.
- Lịch sử sự kiện quan trọng và thời điểm cập nhật.

**D-013:** nhân vật được phân ngẫu nhiên một lần và cố định theo người chơi; không có tính năng đổi nhân vật. Ngoại hình được nâng cấp qua trang phục, phụ kiện và hào quang theo tiến trình.

**D-009:** Linh Căn được đo lại ngẫu nhiên một lần ở mỗi phiên LIVE. Tu Vi, cảnh giới, vật phẩm và chức vụ được lưu qua phiên.

Tên hiển thị có thể thay đổi theo nền tảng. Không dùng tên hiển thị làm khóa hồ sơ duy nhất. Chỉ lưu định danh bền vững khi nguồn dữ liệu và cách sử dụng được phép; nếu không có định danh ổn định thì phải có quy tắc xử lý hồ sơ tạm và không tự gộp người chơi.

## 5. Linh Căn và tu luyện

### 5.1 Bảy bậc Linh Căn

Bảng sau là cấu hình **dùng tạm để mô phỏng**, chưa khóa:

| Bậc | Linh Căn | Hệ số Tu Vi đề xuất | Tỷ lệ đề xuất |
|---|---|---:|---:|
| 1 | Tạp Linh Căn | ×1,00 | 40% |
| 2 | Tứ Linh Căn | ×1,20 | 25% |
| 3 | Tam Linh Căn | ×1,40 | 18% |
| 4 | Song Linh Căn | ×1,70 | 10% |
| 5 | Nhất Phẩm Linh Căn | ×2,00 | 5% |
| 6 | Thiên Linh Căn | ×2,50 | 1,8% |
| 7 | Dị Linh Căn (Lôi/Băng/Phong) | ×3,00 | 0,2% |

Tỷ lệ Linh Căn độc lập với quà tặng. Không bán lượt quay hoặc cơ hội tăng xác suất Linh Căn.

### 5.2 Tu Vi theo thời gian

Công thức đề xuất:

`TuVi_tich_luy = thoi_gian_hien_dien_hop_le × toc_do_goc × he_so_linh_can`

- Tốc độ gốc 1 Tu Vi/giây là giá trị thử nghiệm, chưa khóa.
- Chỉ tính thời gian hiện diện mà nguồn sự kiện có thể chứng minh hoặc xác nhận theo chính sách được phép.
- Không gọi đây là “thời gian xem chính xác” nếu connector chỉ cung cấp join/leave hoặc hoạt động tương tác. Khi không đo được thời gian xem, dùng thuật ngữ **thời gian tham gia hợp lệ**.
- Reconnect có grace period, heartbeat, dedup và giới hạn bù thời gian phải được định nghĩa ở đặc tả kỹ thuật.

## 6. Tài nguyên và tương tác

### 6.1 Linh Thạch

Theo D-014, Linh Thạch nhận từ tim/quà được tự động luyện hóa thành Tu Vi, không tồn tại như tiền tệ để mua đan dược.

Quy đổi đề xuất trong GAME_FLOW:
- Hạ Phẩm → 10 Tu Vi (mô phỏng ban đầu).
- Trung Phẩm → 100 Hạ Phẩm.
- Thượng Phẩm → 100 Trung Phẩm.
- Cực Phẩm → 100 Thượng Phẩm.

**Kết quả mô phỏng:** quy đổi 10 Tu Vi/Hạ Phẩm khiến tim có thể đóng góp quá lớn; Claude đề xuất thử mức 3 Tu Vi/Hạ Phẩm. Đây chưa phải quyết định PO. Giữ cả hai kịch bản trong mô phỏng, không tự cập nhật cấu hình production.

### 6.2 Tim

- Tim có thể tạo Hạ Phẩm Linh Thạch theo quy đổi công khai.
- Gộp theo lô; có giới hạn theo người/phút và toàn phiên để chống spam.
- Không giả định mọi lượt tim đều có thể được nhận dạng riêng lẻ theo người gửi. Nếu nguồn chỉ cung cấp tổng hoặc sự kiện không đầy đủ, không phân bổ tùy tiện cho từng cá nhân.
- Tim cũng có thể đóng góp cho sự kiện cộng đồng Linh Khí Triều hoặc Tâm Ma theo điều kiện cấu hình.

### 6.3 Quà tặng

Theo D-010 và D-018:
- Quà tặng là nguồn doanh thu chính và có thể đóng góp vào Tu Vi/vật phẩm/Chiến Lực không giới hạn theo phương án PO đã chọn.
- Mọi phần thưởng gắn với một loại quà phải **cố định, biết trước và công khai**.
- Không có quay thưởng, hộp bí ẩn, rút thăm hoặc phần thưởng ngẫu nhiên được kích hoạt bằng thanh toán.
- Quà có thể tạo lợi thế cạnh tranh đáng kể. Đây là lựa chọn thiết kế pay-to-win đã được PO ghi nhận; cần theo dõi phản ứng người chơi và mức độ công bằng khi thử nghiệm.
- Không triển khai quy đổi quà thật trước khi D-007, quyền truy cập sự kiện và chính sách nền tảng được xác minh. Local Simulation dùng bảng giả lập, không đại diện cho khả năng TikTok thật.

## 7. Cảnh giới và đột phá

### 7.1 Thang Đại Cảnh

Thứ tự đề xuất:
Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Hợp Thể → Đại Thừa → Độ Kiếp → Chân Tiên.

Mỗi Đại Cảnh có bốn Tiểu Cảnh: Sơ Kỳ → Trung Kỳ → Hậu Kỳ → Đại Viên Mãn. Ngưỡng Tu Vi là cấu hình kinh tế và còn chờ PO duyệt sau mô phỏng.

### 7.2 Đột phá

- Khi đủ Tu Vi, người chơi được thông báo và bước vào trạng thái đột phá.
- Đột phá có thể thành công hoặc thất bại.
- **D-011:** thất bại không làm mất Tu Vi hay vật phẩm đã sở hữu; có thời gian chờ trước lần thử tiếp theo.
- Tỷ lệ thành công và thời gian hồi chiêu chưa khóa.
- Tâm Ma là lớp tương tác sau thất bại; không được biến thành hình phạt mất tài nguyên.

### 7.3 Hiệu ứng

- Tiểu Cảnh: vòng sáng ngắn, số Tu Vi bay lên; chủ yếu hiển thị chữ.
- Đại Cảnh: cột sáng, linh khí hội tụ, đổi trang phục/hào quang; thông báo ưu tiên cao.
- Thiên Kiếp: mây đen, lôi quang, pháp trận; chỉ chạy một hiệu ứng toàn màn hình tại một thời điểm.
- Đột phá cuối game: cảnh tượng đặc biệt, chỉ triển khai khi tài nguyên art cho phép.

## 8. Cơ duyên

Cơ duyên có thể trao Tu Vi, đan dược, công pháp, vũ khí hoặc pháp bảo. Việc chọn người nhận và loại thưởng là ngẫu nhiên trong nhóm người chơi đủ điều kiện, nhưng:
- Không phụ thuộc việc tặng quà.
- Không bán lượt tham gia hoặc tăng xác suất.
- Có giới hạn tần suất và nhật ký cấp thưởng.
- Bảng phần thưởng và tỷ lệ phải được công khai trong game nếu dùng xác suất.
- Mọi tỷ lệ hiện tại là đề xuất mô phỏng, chưa khóa.

## 9. Khiêu chiến và chức vụ

### 9.1 Điều kiện

Ngưỡng cảnh giới, số ghế và cooldown là cấu hình đề xuất, chưa khóa. GAME_FLOW đưa ra mốc tham khảo: khiêu chiến người chơi từ Trúc Cơ; Trưởng Lão từ Kim Đan; Trưởng Phái từ Nguyên Anh; Tông Chủ từ Hóa Thần.

### 9.2 Chiến Lực

Chiến Lực cơ sở có thể tính từ Tu Vi và chỉ số cộng thêm của công pháp, vũ khí, pháp bảo. Công thức chính xác phải được cấu hình và kiểm thử cân bằng.

Theo D-016, mỗi bên nhận hệ số ngẫu nhiên ±10% trong trận:
`ChienLuc_tran = ChienLuc_co_so × random(0,90; 1,10)`
Bên có Chiến Lực trận cao hơn thắng; nếu bằng nhau, người bị khiêu chiến thắng.

### 9.3 Trợ Chiến

Khi trận đấu bắt đầu, mở cửa sổ Trợ Chiến 30 giây (thời lượng đề xuất). Người xem có thể chọn phe bằng lệnh hoặc thao tác được hỗ trợ. Quà trong thời gian này cộng Chiến Lực theo bảng cố định và công khai. Hết thời gian mới tính hệ số ±10% và công bố kết quả.

Không được mặc định bên nhận hỗ trợ khi người gửi chưa chọn nếu điều đó có thể gây hiểu nhầm; UI phải hiển thị rõ phe đang được chọn và cách hủy/chuyển lựa chọn.

## 10. Hệ thống bảng xếp hạng

Thiên Bảng gồm bốn tab:
- **Tu Vi:** tổng Tu Vi tích lũy.
- **Chiến Lực:** Chiến Lực cơ sở hiện tại.
- **Bế Quan:** thời gian tu luyện hợp lệ trong phiên hiện tại (định nghĩa đề xuất; không được ghi là watch time chính xác nếu nguồn không đo được).
- **Cúng Phụng:** tổng giá trị quà trong phiên LIVE hiện tại; reset khi phiên kết thúc. Chỉ số này cần minh bạch và không được nhầm với Tu Vi hoặc Chiến Lực.

Bảng xếp hạng cần tie-break ổn định, kiểm duyệt tên, phân trang/hiển thị top N và tránh nhấp nháy liên tục. Không hiển thị dữ liệu nhạy cảm hoặc thông tin định danh ngoài tên hiển thị được phép.

## 11. Tông môn và hoạt động cộng đồng

- **Linh Khí Triều:** sự kiện cộng đồng khi tổng lượng tim hợp lệ đạt ngưỡng. Hiệu ứng và thời lượng bonus được cấu hình; mức ×2 trong 3 phút là đề xuất, không phải quyết định.
- **Tâm Ma:** sau đột phá thất bại, cộng đồng có thể dùng tim hợp lệ để trợ đạo, mở lần thử lại sớm hơn. Không được trừ Tu Vi khi thất bại; ngưỡng tim và cooldown là đề xuất.
- **Đạo Hiệu/Danh Hiệu:** danh xưng ngắn thể hiện thành tích, chức vụ hoặc cột mốc; không thay thế tên tài khoản.
- **Thông báo:** sự kiện lớn dùng chữ + TTS; sự kiện nhỏ chỉ dùng chữ hoặc gộp để tránh spam.

## 12. Hệ thống thông báo

Một hàng đợi trung tâm phân ưu tiên:
- Cao: đổi chức vụ, Thiên Kiếp, Linh Căn hiếm, cơ duyên phẩm cao.
- Trung: lên Đại Cảnh, kết quả khiêu chiến, cơ duyên thông thường.
- Thấp: đo Linh Căn thường, lời nhắc người mới.
- Chỉ chữ: lên Tiểu Cảnh, nhận Linh Thạch nhỏ.

TTS chạy local nếu chất lượng tiếng Việt đạt yêu cầu. Tên người chơi phải qua kiểm duyệt trước khi đọc. Giới hạn tốc độ phát và gộp thông báo là yêu cầu bắt buộc.

## 13. MVP và ngoài MVP

### MVP
- Một tông môn, một đại điện.
- Hồ sơ người chơi, nhân vật cố định, Linh Căn mỗi phiên.
- Tu luyện theo thời gian hiện diện hợp lệ.
- Tim/quà qua adapter và Local Simulation.
- Linh Khí Triều, Tâm Ma, Thiên Bảng, Đạo Hiệu/Danh Hiệu, Trợ Chiến.
- Cảnh giới, đột phá, trang phục/hào quang theo cấp.
- Khiêu chiến người chơi và tranh ghế Trưởng Lão/Trưởng Phái/Tông Chủ.
- Thông báo chữ/TTS, bảng điều khiển, lưu và phục hồi dữ liệu.

### Giai đoạn 2
- Yêu Thú Công Sơn.
- Bí Cảnh.
- Sư Đồ.
- Điểm Danh/Bế Quan mở rộng.
- Tông Môn Đại Bỉ.
- Phi Thăng/Tiên Giới hoặc mùa giải cho người chơi đạt trần Chân Tiên.

## 14. Điều kiện nghiệm thu sản phẩm

- Người chơi mới được tạo hồ sơ và nhân vật nhất quán.
- Linh Căn được tạo một lần mỗi phiên và không ghi đè tiến trình bền vững.
- Tu Vi chỉ tăng từ sự kiện hợp lệ, đúng quy tắc và không cộng trùng.
- Đột phá thất bại không làm mất Tu Vi.
- Khiêu chiến tuân thủ ngưỡng, cooldown, công thức và quy tắc hòa.
- Trợ Chiến hiển thị rõ phe và quy đổi cố định.
- Chức vụ được lưu và xử lý đúng khi người giữ ghế offline.
- Thiên Bảng hiển thị đúng chu kỳ reset.
- Có Local Simulation để kiểm thử khi không có TikTok.
- Màn hình dọc dễ đọc, không để VFX che tên/điểm số quan trọng.
- Không phát sinh chi phí dự án bổ sung.

## 15. Quyết định còn mở

1. D-005: engine/stack cuối cùng sau PoC trên máy thật.
2. D-007: cách nhận sự kiện LIVE được phép và khả dụng ở tài khoản/khu vực của PO.
3. D-017: tốc độ Tu Vi, quy đổi tim/quà, ngưỡng cảnh giới, tỷ lệ đột phá/cơ duyên.
4. Các giới hạn số ghế, cooldown, số nhân vật nổi bật, và chu kỳ reset leaderboard.
5. Chất lượng TTS tiếng Việt và quyền sử dụng tài sản art.
