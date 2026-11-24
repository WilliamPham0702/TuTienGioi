# C-001 — Đề xuất kiến trúc kỹ thuật v0.1

> Chủ trì: Claude (Lead Developer & Technical Architect). Trạng thái: **đề xuất, chờ PO duyệt** (D-005, D-007 vẫn Pending).
> Nguồn: `GAME_FLOW_v0.1.md`, `DECISION_LOG.md` (D-001..D-018), `GDD_v0.1.md`, nghiên cứu web ngày 25/11/2026.
> Chưa viết code game. Chưa đăng ký dịch vụ nào.

## 1. Tóm tắt khuyến nghị

| Hạng mục | Khuyến nghị | Phân loại chi phí |
|---|---|---|
| Hiển thị game | **Phaser 4 + TypeScript**, chạy trong trang web local, OBS đưa vào bằng Browser Source 1080×1920 | Miễn phí (MIT) |
| Lõi game + cầu nối LIVE | **Node.js + TypeScript**, một tiến trình local | Miễn phí |
| Lưu dữ liệu | **SQLite** (file trên máy) | Miễn phí |
| Nhận sự kiện TikTok | **tiktok-live-connector** (Node, không chính thức) + sign server **Euler Stream gói Community miễn phí** | Miễn phí có giới hạn, **chưa kiểm chứng** về điều khoản |
| Giọng đọc | **Piper TTS** với giọng tiếng Việt `vi_VN` (chạy offline) | Miễn phí (MIT), chất lượng **chưa kiểm chứng** |
| Phát LIVE | OBS Studio → TikTok qua stream key, hoặc TikTok LIVE Studio | Miễn phí, **phụ thuộc quyền tài khoản** |
| Bảng điều khiển vận hành | Trang web local (cùng tiến trình Node) | Miễn phí |

Phương án thay thế đã cân nhắc: **Godot 4**. Godot cũng mạnh về 2D và giấy phép MIT. Claude vẫn nghiêng về Phaser vì 3 lý do: dùng chung một ngôn ngữ (TypeScript) với thư viện nhận sự kiện TikTok; OBS Browser Source nhúng thẳng trang web, không phải quay cửa sổ; và AI hỗ trợ sửa code web dễ hơn. Chốt sau PoC (mục 7).

## 2. Kiến trúc

```
TikTok LIVE ──(sự kiện không chính thức)──► [Cầu nối LIVE]
                                               │  chuẩn hóa sự kiện: join, like, gift, comment
[Bộ mô phỏng local] ──────────────────────────►│  (cùng định dạng, dùng khi chưa nối TikTok)
                                               ▼
                                   [Lõi game – Node.js/TS]
                    linh căn · tu vi · cảnh giới · đột phá · cơ duyên
                    khiêu chiến · Trợ Chiến · chức vụ · bảng xếp hạng
                    hàng đợi thông báo · giới hạn tốc độ · SQLite
                         │ WebSocket local           │ WebSocket local
                         ▼                           ▼
            [Màn hình game – Phaser 4]     [Bảng điều khiển vận hành]
             OBS Browser Source 1080×1920   tạm dừng nhận sự kiện, chỉnh thông số,
                         │                  phát sự kiện thử, xem lỗi
                         ▼
                 [OBS] ──RTMP──► TikTok LIVE
[Piper TTS local] ◄── câu thông báo ── lõi game → file âm thanh → màn hình game phát
```

Nguyên tắc:
- **Lõi game là nguồn sự thật duy nhất.** Màn hình chỉ vẽ lại trạng thái; tắt/mở lại trang không mất dữ liệu.
- **Mọi nguồn sự kiện đi qua một định dạng chung**, nên bộ mô phỏng và TikTok thật thay nhau được (đáp ứng yêu cầu "luôn có chế độ mô phỏng").
- Dữ liệu và luật chơi (bảng linh căn, thang cảnh giới, quy đổi quà) nằm trong **file cấu hình**, PO chỉnh được mà không cần sửa code.

## 3. Nhận sự kiện TikTok LIVE (D-007)

