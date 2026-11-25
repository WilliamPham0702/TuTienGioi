# C-004 — Công cụ vận hành: lọc tên, nhật ký kiểm toán, bảng điều khiển, thiết kế công cụ GM

- Owner: Claude · Ngày: 2026-11-25 · Nhánh: `claude/c-004-operator-tools`
- Phạm vi: phần không cần hình ảnh, làm trong lúc chờ art. Không đổi luật game hay con số đã duyệt.
- Trạng thái: **chờ PO duyệt**, chưa merge.

## 1. Bộ lọc tên xấu — `packages/core/src/moderation.ts`

Tên người xem đi qua bộ lọc **trước khi** hiện lên màn hình hay được đọc to (GDD mục 11).

| Trường hợp | Kết quả |
|---|---|
| Tên tục, chửi (có dấu, không dấu, viết rời "d.i.t m.e", kéo dài "fuuuck", thay số "sh1t") | Thay bằng bí danh **"Đạo hữu #1234"** |
| Tên quảng cáo (link, số điện thoại, "zalo", "telegram") | Thay bằng bí danh |
| Tên trống, ký tự ẩn, ký tự đảo chiều | Bỏ ký tự lạ; trống thì dùng bí danh |
| Tên dài | Cắt còn 20 ký tự |

- Bí danh **cố định theo người chơi**: cùng người thì luôn cùng số, nên vẫn nhận ra nhau trên Thiên Bảng.
- Tên gốc vẫn được lưu (`rawName`) để người vận hành xem trên bảng điều khiển; khán giả không thấy.
- Chống bắt nhầm: từ ngắn chỉ chặn khi đứng riêng ("Long" không bị chặn vì "lon"). Từ trùng chữ khi bỏ dấu ("Lớn"/"lồn", "Các"/"cặc") chỉ chặn khi viết không dấu hoặc đúng dạng tục.
- Đã thử: 23 tên xấu, 5 tên quảng cáo bị chặn; 20 tên thật (Long, Lớn, Chợ Lớn, Đi chợ Tết, Dư Thanh, Cù Lao, Các Bạn...) không bị bắt nhầm.
- Danh sách từ chặn là **bản đầu**. Người vận hành thêm/bớt lúc đang LIVE; tên của người đang xem được áp lại ngay.
- Bắt nhầm thì người vận hành bấm **Duyệt tên**; muốn ẩn một tên lọt lưới thì bấm **Ẩn tên**.
- Giới hạn: không bộ lọc nào bắt được hết. Tên kiểu chơi chữ, ẩn ý vẫn có thể lọt, nên cần người trông LIVE.

## 2. Nhật ký kiểm toán — `packages/core/src/audit.ts`

- Ghi **mọi** thao tác của người vận hành, kể cả thao tác bị từ chối: thời gian, ai làm, làm gì, chi tiết (vd. tên trước → sau), thành công hay không.
- Chỉ ghi thêm, không có lệnh sửa/xóa.
- Mỗi dòng giữ mã băm của dòng trước. Ai sửa tay hoặc xóa một dòng trong file SQLite thì bảng điều khiển hiện **"CẢNH BÁO: bị sửa"** và chỉ ra dòng đầu tiên bị sửa.
- Không ghi mã truy cập hay mật khẩu; chuỗi dài bị cắt.
- Lưu SQLite (có thể dùng chung file với dữ liệu game), hoặc trong bộ nhớ khi chạy thử.

## 3. Bảng điều khiển vận hành — `packages/core/src/dashboard.ts`, `operator.ts`

Một trang web chạy trên chính máy phát LIVE, mở bằng trình duyệt. Tự làm mới mỗi 2 giây.

| Khu vực | Nội dung |
|---|---|
| Đầu trang | Trạng thái Đang chạy / Đang tạm dừng; nút **Tạm dừng**, **Tiếp tục** |
| Tổng quan | Số người đang xem, Linh Khí Triều, trận khiêu chiến đang diễn ra, số thông báo chờ đọc, Thái Thượng Tông Chủ |
| Ghế chức vụ | Ai đang giữ ghế Trưởng Lão / Trưởng Phái / Tông Chủ |
| Thiên Bảng | Top 5 Tu Vi |
| Tìm người chơi | Tìm theo tên/mã, nút **Ẩn tên** / **Bỏ ẩn** |
| Tên bị lọc / bị ẩn | Bí danh, tên gốc, nút **Duyệt tên** |
| Từ chặn | Thêm / bỏ từ chặn |
| Nhật ký thao tác | 20 thao tác gần nhất, có dấu "nguyên vẹn" |

An toàn:
- Chỉ nghe ở `127.0.0.1`: máy khác trong mạng không vào được.
- Cần **mã truy cập** in ra lúc khởi động; mã sai → từ chối (401).
- Trang lạ trên trình duyệt không gửi lệnh hộ được (lệnh cần header riêng chứa mã).
- Tên người chơi luôn chèn dạng chữ thuần, không chạy được mã độc từ tên.

