# Game Flow — TuTienGioi v0.1

> Trạng thái: **bản nháp** tổng hợp từ mô tả mạch game của Product Owner (25/11/2026).
> - Phần **"PO mô tả"** là ý của Product Owner, ghi lại đúng ý.
> - Phần **"Đề xuất"** (con số, công thức, tỉ lệ) là giá trị **dùng tạm** để chạy mô phỏng (D-017), **chưa khóa**. Cần PO duyệt và ghi vào `00_PROJECT/DECISION_LOG.md` trước khi khóa.
> - Tài liệu liên quan: `01_GAME_DESIGN/GDD_v0.1.md`, `00_PROJECT/DECISION_LOG.md`.

---

## 0. Mạch game tổng quan

```
Người xem vào LIVE
  → (1) Nhận nhân vật chibi ngẫu nhiên
  → (2) Tự động đi đến Đá Đo Linh Căn
  → (3) Hệ thống phát Linh Căn ngẫu nhiên + đọc to tên & linh căn
  → (4)(5) Bắt đầu tu luyện: nhận Tu Vi theo giây × hệ số Linh Căn
  → (6) Kiếm thêm Tu Vi: thả tim, tặng quà, đan dược, linh thạch
  → (7)(8) Đủ Tu Vi → lên tiểu cảnh / đại cảnh → hiệu ứng thăng cấp, đột phá, thiên kiếp
  → (9) Đổi trang phục theo cảnh giới; đủ cấp → khiêu chiến người chơi / chức vụ
  → (10) Cơ duyên ngẫu nhiên tặng công pháp, pháp bảo, vũ khí, tu vi
  → (11) Khiêu chiến: so Chiến Lực (Tu Vi + Công Pháp + Vũ Khí)
Mọi sự kiện quan trọng → Hệ thống Thông Báo (chữ + giọng đọc chúc mừng)
```

---

## 1. Vào phiên LIVE và nhận nhân vật

**PO mô tả**
- Người xem vào phiên LIVE được phân một nhân vật **ngẫu nhiên** từ kho nhân vật của game.

**Đề xuất chi tiết**
- Nhân vật = tổ hợp ngẫu nhiên từ bộ nhân vật chibi module (thân, mặt, tóc, màu áo) theo GDD mục 8, để kho nhỏ vẫn ra nhiều biến thể.
- Người chơi quay lại (cùng định danh hợp lệ): **giữ nhân vật cũ**, không random lại.
- Hiệu ứng xuất hiện: nhân vật bước ra từ cổng sơn môn / mây, tên hiện trên đầu.

**PO đã quyết (D-013)**
- Người chơi **không được đổi nhân vật**; nhân vật cố định theo người chơi. Ngoại hình chỉ thay đổi qua trang phục/hào quang theo cảnh giới.

---

## 2. Đi đến Đá Đo Linh Căn

**PO mô tả**
- Người mới nhận nhân vật xong sẽ **tự động** đi đến Đá Đo Linh Căn.
- Định kỳ game phát audio + dòng thông báo **màu đỏ** kêu gọi người chơi mới lên đo Linh Căn (chủ yếu để tạo không khí).

**Đề xuất chi tiết**
- Hàng chờ đo linh căn: nhiều người vào cùng lúc thì xếp hàng trước đá, mỗi lượt đo ~3–5 giây.
- Thông báo định kỳ: mỗi 3–5 phút, hoặc khi có ≥ 3 người mới vào. Không phát khi đang có sự kiện lớn (đột phá, khiêu chiến).

**Lưu ý kỹ thuật (nói thẳng)**
- Game **gần như chắc chắn không ghi được** dòng chữ đỏ vào khung bình luận gốc của TikTok. "Dòng thông báo đỏ" sẽ hiển thị trong **khung chat/thông báo do game tự vẽ** trên màn hình LIVE. Cần kiểm chứng ở task kỹ thuật (D-007).

---

## 3. Đo Linh Căn

**PO mô tả**
- Hệ thống phát Linh Căn **ngẫu nhiên** cho từng người chơi.
- Mỗi người chỉ đo **1 lần trong 1 phiên LIVE**.
- Hệ thống **đọc to tên người chơi và Linh Căn** của họ.