**Thực trạng:**
- Theo Euler Stream, TikTok không công bố API chính thức để đọc tương tác LIVE (chat, quà, tim) theo thời gian thực. Claude cũng không tìm thấy API chính thức nào.
- `tiktok-live-connector` là dự án dịch ngược (reverse engineering), không chính thức; tác giả ghi rõ người dùng tự chịu trách nhiệm.
- Thư viện cần **sign server**. Mặc định dùng Euler Stream. Gói Community miễn phí: 2.500 request/ngày, 25 cloud WebSocket, 5 LIVE alert. Gói Business giá $50/tháng → **không được dùng** (D-008).
- Sign server là bên thứ ba nằm giữa app và TikTok. Có thể sập, bị giới hạn tần suất, hoặc hỏng khi TikTok thay đổi.

**Phân loại:** miễn phí có giới hạn + **chưa kiểm chứng** (điều khoản TikTok với việc kết nối không chính thức, độ ổn định, có cần tạo tài khoản Euler hay không).

**Cần PO quyết:** có cho phép tạo **tài khoản Euler miễn phí** (không thẻ) để lấy API key giảm giới hạn tần suất không? Gói miễn phí không phát sinh phí, nhưng vẫn là đăng ký dịch vụ bên ngoài.

**Giảm rủi ro:**
- Cầu nối tự kết nối lại, có trạng thái "mất kết nối" hiện trên bảng điều khiển; game vẫn chạy (mọi người tiếp tục tu luyện theo thời gian).
- Không lưu thông tin đăng nhập TikTok trong code/repo; key để trong biến môi trường (theo AI_HANDOFF).
- Định danh người chơi theo ID người dùng TikTok mà sự kiện trả về; chỉ lưu những gì game cần.

## 4. Phát LIVE từ máy tính — **chặn lớn nhất**

- PO cho biết tài khoản **đã LIVE được trên điện thoại**, còn phát từ máy tính (LIVE Studio/stream key) **chưa xác nhận**.
- Theo các hướng dẫn năm 2026, để có stream key thường cần **1.000 người theo dõi, 18 tuổi trở lên, không bị vi phạm**. Điều kiện có thể khác theo khu vực.
- TikTok LIVE Studio chỉ có trên Windows 10/11, cũng cần đủ điều kiện LIVE.
- **Không** dùng "agency bán stream key" (rủi ro tài khoản, có thể mất phí).
- Nếu không phát được từ máy tính thì game **không lên LIVE được** theo kiến trúc này. Phương án dự phòng (quay màn hình máy tính bằng điện thoại, hoặc chiếu màn hình máy tính lên điện thoại) đều kém chất lượng, chỉ nên dùng để thử.

**Việc PO cần làm sớm:** mở TikTok trên máy tính (hoặc trong app vào phần LIVE) xem có mục **Stream key / LIVE Studio** không, rồi báo lại cho Claude.

## 5. Giọng đọc tiếng Việt

- Piper có sẵn 3 giọng tiếng Việt: `25hours_single`, `vais1000`, `vivos`. Giọng `vais1000` (medium) nặng khoảng 63 MB, giấy phép MIT.
- Có các mô hình tiếng Việt mã nguồn mở tự nhiên hơn (ví dụ VieNeu-TTS-v2, Apache 2.0, chạy được bằng CPU), nhưng nặng hơn; chỉ cân nhắc nếu Piper đọc không đạt.
- Chưa nghe thử. PoC phải đo: đọc tên có ký tự lạ/emoji, độ trễ dưới 1 giây mỗi câu, giọng có hợp "Thiên Đạo" không.
- Câu cố định (ví dụ "Thiên Kiếp giáng lâm!") nên **thu sẵn file âm thanh**; chỉ phần tên người chơi mới cần đọc trực tiếp.

## 6. Hiệu năng và hiển thị

- Mục tiêu: 60 FPS ở 1080×1920 trên máy của PO, với **≤ 60 nhân vật hiện rõ**; người chơi còn lại vẫn lưu và tu luyện, chỉ hiện ở bảng/hàng chờ (GDD mục 3).
- Phaser 4 có renderer WebGL mới, bộ lọc (filter) áp được cho mọi đối tượng → hợp với hào quang, linh khí, thiên kiếp.
- Hiệu ứng lớn (Thiên Kiếp, Trợ Chiến) xếp hàng, mỗi lúc chỉ một hiệu ứng toàn màn hình.
- Tim: gộp theo lô mỗi 1 giây, có trần theo người (GAME_FLOW mục 6).
- Chưa biết cấu hình máy của PO → PoC phải đo trên chính máy đó, chạy cùng OBS.

