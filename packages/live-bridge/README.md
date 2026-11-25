# @tutiengioi/live-bridge — cầu nối nguồn sự kiện → lõi game → màn hình OBS

```
TikTok LIVE (chỉ đọc) ─┐
                       ├─► TikTokMapper ─► Bridge ─► lõi game (packages/core) ─► SQLite
Mô phỏng / operator ───┘                     │
                                             └─► WebSocket /ws ─► màn hình OBS (Browser Source 1080×1920)
                                                               └─► trang operator
```

- **Chạy trên PC của streamer**, chỉ nghe ở `127.0.0.1` (máy khác trong mạng không vào được).
- **Màn hình hiện tại là màn hình TẠM** (`public/overlay.html`): chấm tròn và chữ, chưa có art. Nó chỉ để kiểm tra dữ liệu chạy đúng. Client Phaser thật sẽ đọc cùng gói dữ liệu ở `/ws`.
- **Đọc TikTok chưa từng chạy với LIVE thật.** Tên trường lấy từ định nghĩa kiểu của thư viện; phải đối chiếu với `report.txt` của `packages/tiktok-probe`.

## Dùng trên Windows (không cần biết code)
Cần Node.js 22.7 trở lên (bản LTS ở https://nodejs.org).

1. Bấm đúp `1_cai_dat.bat` (một lần).
2. Bấm đúp `2_thu_mo_phong.bat`: chạy bằng dữ liệu giả, trình duyệt tự mở màn hình game và trang operator. Ở trang operator có nút tạo người xem giả, thả tim, tặng quà, gõ `!ung A`.
3. Khi đã có kết quả thăm dò TikTok: bật LIVE trên điện thoại, bấm đúp `3_chay_tiktok.bat`, nhập tên tài khoản.

Trong OBS: thêm **Browser Source**, URL `http://127.0.0.1:8787/`, rộng 1080, cao 1920.

## Dòng lệnh
```
npm install
npm run sim                                     # dữ liệu giả
npm start -- --source tiktok --user ten_tai_khoan
npm start -- --help                             # mọi tùy chọn
npm test && npm run typecheck
```
Dữ liệu lưu ở `data/game.sqlite` (commit mỗi 5 giây và khi thoát bằng Ctrl+C). Mỗi lần chạy là **một phiên LIVE mới** (linh căn đo lại, Thiên Bảng phiên về 0); thêm `--tiep-tuc` để chạy tiếp phiên vừa bị tắt đột ngột.

## Gói dữ liệu `/ws`
- `{type:'state', state}` mỗi 250 ms: người chơi đang hiện diện (tối đa 60, ưu tiên chức vụ rồi Tu Vi), ghế, Linh Khí Triều, trận khiêu chiến, 4 tab Thiên Bảng. Kiểu ở `src/view.ts`. **Không chứa ID TikTok**: mỗi người có `key` băm.
- `{type:'announce', items}`: thông báo đã qua hàng đợi của lõi (mục `speak` là mục cần đọc to khi có TTS).
- Kết nối `?role=operator` từ chính máy này nhận thêm `{type:'status'}` và được gửi `pause`, `resume`, `fake`. Màn hình OBS chỉ nhận, không điều khiển được.

## Quy ước TẠM (cần PO duyệt)
- Người lạ bình luận, thả tim hay tặng quà được tự cho vào game.
- Mọi hoạt động của một người tính là "còn đang xem". TikTok có thể không báo người xem im lặng, nên ai không làm gì 30 giây sẽ hết hiện diện (`presenceTimeoutMs` trong core). Chờ kết quả thăm dò để chỉnh.
- Bình luận bắt đầu bằng `!` là lệnh. Quà combo chỉ tính khi chuỗi kết thúc.

## Cảnh báo
- `tiktok-live-connector` **không phải API chính thức** của TikTok, có thể ngừng hoạt động bất cứ lúc nào. Nó là phụ thuộc *tùy chọn*; chế độ mô phỏng chạy không cần nó.
- Giấy phép của thư viện là **AGPL-3.0-only**; tác động lên game chưa được xác minh, PO cần cân nhắc.
- Điều khoản TikTok và chính sách kiếm tiền LIVE chưa được xác minh.