**Đề xuất chi tiết**
- Hiệu ứng đá đo: đá sáng theo màu ngũ hành; linh căn càng hiếm, ánh sáng/âm thanh càng lớn.
- Linh căn hiếm (Thiên / Dị Linh Căn) → thông báo toàn sơn môn + hiệu ứng đặc biệt.
- Đọc tên: nhiều người đo liên tục thì gộp ("Chúc mừng 3 vị đạo hữu...") để không nghẽn âm thanh.

**PO đã quyết (D-009)**
- Linh căn **đo lại mỗi phiên LIVE**. Tu Vi, cảnh giới, vật phẩm, chức vụ vẫn được lưu qua các phiên.

---

## 4. Hệ thống Linh Căn và tốc độ tu luyện

**PO mô tả**
- Linh Căn quyết định tốc độ tu luyện. Ví dụ: Tạp linh căn = ×100%, Nhất phẩm linh căn = ×200%.

**Đề xuất bảng Linh Căn** (giá trị khởi điểm)

| Bậc | Linh Căn | Hệ số Tu Vi | Tỉ lệ ra |
|---|---|---|---|
| 1 | Tạp Linh Căn (ngũ hành tạp) | ×100% | 40% |
| 2 | Tứ Linh Căn | ×120% | 25% |
| 3 | Tam Linh Căn | ×140% | 18% |
| 4 | Song Linh Căn | ×170% | 10% |
| 5 | Nhất Phẩm (Đơn) Linh Căn | ×200% | 5% |
| 6 | Thiên Linh Căn | ×250% | 1,8% |
| 7 | Dị Linh Căn (Lôi / Băng / Phong) | ×300% | 0,2% |

- Tổng tỉ lệ = 100%. Tỉ lệ ra **không phụ thuộc** việc tặng quà (tránh "random trả tiền" — GDD mục 6.3).

---

## 5. Tu luyện theo thời gian xem

**PO mô tả**
- Sau khi có linh căn, nhân vật hít thở/tu luyện và nhận Tu Vi theo **giây xem LIVE**, nhân với % linh căn.

**Đề xuất công thức**
```
Tu Vi thực nhận mỗi giây = Tu Vi gốc/giây × Hệ số Linh Căn
Tu Vi gốc/giây (đề xuất) = 1
```
- Ví dụ: Tạp linh căn xem 10 phút = 600 Tu Vi; Nhất phẩm xem 10 phút = 1.200 Tu Vi.
- Chỉ cộng khi người chơi còn **hiện diện hợp lệ** (heartbeat, thời gian chờ khi rớt mạng, không cộng từ kết nối treo) — theo GDD mục 6.1.
- Animation: nhân vật ngồi thiền, linh khí bay vào người; linh căn cao → hạt linh khí dày hơn.

---

## 6. Các nguồn kiếm Tu Vi

**PO mô tả**
- Ở lại LIVE (theo giây).
- Thả tim: **1 tim = 1 Hạ Phẩm Linh Thạch**.
- Tặng hoa.
- Mua đan dược, mua linh thạch.

**Đề xuất hệ thống tiền tệ**

| Vật phẩm | Quy đổi (đề xuất) |
|---|---|
| Hạ Phẩm Linh Thạch | = 10 Tu Vi khi luyện hóa |
| Trung Phẩm Linh Thạch | = 100 Hạ Phẩm |
| Thượng Phẩm Linh Thạch | = 100 Trung Phẩm |
| Cực Phẩm Linh Thạch | = 100 Thượng Phẩm |

- **PO đã quyết (D-014):** linh thạch **tự động luyện hóa thành Tu Vi** ngay khi nhận, không giữ làm tiền.
- Đan dược đến từ quà tặng và cơ duyên (không mua bằng linh thạch).
- Đan dược: tăng Tu Vi tức thì hoặc tăng tốc tu luyện trong X phút (vd. Tụ Khí Đan +20% trong 5 phút).
- Tặng hoa / quà TikTok → đan dược hoặc linh thạch theo bảng quy đổi riêng, **chờ D-007** (cách lấy sự kiện quà hợp lệ) và chính sách TikTok.

**Giới hạn bắt buộc (theo GDD 6.2)**
- Tim: gộp theo lô, có trần mỗi người/phút (vd. tối đa 60 Hạ Phẩm Linh Thạch/phút) để không quá tải và không lấn át thời gian xem.