## 7. PoC đề xuất (chưa làm, chờ duyệt)

| # | Mục | Tiêu chí đạt |
|---|---|---|
| PoC-1 | Phaser 4 + 60 nhân vật chibi tạm (hình khối) + 1 hiệu ứng thiên kiếp, trong OBS Browser Source | ≥ 55 FPS trên máy PO khi OBS đang ghi |
| PoC-2 | Lõi Node + SQLite + bộ mô phỏng 200 người (join, tim, quà) | 0 lỗi mất dữ liệu sau 1 giờ; tắt/mở lại giữ nguyên Tu Vi |
| PoC-3 | Nghe đọc 20 câu thông báo bằng Piper | PO chấm "nghe được"; ≤ 1 giây/câu |
| PoC-4 | Nối thử `tiktok-live-connector` vào một phiên LIVE thật của PO | Nhận được join, tim, quà, bình luận trong 30 phút, không tốn phí |
| PoC-5 | So sánh nhanh Godot 4 (chỉ PoC-1) | Báo cáo so sánh cho PO chốt D-005 |

## 8. Giai đoạn MVP (ước tính, phụ thuộc thời gian PO duyệt)

| Giai đoạn | Nội dung | Ước tính |
|---|---|---|
| P1 | PoC 1–5, chốt D-005, D-007 | 1–2 tuần |
| P2 | Lõi game + mô phỏng: vào phòng, linh căn, tu luyện, cảnh giới, đột phá/Tâm Ma, thông báo | 2–3 tuần |
| P3 | Khiêu chiến, Trợ Chiến, chức vụ, cơ duyên, Thiên Bảng, Linh Khí Triều | 2 tuần |
| P4 | Nối TikTok thật, bảng điều khiển, LIVE thử riêng | 1 tuần |

## 9. Phân loại toàn bộ thành phần

| Thành phần | Giấy phép / chi phí | Phân loại |
|---|---|---|
| Phaser 4 | MIT | Miễn phí |
| Godot 4 | MIT | Miễn phí |
| Node.js, TypeScript | Mã nguồn mở | Miễn phí |
| SQLite | Public domain | Miễn phí |
| OBS Studio | GPL | Miễn phí |
| TikTok LIVE Studio | Ứng dụng TikTok | Miễn phí, cần đủ điều kiện tài khoản |
| tiktok-live-connector | MIT, không chính thức | Miễn phí, **chưa kiểm chứng** về điều khoản |
| Euler Stream Community | Miễn phí, có giới hạn | Miễn phí có giới hạn |
| Euler Stream Business | $50/tháng | **Không chấp nhận** |
| Piper + giọng vi_VN | MIT | Miễn phí, chất lượng chưa kiểm chứng |
| Hình ảnh nhân vật/hiệu ứng | Tự làm / ChatGPT (gói đang có) | Miễn phí, cần kiểm tra quyền dùng thương mại |

## 10. Những điều có thể chặn việc ra mắt với 0 đồng

1. **Không có quyền phát LIVE từ máy tính** (mục 4) — nghiêm trọng nhất.
2. Sign server miễn phí sập/đổi điều khoản → mất sự kiện tim/quà (game vẫn chạy, nhưng không ra tiền).
3. TikTok coi kết nối không chính thức là vi phạm → rủi ro tài khoản. Chưa kiểm chứng; PO nên đọc điều khoản trong app.
4. Máy của PO không đủ mạnh để chạy game và OBS cùng lúc.

## 11. Bàn giao
- Người tiếp theo: **PO** đọc mục 3, 4 và trả lời 2 câu (tài khoản Euler; có stream key/LIVE Studio không); **ChatGPT** xem lại tác động sản phẩm.
- Sau khi duyệt: Claude làm PoC 1–5 trên nhánh riêng, có bằng chứng chạy thử.
