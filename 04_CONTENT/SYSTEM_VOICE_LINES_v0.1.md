# TuTienGioi — System Voice Lines v0.1

> Giọng: Thiên Đạo / Hệ Thống xuyên không. Câu TTS ngắn, tự nhiên, ưu tiên dưới 6 giây. Biến dùng: `{ten}`, `{linh_can}`, `{canh_gioi}`, `{vat_pham}`, `{chuc_vu}`, `{so_luong}`, `{phe}`, `{diem}`.
>
> Quy tắc: TTS chỉ đọc sự kiện có ý nghĩa. Tên phải qua lọc từ ngữ và chuẩn hóa emoji/ký tự lạ. Khi hàng đợi dài, gộp hoặc bỏ thông báo ưu tiên thấp. Không đọc to mọi lượt tim/quà nhỏ.

| Mã sự kiện | Ưu tiên | Cách phát | Biến thể lời thoại |
|---|---|---|---|
| PLAYER_JOIN | Thấp | Chữ; TTS theo lô | 1. “Một vị đạo hữu vừa nhập tông.” 2. “Tân đệ tử đã đến sơn môn.” 3. “Hoan nghênh {ten} gia nhập tông môn.” |
| CALL_MEASURE | Thấp | Chữ + TTS định kỳ | 1. “Tân đệ tử, mau đến Đá Đo Linh Căn.” 2. “Đá Linh Căn đã khai trận, mời đạo hữu tiến lên.” 3. “Các vị tân đệ tử, hãy đến đo Linh Căn.” |
| MEASURE_COMMON | Thấp | Chữ; TTS gộp | 1. “{ten}, đo được {linh_can}.” 2. “Linh Căn của {ten} đã hiển lộ: {linh_can}.” 3. “Đạo hữu {ten}, {linh_can} đã định.” |
| MEASURE_RARE | Cao | Chữ + TTS ngay | 1. “Thiên phú kinh người! {ten} sở hữu {linh_can}.” 2. “Dị tượng xuất hiện! {ten} thức tỉnh {linh_can}.” 3. “Linh quang đại thịnh! Chúc mừng {ten}.” |
| REALM_MINOR | Chỉ chữ | Banner ngắn | 1. “{ten} tiến vào {canh_gioi}.” 2. “Tu vi tinh tiến: {canh_gioi}.” 3. “Lại bước thêm một tầng tiên đồ.” |
| REALM_MAJOR | Trung | Chữ + TTS | 1. “Chúc mừng {ten}, đột phá {canh_gioi}!” 2. “Đại cảnh đã thành! {ten} bước vào {canh_gioi}.” 3. “Linh quang chứng đạo, {ten} đạt {canh_gioi}.” |
| BREAKTHROUGH_START | Trung | Chữ; TTS nếu là đại cảnh | 1. “{ten} chuẩn bị nghênh đón đột phá.” 2. “Linh khí hội tụ, {ten} đang phá cảnh.” 3. “Thiên địa biến sắc, đột phá bắt đầu.” |
| BREAKTHROUGH_SUCCESS | Cao | Chữ + TTS | 1. “Đột phá thành công! Chúc mừng {ten}.” 2. “Đạo tâm kiên định, {ten} đã phá cảnh!” 3. “Thiên địa chứng giám, {ten} bước lên tầng mới.” |
| BREAKTHROUGH_FAIL | Trung | Chữ + TTS ngắn | 1. “Đột phá chưa thành, đạo hữu chớ nản.” 2. “Tâm cảnh chưa vững, hãy tĩnh tâm chờ thời.” 3. “Thiên ý chưa thuận; Tu Vi vẫn được bảo toàn.” |
| TRIBULATION | Cao | Chữ + TTS | 1. “Thiên Kiếp giáng lâm!” 2. “Lôi vân tụ hội, {ten} nghênh kiếp!” 3. “Thiên địa khảo nghiệm người tu đạo!” |
| HEART_DEMON_START | Cao | Chữ + TTS | 1. “Tâm Ma xâm nhập! Chư vị hãy trợ đạo.” 2. “Đạo tâm lung lay, cần linh khí tương trợ.” 3. “Tâm Ma hiện thế! Trợ Đạo đã mở.” |
| HEART_DEMON_AIDED | Cao | Chữ + TTS | 1. “Trợ Đạo thành công! {ten} có thể thử lại.” 2. “Chính khí hội tụ, Tâm Ma tạm lui.” 3. “Đạo hữu đã được toàn tông trợ lực.” |
| OPPORTUNITY_COMMON | Trung | Chữ + TTS | 1. “Cơ duyên giáng xuống! {ten} nhận {vat_pham}.” 2. “Thiên cơ mở lối, {ten} được ban {vat_pham}.” 3. “Chúc mừng {ten}, cơ duyên đã tới.” |
| OPPORTUNITY_RARE | Cao | Chữ + TTS | 1. “Đại cơ duyên! {ten} nhận được {vat_pham}.” 2. “Tiên quang chiếu rọi, {ten} đoạt được {vat_pham}.” 3. “Thiên Đạo ưu ái, {ten} nhận {vat_pham}.” |
| CHALLENGE_REQUEST | Trung | Chữ + TTS | 1. “{ten} phát lệnh khiêu chiến!” 2. “Có người muốn tranh cao thấp!” 3. “Khiêu chiến đã được chấp nhận.” |
| CHALLENGE_START | Cao | Chữ + TTS | 1. “Trận chiến giữa {ten} và đối thủ bắt đầu!” 2. “Hai vị đạo hữu, phân cao thấp ngay hôm nay!” 3. “Chiến trường mở! Xin mời hai bên nhập trận.” |
| ASSIST_OPEN | Cao | Chữ + TTS | 1. “Trợ Chiến mở trong ba mươi giây!” 2. “Chư vị có thể chọn phe và trợ lực.” 3. “Trợ lực đã khai mở, hãy chọn bên.” |
| ASSIST_GIFT | Trung | Chữ; TTS quà lớn | 1. “{ten} trợ lực cho phe {phe}.” 2. “Phe {phe} nhận thêm chiến lực.” 3. “Một luồng linh lực lớn vừa hội tụ!” |
| CHALLENGE_WIN | Cao | Chữ + TTS | 1. “{ten} chiến thắng! Chức vị đã đổi chủ.” 2. “Thắng bại đã phân, {ten} là người thắng.” 3. “Tân chủ nhân của ghế đã xuất hiện!” |
| CHALLENGE_LOSS | Trung | Chữ + TTS | 1. “{ten} tạm thời thất thế.” 2. “Trận này đã khép lại; hẹn ngày tái chiến.” 3. “Đạo hữu hãy tiếp tục tu luyện, chờ lần sau.” |
| ROLE_GRANTED | Cao | Chữ + TTS | 1. “Chúc mừng {ten}, trở thành {chuc_vu}!” 2. “Từ hôm nay, {ten} chấp chưởng {chuc_vu}.” 3. “Toàn tông chứng kiến {ten} nhận chức {chuc_vu}.” |
| HOST_PROMOTED | Cao | Chữ + TTS | 1. “Thái Thượng Tông Chủ đã nhường ghế chấp chưởng.” 2. “Tiền nhiệm Tông Chủ nay trở thành Thái Thượng.” 3. “Thái Thượng Tông Chủ tọa trấn trên điện.” |
| SPIRIT_TIDE_START | Cao | Chữ + TTS | 1. “Linh Khí Triều dâng! Toàn tông cùng tu luyện.” 2. “Linh mạch bừng tỉnh, tu vi tăng tốc!” 3. “Đại điện tràn đầy linh khí!” |
| SPIRIT_TIDE_END | Thấp | Chữ; TTS nếu cần | 1. “Linh Khí Triều đã kết thúc.” 2. “Linh mạch trở về trạng thái bình thường.” 3. “Đợt linh triều khép lại, đạo hữu tiếp tục tu hành.” |
| LEADERBOARD_TOP | Trung | Chữ; TTS top 1 | 1. “{ten} hiện đứng đầu Thiên Bảng.” 2. “Thiên Bảng đổi chủ! Chúc mừng {ten}.” 3. “Tên {ten} đã khắc lên Thiên Bảng.” |
| TITLE_GRANTED | Trung | Chữ + TTS chọn lọc | 1. “Đạo hiệu mới của {ten}: {vat_pham}.” 2. “Danh hiệu vinh dự đã thuộc về {ten}.” 3. “Tông môn ghi nhận công tích của {ten}.” |
| GIFT_THANKS_SMALL | Thấp | Chữ | 1. “Cảm tạ {ten} đã dâng lễ.” 2. “Tông môn ghi nhận tâm ý của {ten}.” 3. “Đa tạ đạo hữu đã trợ lực.” |
| GIFT_THANKS_MAJOR | Cao | Chữ + TTS | 1. “Đa tạ {ten} đã dâng tặng {vat_pham}.” 2. “Linh quang hội tụ, cảm tạ {ten}!” 3. “Tông môn khắc ghi đại lễ của {ten}.” |
| SESSION_END | Trung | Chữ + TTS | 1. “Phiên tu luyện hôm nay đã khép lại.” 2. “Chư vị đạo hữu, hẹn gặp lại ở phiên sau.” 3. “Tiến trình đã được lưu, hẹn ngày tái ngộ.” |

## Quy tắc phát TTS

1. Mặc định tối đa một câu TTS mỗi 3–4 giây; đây là ngưỡng khởi điểm cần thử thực tế.
2. Ưu tiên: chức vụ/chiến thắng → Thiên Kiếp/đại cảnh → Linh Căn hiếm → cơ duyên hiếm → sự kiện cộng đồng → lời chào.
3. Thông báo ưu tiên thấp được gộp: “Có {so_luong} tân đệ tử vừa nhập tông.”
4. Không đọc tên nếu tên chứa từ bị chặn, spam ký tự, URL, emoji dày đặc hoặc có nguy cơ gây hại.
5. Chuẩn hóa số, chữ viết tắt và tên vật phẩm để TTS đọc tự nhiên.
6. Không phát đồng thời nhiều giọng; âm thanh sự kiện lớn được ưu tiên và ducking nhạc nền.
7. Câu cố định nên dùng file âm thanh thu sẵn nếu chất lượng TTS không đạt. Tên và dữ liệu động mới dùng TTS.