**Mục tiêu doanh thu (D-018):** quà tặng là nguồn doanh thu chính; thiết kế phải khuyến khích tặng quà.

**PO đã quyết (D-010): phương án C — quà tính vào Chiến Lực, không giới hạn**
- Đã cân nhắc các phương án giới hạn 30% (A) và quà chỉ để trang trí (B); PO chọn C.
- Rủi ro đã ghi nhận: người tặng nhiều quà có thể giành chức Tông chủ; người chơi miễn phí có thể nản. Cần theo dõi khi chạy thật.
- GDD mục 6.3 ("quà không bắt buộc để tiến bộ") cần cập nhật cho khớp quyết định này.

---

## 7. Hệ thống cảnh giới và Tu Vi lên cấp

**PO mô tả**
- Xây hệ thống cấp bậc và số Tu Vi tương ứng để lên cấp.

**Đề xuất**
- Mỗi Đại Cảnh có 4 Tiểu Cảnh: Sơ Kỳ → Trung Kỳ → Hậu Kỳ → Đại Viên Mãn.
- Thang Đại Cảnh theo GDD 5.2. Con số dưới đây chỉ để chạy mô phỏng, sẽ chỉnh sau khi đo thời gian xem thực tế.

| # | Đại Cảnh | Tu Vi mỗi Tiểu Cảnh | Thời gian ước tính / tiểu cảnh (Tạp linh căn, chỉ xem) |
|---|---|---|---|
| 1 | Luyện Khí | 600 | 10 phút |
| 2 | Trúc Cơ | 3.000 | 50 phút |
| 3 | Kim Đan | 12.000 | 3,3 giờ |
| 4 | Nguyên Anh | 40.000 | 11 giờ |
| 5 | Hóa Thần | 120.000 | 33 giờ |
| 6 | Luyện Hư | 300.000 | 83 giờ |
| 7 | Hợp Thể | 700.000 | 194 giờ |
| 8 | Đại Thừa | 1.500.000 | 417 giờ |
| 9 | Độ Kiếp | 3.000.000 | 833 giờ |
| 10 | Chân Tiên | Cảnh giới cuối | — |

- Ý đồ: phiên đầu người mới lên được vài tiểu cảnh Luyện Khí (có cảm giác tiến bộ nhanh), cảnh giới cao cần nhiều phiên.

---

## 8. Hiệu ứng thăng cấp

**PO mô tả**
- Lên Tiểu Cảnh hoặc Đại Cảnh có hiệu ứng thăng cấp, đột kiếp, thiên phạt... đẹp và bắt mắt.

**Đề xuất phân tầng hiệu ứng**

| Sự kiện | Hiệu ứng | Thông báo |
|---|---|---|
| Lên Tiểu Cảnh | Vòng sáng ngắn quanh nhân vật, số Tu Vi bay lên | Chữ nhỏ, không đọc to (tránh spam) |
| Lên Đại Cảnh (Luyện Khí → Trúc Cơ, Trúc Cơ → Kim Đan) | Cột sáng, linh khí xoáy, đổi trang phục | Chữ lớn + đọc to |
| Đột phá lớn (Kim Đan → Nguyên Anh trở lên) | Thiên Kiếp: mây đen, sấm sét đánh xuống, toàn màn hình rung nhẹ | Toàn sơn môn + đọc to |
| Độ Kiếp → Chân Tiên | Thiên Phạt nhiều đợt, ánh tiên quang, cảnh quay đặc biệt | Sự kiện đặc biệt cả phiên |

- Nhiều người đột phá cùng lúc → xếp hàng hiệu ứng lớn, mỗi cái ~5–8 giây.

**PO đã quyết (D-011)**
- Đột phá **có thể thất bại nhưng không bị phạt**: không mất Tu Vi, chờ hồi rồi thử lại.
- Đề xuất: tỉ lệ thành công cao ở cảnh giới thấp, giảm dần ở cảnh giới cao; hồi chiêu sau thất bại 60 giây; Đan dược đột phá (vd. Trúc Cơ Đan) tăng tỉ lệ. Con số chờ duyệt.

---

## 9. Trang phục, khiêu chiến và chức vụ

**PO mô tả**
- Cấp càng cao, trang phục càng khác.
- Ở các cấp nhất định có thể khiêu chiến người chơi khác, khiêu chiến Tông chủ (trưởng tổng môn), Trưởng phái hoặc Trưởng lão. Thắng thì **nhận chức vụ đó**.
- Hệ thống đọc tên chúc mừng mọi sự kiện.

