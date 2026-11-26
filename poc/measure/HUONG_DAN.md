# Hướng dẫn chạy bài đo PoC (C-002) trên PC Windows

Tất cả đều **miễn phí**. Không đăng nhập TikTok, không phát LIVE. Bài đo chỉ chạy OBS trên máy.

## Chuẩn bị (làm 1 lần, khoảng 15 phút)

1. Trước khi giải nén: chuột phải file zip → **Properties** → tích **Unblock** (nếu có) → OK. Việc này để Windows không chặn file `.exe` của Godot.
2. **Giải nén** file `TuTienGioi_PoC_C002.zip` vào một thư mục, ví dụ `C:\TuTienGioi_PoC`. Đường dẫn nên không có dấu tiếng Việt.
3. Mở thư mục `measure`, chạy **`1_kiem_tra.bat`**.
   - Nếu báo thiếu **Node.js**: cửa sổ trình duyệt sẽ mở trang tải. Tải bản **LTS** và cài theo mặc định (bấm Next liên tục).
   - Nếu báo thiếu **OBS Studio**: tải tại trang vừa mở, cài theo mặc định.
   - Cài xong thì chạy lại `1_kiem_tra.bat` cho tới khi cả hai dòng đều báo **[OK]**.
4. **Bật WebSocket trong OBS** (để bài đo tự điều khiển OBS):
   - Mở OBS → menu **Tools** → **WebSocket Server Settings**.
   - Tích **Enable WebSocket server**.
   - **Bỏ tích** *Enable Authentication*. (Nếu muốn giữ mật khẩu, xem mục "Gặp lỗi" bên dưới.)
   - Bấm **OK**. Để OBS mở trong suốt lúc đo.

Bài đo sẽ tự tạo 2 scene `PoC-Web` và `PoC-Native` trong OBS, và tự đặt khung hình 1080×1920, 30 fps. Scene cũ của anh không bị xóa.

## Chạy thử (2 phút)

- Chạy **`2_thu_nhanh.bat`**. Trong OBS sẽ thấy cảnh sảnh tông môn chạy trong 1 phút.
- Cuối cùng cửa sổ in ra một dòng kết quả (fps, CPU, PASS/FAIL). Thấy dòng đó là bộ đo đã hoạt động.

## Đo đầy đủ (khoảng 2,5 giờ, có thể để máy tự chạy)

1. Đóng các ứng dụng khác. Laptop thì **cắm sạc**.
2. Chạy **`3_do_day_du.bat`**. Trong lúc đo **không dùng máy**.
   - Gồm 12 lần đo: Phaser (Web), Godot (Web), Godot (exe) × 40/60/80 nhân vật, cộng bài "bão đột phá".
   - Cuối cùng OBS tự quay **3 video 60 giây** (mỗi engine 1 video) để so sánh hình ảnh.
   - Khi chạy bản Godot exe, Windows có thể hỏi quyền mạng: chọn **Allow**. Bản này chỉ gửi số liệu về chính máy anh (localhost).
3. Chạy **`4_game_core.bat`** (khoảng 3 phút): đo phần xử lý dữ liệu mô phỏng trên máy anh.
4. Chạy **`5_gom_ket_qua.bat`**: tạo file **`TuTienGioi_PoC_ketqua.zip`** trên Desktop.

## Gửi lại cho Claude

- File `TuTienGioi_PoC_ketqua.zip` trên Desktop (nhỏ, vài MB).
- **3 video** mới nhất trong thư mục ghi hình của OBS (xem ở OBS → Settings → Output → Recording Path). Video khá nặng, anh có thể gửi qua Google Drive/OneDrive.

Gói đo **không** lưu tên máy, tên người dùng hay bất kỳ thông tin tài khoản nào. Nó chỉ lưu cấu hình phần cứng (CPU, RAM, card đồ họa, Windows) và số liệu đo.

## Gặp lỗi

| Hiện tượng | Cách xử lý |
|---|---|
| `OBS WebSocket: cannot connect` | OBS chưa mở, hoặc chưa bật WebSocket (bước 4) |
| `OBS WebSocket needs a password` | Bỏ tích *Enable Authentication*, hoặc chạy: `node run.mjs --all --password MATKHAU` |
| OBS hiện màn hình đen ở scene `PoC-Native` | Trong OBS, bấm đúp nguồn **PoC Godot Window** → chọn cửa sổ *TuTienGioi PoC Godot* → OK, rồi chạy lại |
| `WARNING: no frame data received` | Scene trong OBS không hiển thị game. Chụp màn hình OBS gửi Claude |
| Windows chặn file `.bat` (SmartScreen) | Bấm **More info** → **Run anyway**. Các file `.bat` chỉ gọi Node.js và PowerShell, mở bằng Notepad là đọc được nội dung |

Nếu anh muốn xem thử cảnh mà không đo: chạy `node run.mjs --serve` trong thư mục `measure`, rồi mở trình duyệt vào `http://localhost:8787/phaser/index.html?n=60&hud=1` hoặc `http://localhost:8787/godot-web/index.html?n=60&hud=1`.