Chạy thử với người chơi giả (chưa nối TikTok):
```
cd packages/core && npm install && npm run dashboard
```
Mở địa chỉ in ra (mặc định `http://127.0.0.1:8790/`), dán mã truy cập. Ảnh chụp: `dashboard_demo.png` trong thư mục dự án.

Chưa có (để sau, khi nối game thật): nút sao lưu, hủy trận khiêu chiến đang treo, nhiều tài khoản vận hành.

## 4. Thiết kế công cụ GM chỉnh tỉ lệ

PO muốn tự chỉnh các con số (vd. Tu Vi lên cấp) mà không cần sửa code. **Chưa làm giao diện.** Phần kiểm tra và áp số đã có trong `packages/core/src/tuning.ts`, có test.

### 4.1 Thông số được chỉnh và giới hạn an toàn

| Thông số | Ý nghĩa | Giới hạn |
|---|---|---|
| Hệ số Tu Vi lên cấp | Nhân toàn bộ 9 Đại Cảnh (0,5 = giảm một nửa như D-020) | 0,1 – 10 |
| Tu Vi mỗi tiểu cảnh, từng Đại Cảnh | Chỉnh riêng một cảnh | 10 – 100.000.000 |
| Tỉ lệ đột phá, từng Đại Cảnh | | 5% – 100% |
| Tu Vi mỗi giây xem | | 0,1 – 100 |
| Tu Vi mỗi Hạ Phẩm Linh Thạch (tim) | | 0 – 1.000 |
| Trần tim mỗi phút | | 0 – 600 |
| Tu Vi mỗi xu quà | | 0 – 10.000 |
| Chiến Lực trợ chiến mỗi xu | | 0 – 100.000 |
| Hệ số từng linh căn | | ×0,5 – ×10 |
| Tỉ lệ ra từng linh căn | Tổng phải đúng 100% | 0 – 100% |
| Khoảng cách cơ duyên | [ngắn, dài] phút | 1 – 120 |
| Dao động Chiến Lực khiêu chiến | | 0 – 50% |

Kiểm tra thêm: cảnh sau phải tốn nhiều Tu Vi hơn cảnh trước; tỉ lệ đột phá không được tăng ở cảnh cao hơn. Sai một điều kiện thì **không đổi gì** và báo lỗi bằng tiếng Việt.

### 4.2 Cách hoạt động đề xuất (chờ PO duyệt)

1. Trên bảng điều khiển có thêm thẻ **"Chỉnh số (GM)"**: mỗi thông số một ô, hiện giá trị đang dùng.
2. Bấm **Xem trước**: hiện bảng cũ → mới (giống bảng cấp đã gửi PO), kèm thời gian xem ước tính mỗi cảnh.
3. Bấm **Áp dụng**: ghi vào nhật ký kiểm toán (từng thông số, cũ → mới), lưu thành một **bộ số có tên và ngày** (vd. `2026-11-25 giảm 50%`).
4. **Áp dụng từ phiên LIVE kế tiếp**, không đổi giữa phiên, để người chơi không thấy thanh Tu Vi nhảy giữa chừng. Có nút "áp dụng ngay" riêng cho trường hợp khẩn cấp, phải xác nhận 2 lần.
5. **Quay lại bộ số trước** bằng một nút (lịch sử các bộ số giữ lại).
6. Người chơi đang ở giữa một tiểu cảnh khi đổi số: giữ nguyên Tu Vi đã có; nếu đã đủ theo số mới thì lên tiểu cảnh ngay ở lần tính kế tiếp.

### 4.3 Câu hỏi cho PO

1. Đổi số có hiệu lực **từ phiên sau** (đề xuất) hay **ngay lập tức**?
2. Có cần nhiều người vận hành với quyền khác nhau (vd. trợ lý chỉ được ẩn tên, không được chỉnh số) không?
3. Có muốn hiện thông báo cho khán giả khi đổi số (vd. "Thiên Đạo điều chỉnh: tu luyện nhanh gấp đôi") không? Có thể dùng làm sự kiện.

## 5. Kiểm thử

`cd packages/core && npm test` → **131/131 đạt** (68 cũ + 63 mới), `npm run typecheck` sạch. Máy cloud, 2026-11-25.

| Phần | Test mới |
|---|---|
| Bộ lọc tên | 46 tên mẫu (chặn / quảng cáo / không bắt nhầm), bí danh, ký tự lạ, thêm/bớt từ |
| Game dùng bộ lọc | Thông báo không đọc tên xấu; ẩn/duyệt/áp lại |
| Nhật ký kiểm toán | Mở lại file vẫn đọc được; phát hiện sửa tay và xóa dòng |
| Operator | Mọi lệnh có nhật ký kể cả bị từ chối; không ghi mã truy cập |
| Bảng điều khiển | HTTP thật: thiếu/sai mã → 401, lệnh vào game và nhật ký, JSON hỏng → 400, gói quá lớn bị chặn, chỉ nghe 127.0.0.1 |
| Chỉnh tỉ lệ | Nhân hệ số, giới hạn, thứ tự cảnh giới, tổng linh căn 100%, cấu hình mới chạy được |