**Đề xuất trang phục**
- Mỗi Đại Cảnh một bộ trang phục + màu hào quang riêng (giữ khuôn mặt/tóc để người chơi nhận ra nhân vật mình).

**Đề xuất mốc mở khiêu chiến**

| Mục tiêu khiêu chiến | Cảnh giới tối thiểu | Số ghế (đề xuất) |
|---|---|---|
| Người chơi khác | Trúc Cơ | — |
| Trưởng Lão | Kim Đan | 4 |
| Trưởng Phái | Nguyên Anh | 2 |
| Tông Chủ (Trưởng Tổng Môn) | Hóa Thần | 1 |

- Cách khiêu chiến: gõ lệnh bình luận (vd. `!khieuchien Trưởng Lão`) — **phụ thuộc** việc đọc được bình luận (D-007).
- Chức vụ đang trống → do NPC giữ; người chơi thắng NPC thì lên thay.
- Người giữ chức rời LIVE: giữ chức nhưng vẫn bị khiêu chiến được (đấu với "phân thân" theo chỉ số đã lưu).
- Hồi chiêu: mỗi người khiêu chiến tối đa 1 lần / 5 phút; người giữ chức được miễn khiêu chiến 2 phút sau khi vừa thắng.

**PO đã quyết (D-012)**
- Khiêu chiến và giành chức vụ **nằm trong MVP**. GDD mục 9 cần cập nhật.
- Phụ thuộc: cần đọc được bình luận lệnh (D-007); khi chưa có thì chạy bằng mô phỏng local.

**PO đã quyết (D-015)**
- Khi người chơi giành ghế Tông chủ, nhân vật host lên làm **Thái Thượng Tông Chủ**: ngồi vị trí cao hơn trên điện, không thể bị khiêu chiến. Người chơi giữ ghế Tông chủ cho đến khi bị đánh bại.

---

## 10. Cơ duyên đặc biệt

**PO mô tả**
- Cơ duyên ngẫu nhiên tặng công pháp, Tu Vi, pháp bảo, vũ khí... cho người chơi may mắn.
- Hệ thống thông báo kiểu phim xuyên không: *"Chúc mừng ký chủ [tên] nhận được ..."*

**Đề xuất**
- Mỗi 5–10 phút, chọn ngẫu nhiên 1 người đang **hiện diện hợp lệ** (chọn đều, không ưu tiên người tặng quà).
- Bảng phần thưởng có độ hiếm (Phàm / Linh / Tiên / Thần phẩm), vd.:

| Loại | Ví dụ | Tỉ lệ (đề xuất) |
|---|---|---|
| Tu Vi | +10% Tu Vi tiểu cảnh hiện tại | 45% |
| Đan dược | Tụ Khí Đan, Trúc Cơ Đan | 30% |
| Công pháp | tăng % Chiến Lực hoặc tốc độ tu luyện | 15% |
| Vũ khí | kiếm, phiến, cầm... tăng Chiến Lực | 7% |
| Pháp bảo | hiệu ứng hào quang + tăng Chiến Lực | 3% |

- Hiệu ứng: bảng hệ thống xanh kiểu "hệ thống xuyên không" hiện lên, giọng đọc máy.

---

## 11. Luật thắng khi khiêu chiến

**PO mô tả**
- Thắng khi Tu Vi cao hơn, tính cả công pháp và vũ khí.

**Đề xuất công thức Chiến Lực**
```
Chiến Lực = Tu Vi tích lũy × (1 + % Công Pháp) × (1 + % Vũ Khí) × (1 + % Pháp Bảo)
```
- **PO đã quyết (D-016):** mỗi trận, Chiến Lực của từng bên nhân ngẫu nhiên trong khoảng **±10%**:
```
Chiến Lực trận = Chiến Lực × ngẫu nhiên(0,90 … 1,10)
```
- Chiến Lực trận cao hơn → thắng. Bằng nhau → người giữ chức/người bị khiêu chiến thắng.
- Hệ quả: bên yếu hơn tới ~18% vẫn có cơ hội lật kèo; chênh lệch lớn hơn thì gần như chắc thua.
- Trận đấu: hiệu ứng 2 nhân vật giao chiêu 5–8 giây, hiện thanh Chiến Lực hai bên, đọc to kết quả.

### 11.1 Cửa sổ Trợ Chiến (D-018)
- Khi trận khiêu chiến bắt đầu, mở **30 giây Trợ Chiến** (đề xuất) trước khi phân thắng thua.
- Trong thời gian này, quà tặng cộng Chiến Lực **ngay lập tức** cho bên được ủng hộ:
  - Người tặng là một trong hai đấu thủ → cộng cho chính mình.
  - Người xem khác tặng → cộng cho bên họ chọn (lệnh bình luận, vd. `!ung A`), mặc định là bên giữ chức nếu chưa chọn.
- Màn hình: thanh Chiến Lực hai bên chạy theo thời gian thực, tên người trợ chiến bay vào phe, đồng hồ đếm ngược, đọc to khi có quà lớn.
- Kết thúc 30 giây → áp dao động ±10% (D-016) → công bố thắng thua.
- Quy đổi quà → Chiến Lực trợ chiến: bảng cố định, công khai, **không ngẫu nhiên**; con số chờ mô phỏng (D-017) và D-007.

### 11.2 Ràng buộc chính sách khi kiếm tiền
- Quà luôn cho phần thưởng **cố định, biết trước**. Không quay thưởng, hộp bí ẩn, rút thăm trả tiền.
- Cơ duyên ngẫu nhiên (mục 10) chỉ chọn trong người đang hiện diện, không gắn với quà.
- PO cần tự đọc LIVE Monetization Guidelines trong app (LIVE Safety Education Center) trước khi lên LIVE thật; Claude chưa xác minh được văn bản này.

---

## 12. Hệ thống Thông Báo (dùng chung)

**PO mô tả**
- Hệ thống đọc tên chúc mừng tất cả các sự kiện.

**Đề xuất**
- Một hàng đợi thông báo chung, có mức ưu tiên:

| Ưu tiên | Sự kiện |
|---|---|
| Cao | Đổi chức vụ, Thiên Kiếp, Linh căn hiếm, Cơ duyên Tiên/Thần phẩm |
| Trung bình | Lên Đại Cảnh, kết quả khiêu chiến, cơ duyên thường |
| Thấp | Đo linh căn thường, nhắc người mới đo linh căn |
| Chỉ hiện chữ | Lên Tiểu Cảnh, nhận linh thạch từ tim |

- Giọng đọc: dùng TTS **miễn phí, chạy local** (đúng D-008). Chất lượng đọc tiếng Việt và tên có ký tự đặc biệt **chưa kiểm chứng** → cần thử trong PoC.
- Lọc tên: tên người dùng có từ ngữ xấu thì không đọc to (theo GDD mục 11 – kiểm duyệt tên).
- Giới hạn: tối đa ~1 câu đọc mỗi 3–4 giây; thông báo ưu tiên thấp bị gộp hoặc bỏ khi hàng đợi dài.

---

## 13. Quyết định và câu hỏi

**Đã quyết (25/11/2026, ghi trong DECISION_LOG)**
- D-009: Linh căn đo lại mỗi phiên.
- D-010: Quà tính vào Chiến Lực, không giới hạn.
- D-011: Đột phá có thể thất bại, không phạt.
- D-012: Khiêu chiến & chức vụ nằm trong MVP.

- D-013: Không đổi nhân vật.
- D-014: Linh thạch tự luyện hóa thành Tu Vi.
- D-015: Host thành Thái Thượng Tông Chủ khi người chơi lên Tông chủ.
- D-016: Khiêu chiến có dao động ngẫu nhiên ±10%.
- D-017: Các con số đề xuất được dùng tạm; Claude chạy mô phỏng rồi đề xuất chỉnh, PO duyệt lại trước khi khóa.

**Còn mở**
- Con số cuối cùng sau mô phỏng (D-017).

## 14. Phụ thuộc kỹ thuật

- Vào phòng, thả tim, tặng quà, bình luận lệnh: đều phụ thuộc **D-007** (cách lấy sự kiện LIVE hợp lệ). Khi chưa có, toàn bộ luồng chạy bằng **chế độ mô phỏng local**.
- Lưu Tu Vi, linh căn, chức vụ, vật phẩm: SQLite local (theo hướng stack đang đề xuất, chưa khóa — D-005).
