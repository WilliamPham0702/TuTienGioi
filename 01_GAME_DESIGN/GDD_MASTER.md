# TuTienGioi — GDD Master

| Trường | Giá trị |
|---|---|
| Phiên bản | 1.0 (đồng bộ checkpoint 2026-11-26) |
| Ngày đồng bộ | 2026-11-27 |
| Nguồn issue | WilliamPham0702/TuTienGioi#40 |
| Nhánh | `docs/gdd-sync-2026-11-27` |
| Trạng thái | DRAFT chờ Product Owner rà soát. Không phải bản "đã duyệt toàn bộ". Từng mục mang nhãn riêng. |
| Thay thế | `GDD_v0.1.md`, `GDD_v0.3.md`, `GAME_FLOW_v0.1.md` (giữ nguyên để lưu lịch sử, không dùng làm nguồn) |
| Tài liệu đi kèm | `GAME_FLOW_MASTER.md`, thư mục `SYSTEM_SPEC/`, `00_PROJECT/GDD_CONFLICT_REPORT.md`, `00_PROJECT/GDD_SYNC_COMPLETION_REPORT.md` |

---

## 0. Cách đọc tài liệu này

### 0.1 Nhãn trạng thái

| Nhãn | Ý nghĩa | Được phép triển khai? |
|---|---|---|
| **CONFIRMED** | Nằm trong `TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md` hoặc quyết định PO đã ghi trong `DECISION_LOG.md` và không bị thay thế | Có |
| **TUNABLE** | Đề xuất dùng tạm để mô phỏng và cân bằng. Không được coi là đã duyệt | Có, nhưng phải đọc được từ cấu hình để chỉnh |
| **OPEN** | Chưa có quyết định. Tài liệu ghi phương án đề xuất và mã OPEN-xx | Không. Cần PO quyết trước khi khóa |
| **SUPERSEDED** | Đã bị checkpoint hoặc quyết định mới thay thế. Chỉ ghi để truy vết | Không |

### 0.2 Thứ tự thẩm quyền khi tài liệu mâu thuẫn

1. `00_PROJECT/TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md` (snapshot quyết định mới nhất)
2. `00_PROJECT/GDD_DECISION_*.md` đã xác nhận (camera, BOT/dân số)
3. `00_PROJECT/DECISION_LOG.md`, chỉ các mục chưa bị checkpoint thay thế (xem mục 0.3)
4. Tài liệu GDD, GAME_FLOW, FEATURE_SPEC, proposal (chỉ dùng làm nguồn cho phần TUNABLE/OPEN)

Mọi mâu thuẫn đã phát hiện và cách xử lý nằm trong `00_PROJECT/GDD_CONFLICT_REPORT.md`.

### 0.3 Quyết định đã bị thay thế (không dùng)

| ID | Nội dung cũ | Thay thế bởi |
|---|---|---|
| D-011 | Đột phá có thể thất bại, không mất Tu Vi, chờ hồi rồi thử lại | Checkpoint: đột phá tự động, nhiều lần liên tiếp được, không có thất bại |
| D-014 | Linh thạch tự động luyện hóa thành Tu Vi | Checkpoint: linh thạch là tài nguyên kinh tế; Tim cộng trực tiếp Tu Vi |
| D-017 (phần số liệu) | Bảng linh căn, thang Tu Vi/tiểu cảnh, quy đổi linh thạch dùng tạm | Checkpoint: bảng linh căn, thang cảnh giới, ngưỡng Tu Vi mới |
| D-020 | Tu Vi mỗi tiểu cảnh giảm 50% (Luyện Khí 300 … Độ Kiếp 1.500.000) | Checkpoint: ngưỡng Tu Vi tích lũy mới (Luyện Khí 1.200 … Tiên Cảnh 7.200.000) |

Các quyết định khác trong DECISION_LOG (D-001 đến D-020) vẫn có hiệu lực, trừ các mục trên. Chi tiết nằm trong bảng cập nhật cuối `DECISION_LOG.md`.

---

## 1. Tóm tắt sản phẩm

**CONFIRMED.** TuTienGioi là game tu tiên tương tác chạy trên TikTok LIVE. Người xem trở thành tu sĩ có nhân vật chibi 2.5D trong một thế giới chung, bền vững. Họ tích lũy Tu Vi khi có mặt hợp lệ trong LIVE và qua các tương tác được phép, rồi đột phá cảnh giới, tham gia sự kiện thế giới và tranh chức vụ trong tông môn.

Trải nghiệm có hai lớp:
- **Cá nhân:** nhân vật cố định, Linh Căn của phiên, Tu Vi, cảnh giới, vật phẩm được phép, chức vụ và danh hiệu.
- **Cộng đồng:** Đại điện chung, Boss, sự kiện thế giới, Top 10 hàng giờ, Linh Khí Triều.

Nguyên tắc sản phẩm (từ Project Brief, vẫn hiệu lực): hiển thị tiến trình rõ ràng; chuyển người xem thành người chơi; cân bằng công bằng, miễn phí vẫn có thể chơi tốt; LIVE dễ đọc trên màn hình dọc; phục hồi ổn định khi rớt mạng.

Mục tiêu doanh thu: quà tặng là nguồn chính (D-018). Quà không được bắt buộc để tiến bộ (Project Brief), nhưng D-010 cho phép quà tính vào Chiến Lực không giới hạn. Xem SS-05 và OPEN-31.

## 2. Phạm vi

### 2.1 MVP

**CONFIRMED** trừ khi ghi khác:
- Một tông môn, một đại điện, bố cục dọc 9:16 (1080×1920).
- Hồ sơ người chơi và nhân vật chibi cố định (D-013), Linh Căn đo lại mỗi phiên LIVE (D-009).
- Tu luyện theo thời gian LIVE hợp lệ và hệ số Linh Căn (checkpoint).
- Đột phá tự động, 10 Đại Cảnh (checkpoint).
- Boss L1–L7 (checkpoint).
- Top 10 hàng giờ (checkpoint).
- Quà qua adapter và Local Simulation (checkpoint, D-007).
- Sự kiện thế giới, Linh Khí Triều (TUNABLE).
- Khiêu chiến người chơi và tranh ghế Trưởng Lão / Trưởng Phái / Tông Chủ (D-012, D-016).
- Trợ Chiến (D-018, TUNABLE chi tiết).
- Giao dịch người chơi trong ranh giới chống gian lận (checkpoint, SS-10).
- Camera queue, thông báo chữ và TTS (checkpoint).
- Lưu, phục hồi, reconnect không mất tiến trình (checkpoint).
- Local Simulation Mode cho mọi tính năng.

### 2.2 Ngoài MVP (Phase 2 backlog, TUNABLE)

Yêu Thú Công Sơn, Bí Cảnh, Sư Đồ, Điểm Danh/Bế Quan mở rộng, Tông Môn Đại Bỉ, Phi Thăng/Tiên Giới hoặc mùa giải sau Tiên Cảnh (xem SS-16). Các mục này không có trong checkpoint. Giữ lại như backlog, không triển khai trong MVP.

### 2.3 Loại trừ

**CONFIRMED.**
- Không có trang bị (equipment) và pháp bảo (pháp khí). Chi tiết ở SS-09.
- Không có chợ đấu giá hoặc marketplace phức tạp (TUNABLE, xem OPEN-18).
- Không có open world, không có multi-sect, không có 3D pipeline đầy đủ trước khi prototype 2.5D được đánh giá.
- Không có connector TikTok thật nếu chưa được PO duyệt (D-007). Không tạo kết nối không chính thức trên tài khoản thật.
- Không phát sinh chi phí (D-008).
- Không phát triển Offline Simulator hoặc AI Agency trong GDD này.

## 3. Quyết định đã chốt (tóm tắt)

| Nhóm | Nội dung | Nguồn | Chi tiết |
|---|---|---|---|
| Dân số | Tối thiểu 50 nhân vật, không trần, không xóa để ép 50 | Checkpoint, GDD_DECISION_OFFLINE_BOT_POPULATION | SS-01 |
| BOT offline | Giữ danh tính và tiến trình, nhân vật chạy BOT, trả quyền khi quay lại | Checkpoint | SS-01, SS-13 |
| Tu luyện | Gốc 1/giây khi LIVE × hệ số Linh Căn; tim/like 5 gốc × hệ số | Checkpoint | SS-02 |
| Linh Căn | 7 bậc (Tạp → Thánh thể), trọng số và hệ số đã chốt | Checkpoint, D-009 | SS-02 |
| Đột phá | Tự động, nhiều lần liên tiếp được, không thất bại | Checkpoint (thay D-011) | SS-02 |
| Cảnh giới | 10 Đại Cảnh, ngưỡng Tu Vi tích lũy, kết thúc bằng Tiên Cảnh | Checkpoint (thay D-020) | SS-02 |
| Đan dược | Tụ Khí +100 … Hóa Thần +40.000, tự nhận, không giới hạn, không cooldown | Checkpoint | SS-02 |
| Boss | L1–L7 với trọng số, một Boss tại một thời điểm, L4–L7 despawn sau 5 phút | Checkpoint | SS-03 |
| Phần thưởng Boss | Tu Vi = tỉ lệ sát thương × hệ số Linh Căn × 10.000 × cấp Boss; vật phẩm theo bảng | Checkpoint | SS-03 |
| Top 10 | Xếp hạng theo cảnh giới rồi Tu Vi tích lũy; chia 25/18/14/11/9/7/6/4/3/3 | Checkpoint | SS-04 |
| Quà | Người gửi không LIVE → kho chung; chia đều cho người online, dư ngẫu nhiên | Checkpoint | SS-05 |
| Sự kiện thế giới | Ngẫu nhiên và do người chơi kích hoạt; có thể chạy song song khi không xung đột | Checkpoint | SS-06 |
| Camera | Ưu tiên: Boss đang đánh > Độ Kiếp > Tiên Cảnh > Đột phá > Nhận vật phẩm > Sự kiện nhỏ; FIFO trong cùng ưu tiên; không ngắt focus | Checkpoint, GDD_DECISION_CAMERA_* | SS-07 |
| Thời lượng camera | Nhỏ 3s; vừa 5s; lớn 8s; Độ Kiếp 12s; Tiên Cảnh 15s; Boss theo trận | Checkpoint | SS-07 |
| Vật phẩm | Boss item vào túi tự động; không giới hạn sức chứa; tự phân loại; không trang bị, không pháp bảo | Checkpoint | SS-09 |
| Linh thạch | Tài nguyên kinh tế, giao dịch được, chuyển được | Checkpoint (thay D-014) | SS-09 |
| Giao dịch | Được bật trong ranh giới chống gian lận | Checkpoint | SS-10 |
| Tương tác LIVE | Like/comment có hệ thống quy đổi riêng và chống spam; reconnect lưu và khôi phục đúng; ưu tiên gộp thông báo; ngôn ngữ mặc định tiếng Việt | Checkpoint | SS-14, SS-15 |
| Tường thuật AI | Bám sự kiện thật, không bịa, không spam | Checkpoint | SS-17 |
| Đội AI | ChatGPT + Claude; Copilot không thuộc workflow dự án | Checkpoint | Mục 22 |
| Chức vụ | Khiêu chiến và giành chức vụ trong MVP; host thành Thái Thượng Tông Chủ khi người chơi lên Tông Chủ | D-012, D-015 | SS-08, SS-12 |
| Chiến Lực | Ngẫu nhiên ±10% mỗi trận; bằng nhau thì bên bị khiêu chiến thắng | D-016 | SS-08 |
| Quà vào Chiến Lực | Không giới hạn, quy đổi cố định | D-010 | SS-05, SS-08 |
| Nhân vật | Phân ngẫu nhiên một lần, cố định, không đổi | D-013 | Mục 5 |
| Ngân sách | 0 VND | D-008 | Mục 2.3 |

## 4. Tông môn và chức vụ

**CONFIRMED** (D-012, D-015):
- Host mặc định là Tông Chủ hiện tại. Khi người chơi giành ghế Tông Chủ, host chuyển lên **Thái Thượng Tông Chủ** và không thể bị khiêu chiến.
- Chức vụ: Tông Chủ (1 ghế), Trưởng Phái, Trưởng Lão, Đệ tử (mọi người khác).
- Chức vụ, người giữ ghế và Chiến Lực được lưu qua các phiên LIVE.

**TUNABLE**: số ghế và cổng cảnh giới khiêu chiến (chi tiết SS-08 và SS-12).

**OPEN-19**: cấu trúc guild (xem SS-12).

## 5. Người chơi, nhân vật và Linh Căn

- **CONFIRMED (D-013).** Nhân vật chibi được gán ngẫu nhiên một lần, cố định cho người chơi. Không đổi nhân vật. Ngoại hình thay đổi bằng trang phục, phụ kiện và hào quang theo cảnh giới.
- **CONFIRMED (checkpoint).** Tên nhân vật dựa trên định danh TikTok. Có hồ sơ, đạo hiệu và danh hiệu.
- **CONFIRMED (D-009).** Linh Căn được đo ngẫu nhiên một lần mỗi phiên LIVE, và đo lại ở phiên sau. Tu Vi, cảnh giới, vật phẩm và chức vụ vẫn được lưu.
- **CONFIRMED (checkpoint).** Giữ danh tính, tiến trình, tu luyện, vật phẩm và các dữ liệu khác của người chơi khi offline.
- **TUNABLE.** Người mới tự động đến Đá Đo Linh Căn. Thông báo nhắc đo mỗi 3–5 phút hoặc khi có ≥3 người mới, không phát khi đang có sự kiện lớn.
- **OPEN-22**: điều kiện "LIVE đủ điều kiện" để tính tu luyện (xem SS-15).
- **OPEN-23**: quy tắc kiểm duyệt tên (SS-14).

Định danh: không dùng tên hiển thị làm khóa hồ sơ. Chỉ lưu định danh bền vững khi nguồn sự kiện cho phép. Nếu không có định danh ổn định thì không tự gộp người chơi (GDD v0.3 §4, vẫn áp dụng).

## 6. Dân số và BOT offline

Chi tiết và quy tắc kiểm thử ở SS-01.

- **CONFIRMED.** Người chơi offline: giữ nhân vật, tu vi, vật phẩm, danh tính và tiến trình. Không xóa, không reset.
- **CONFIRMED.** Nhân vật đó chuyển sang BOT và tiếp tục hoạt động trong thế giới. Khi quay lại, BOT dừng và người chơi nhận lại quyền điều khiển trên đúng nhân vật đó.
- **CONFIRMED.** Luôn có tối thiểu 50 nhân vật đang hoạt động, đếm cả người chơi thật và BOT do người chơi sở hữu.
- **CONFIRMED.** Thiếu thì tạo BOT lấp chỗ trống. Không có trần. Không kick hay xóa nhân vật để ép về 50. Không tạo BOT lấp chỗ khi đã có ≥50.
- **CONFIRMED.** BOT lấp chỗ là khác với BOT do người chơi sở hữu.
- **OPEN-08**: thời hạn giữ BOT cho người chơi không quay lại.
- **OPEN-09**: BOT lấp chỗ có được rút khi người thật vào không (mặc định: không rút, theo chữ của checkpoint).

## 7. Tu luyện và cảnh giới

Chi tiết và bảng số ở SS-02.

- **CONFIRMED.** Tu Vi gốc 1 mỗi giây khi LIVE hợp lệ, nhân với hệ số Linh Căn.
- **CONFIRMED.** Mỗi tim/like hợp lệ cho 5 Tu Vi gốc, nhân với hệ số Linh Căn. Tim là tương tác hợp lệ được tính; xác nhận thuật ngữ ở OPEN-32.
- **CONFIRMED.** 7 bậc Linh Căn với trọng số 35/25/18/12/6/3/1 và hệ số ×1/×2/×3/×4/×5/×6/×10.
- **CONFIRMED.** 10 Đại Cảnh: Luyện Khí, Trúc Cơ, Kim Đan, Nguyên Anh, Hóa Thần, Luyện Hư, Hợp Thể, Đại Thừa, Độ Kiếp, Tiên Cảnh. Ngưỡng Tu Vi tích lũy: 1.200 / 6.000 / 24.000 / 72.000 / 180.000 / 420.000 / 900.000 / 1.800.000 / 3.600.000 / 7.200.000.
- **CONFIRMED.** Đột phá tự động khi đạt ngưỡng. Có thể đột phá nhiều lần liên tiếp. Không có thất bại, không mất tài nguyên.
- **CONFIRMED.** Sau Tiên Cảnh tiếp tục tu luyện theo hệ thống hậu Tiên Cảnh (SS-16, OPEN).
- **CONFIRMED.** Đan dược: Tụ Khí +100, Ngưng Khí +500, Trúc Cơ +1.500, Kim Đan +5.000, Nguyên Anh +15.000, Hóa Thần +40.000. Tự nhận, không giới hạn số lượng, không cooldown.
- **OPEN-01**: ý nghĩa chính xác của "ngưỡng" (đạt mức này mới vào cảnh giới) và tên trạng thái trước Luyện Khí.
- **OPEN-02**: tiểu cảnh (Sơ Kỳ → Đại Viên Mãn). Checkpoint không có. Xem SS-02 mục 6.
- **OPEN-25**: Độ Kiếp là cảnh giới và cũng là sự kiện thiên kiếp. Cơ chế tương tác của thiên kiếp chưa rõ.
- **OPEN-27**: nguồn đan dược (quà, boss, Top 10, sự kiện).

## 8. Tài nguyên, tim/like và quà

- **CONFIRMED.** Tim/like hợp lệ cộng Tu Vi trực tiếp (5 gốc × hệ số Linh Căn), có giới hạn tốc độ (SS-15).
- **CONFIRMED.** Linh thạch là tài nguyên kinh tế, không tự động chuyển thành Tu Vi (SS-09).
- **CONFIRMED.** Quà tặng: người nhận có nhân vật thì nhân vật được nâng cấp. Người gửi không LIVE thì vào kho chung (SS-05).
- **CONFIRMED (D-010, D-018).** Quà cộng Chiến Lực không giới hạn; mọi phần thưởng gắn với quà phải cố định và công khai. Không quay thưởng, hộp bí ẩn, rút thăm trả tiền.
- **OPEN-10**: bảng quy đổi quà và ngưỡng xu (phải lấy từ catalog TikTok thật, không đoán).
- **OPEN-11**: danh sách quà đặc biệt kích hoạt sự kiện thế giới.
- **OPEN-31**: mâu thuẫn giữa D-010 (quà không giới hạn) và nguyên tắc proposal "không có lợi thế vĩnh viễn không thể cân bằng". Mục này cần PO xác nhận.

## 9. Boss

Chi tiết ở SS-03.

- **CONFIRMED.** L1–L7 với trọng số 40/25/15/10/6/3/1%. Chỉ có một Boss hoạt động tại một thời điểm. Khi hạ Boss, cấp tiếp theo được roll ngẫu nhiên.
- **CONFIRMED.** L1–L3 ở lại cho đến khi bị hạ. L4–L7 despawn và reset về L1 sau 5 phút.
- **CONFIRMED.** Phần thưởng Tu Vi = tỉ lệ sát thương hợp lệ × hệ số Linh Căn × 10.000 × cấp Boss.
- **CONFIRMED.** Số vật phẩm rơi: L1 1–2, L2 2–3, L3 3–4, L4 4–5, L5 5–7, L6 6–8, L7 7–10.
- **CONFIRMED.** Trọng số phẩm chất: Phàm 35, Linh 25, Huyền 18, Địa 10, Thiên 7, Tiên 4, Thần 1. Hệ số Boss áp dụng cho Huyền trở lên: ×1, ×1.2, ×1.4, ×1.7, ×2, ×2.5, ×3 (L1 → L7).
- **CONFIRMED.** Người chơi tham gia tự động theo chỉ số và cảnh giới. Boss có thể tấn công người chơi. Người chơi bị hạ hồi phục và quay lại mà không mất cảnh giới.
- **OPEN-03**: định nghĩa "xác suất hiếm: cấp Boss × 10%".
- **OPEN-04**: cách chuẩn hóa hệ số phẩm chất.
- **OPEN-06**: sau despawn, Boss tiếp theo luôn là L1 hay vẫn roll ngẫu nhiên.
- **OPEN-07**: BOT offline có nhận thưởng Boss không.

## 10. Top 10 hàng giờ và bảng xếp hạng

Chi tiết ở SS-04.

- **CONFIRMED.** Xếp hạng theo cảnh giới, rồi Tu Vi tích lũy. Hòa thì người đạt mốc trước xếp trên. Chỉ người chơi đang LIVE tại thời điểm chốt mới đủ điều kiện.
- **CONFIRMED.** Phần thưởng: đan dược, linh thạch, nội đan quái, vật liệu đột phá và vật phẩm Boss. Tỉ lệ chia 25/18/14/11/9/7/6/4/3/3%.
- **CONFIRMED.** Quỹ 20% đến từ vật phẩm Boss rơi thật trong chu kỳ, 80% từ thưởng Boss thông thường. Giá trị vật phẩm: Phàm×1, Linh×2, Huyền×4, Địa×8, Thiên×16, Tiên×32, Thần×64. Phần dư chia cho hạng đủ điều kiện. Không nợ, không chuyển sang chu kỳ sau.
- **OPEN-05**: "quỹ 20%/80%" hiểu theo nghĩa nào và thời điểm chốt chu kỳ.
- **TUNABLE.** Chốt vào đầu mỗi giờ theo `Asia/Ho_Chi_Minh`.
- **TUNABLE.** Bảng xếp hạng hiển thị 4 tab (Tu Vi, Chiến Lực, Bế Quan, Cúng Phụng) theo GDD v0.3. Chỉ có Top 10 hàng giờ là CONFIRMED. Các tab còn lại là OPEN-28.

## 11. Khiêu chiến, Chiến Lực và Trợ Chiến

Chi tiết ở SS-08.

- **CONFIRMED (D-012).** Khiêu chiến người chơi và giành chức vụ là một phần MVP.
- **CONFIRMED (D-016).** Chiến Lực trận = Chiến Lực cơ sở × ngẫu nhiên (0,90 … 1,10). Bên cao hơn thắng. Bằng nhau thì người bị khiêu chiến thắng.
- **CONFIRMED (D-015).** Thái Thượng Tông Chủ không bị khiêu chiến.
- **TUNABLE.** Cổng cảnh giới: khiêu chiến người chơi từ Trúc Cơ; Trưởng Lão từ Kim Đan (4 ghế); Trưởng Phái từ Nguyên Anh (2 ghế); Tông Chủ từ Hóa Thần (1 ghế).
- **TUNABLE.** Mỗi người khiêu chiến tối đa 1 lần / 5 phút. Người giữ chức được miễn khiêu chiến 2 phút sau khi thắng.
- **TUNABLE.** Trợ Chiến mở 30 giây khi trận bắt đầu. Quà trong thời gian đó cộng Chiến Lực theo bảng cố định. Người tặng là một trong hai đấu thủ thì cộng cho chính họ. Người khác thì cộng cho phe đã chọn. Chưa chọn phe thì không tự cộng cho bên nào.
- **OPEN-15**: cách chọn phe bằng bình luận. Phụ thuộc D-007.
- **OPEN-14**: công thức Chiến Lực cơ sở đầy đủ.
- **OPEN-13**: công pháp có được giữ làm nguồn Chiến Lực hay không.

## 12. Sự kiện thế giới và Linh Khí Triều

Chi tiết ở SS-06.

- **CONFIRMED.** Có sự kiện ngẫu nhiên và sự kiện do hành động người chơi kích hoạt.
- **CONFIRMED.** Mọi người chơi đủ điều kiện đều có thể tham gia.
- **CONFIRMED.** Các sự kiện không xung đột có thể chạy song song. Camera xử lý việc trình bày qua hàng đợi.
- **TUNABLE.** Linh Khí Triều: khi tích lũy tim hợp lệ của phiên đạt 2.000, nhân ×2 Tu Vi từ tu luyện trong 3 phút. Cooldown 10 phút. Tối đa 6 lần mỗi phiên.
- **SUPERSEDED.** Tâm Ma (xem mục 21).
- **OPEN-12**: danh mục sự kiện và điều kiện kích hoạt.

## 13. Camera và thông báo

Chi tiết ở SS-07 và SS-17.

- **CONFIRMED.** Ưu tiên giảm dần: Boss đang đánh, Độ Kiếp, Tiên Cảnh, Đột phá, Nhận vật phẩm, Sự kiện nhỏ.
- **CONFIRMED.** Một focus tại một thời điểm. Không ngắt focus đang chạy. Sự kiện mới vào hàng đợi. Sự kiện cùng ưu tiên xử lý FIFO. Sự kiện trùng hoặc cùng loại được gộp. Quá tải thì gộp sự kiện nhỏ mà không bỏ. Hàng đợi trống thì trở về camera tổng quan.
- **CONFIRMED.** Thời lượng: 3s, 5s, 8s, 12s (Độ Kiếp), 15s (Tiên Cảnh), Boss theo trận.
- **CONFIRMED.** Thông báo lớn dùng chữ và TTS. Thông báo nhỏ chỉ chữ hoặc gộp. TTS chạy local nếu đạt chất lượng tiếng Việt.
- **TUNABLE.** Nhịp đọc TTS: tối đa khoảng 1 câu mỗi 3–4 giây.
- **OPEN-37 và OPEN-38.** Boss focus không được chiếm hàng đợi mãi; khiêu chiến cần hạng camera. Cần PO quyết.

## 14. Vật phẩm, kinh tế và giao dịch

Chi tiết ở SS-09 và SS-10.

- **CONFIRMED.** Vật phẩm Boss vào túi tự động.
- **CONFIRMED.** Chỉ có vật phẩm tiêu hao, vật liệu và vật phẩm có chức năng xác định. Không có trang bị, không có pháp bảo.
- **CONFIRMED.** Không giới hạn sức chứa túi. Tự phân loại.
- **CONFIRMED.** Linh thạch hỗ trợ kinh tế, giao dịch, tính năng và nâng cấp (chi tiết OPEN-17).
- **CONFIRMED.** Giao dịch người chơi được bật trong ranh giới chống gian lận. Được chuyển linh thạch.
- **OPEN-17**: nhóm chi tiêu (sink) của linh thạch.
- **OPEN-18**: Tu Vi có chuyển được không, và có chợ không.

## 15. Cơ duyên

**TUNABLE.** Sự kiện ngẫu nhiên trao phần thưởng cho một người đang hiện diện hợp lệ, chọn đều, không ưu tiên người tặng quà, không bán lượt tham gia. Bảng phần thưởng đã cập nhật theo checkpoint:

| Loại | Ví dụ | Tỉ lệ (TUNABLE) |
|---|---|---|
| Tu Vi | +10% Tu Vi của tiểu cảnh hiện tại (theo OPEN-02) | 45% |
| Đan dược | Tụ Khí Đan, Trúc Cơ Đan (theo bảng checkpoint) | 30% |
| Công pháp | Tăng % Chiến Lực hoặc tốc độ tu luyện (OPEN-13) | 15% |
| Vật liệu / linh thạch | Vật liệu đột phá hoặc linh thạch nhỏ | 10% |

- **SUPERSEDED.** Hàng "Vũ khí" và "Pháp bảo" trong GAME_FLOW_v0.1 bị loại theo checkpoint.
- Thưởng Tu Vi theo tiểu cảnh chỉ áp dụng khi OPEN-02 được quyết.

## 16. Cộng đồng, guild và danh hiệu

- **CONFIRMED.** Hỗ trợ guild và nhóm để chơi cộng đồng.
- **CONFIRMED.** Danh hiệu và Đạo Hiệu đến từ thành tích và hành vi ngoài Top 10.
- **TUNABLE.** Đạo Hiệu và Danh Hiệu do hệ thống cấp, chọn từ danh sách quản lý. Người chơi không tự nhập nội dung tùy ý. Mỗi người tối đa một Đạo Hiệu và hai huy hiệu hiển thị.
- **OPEN-19**: cấu trúc guild (số thành viên, quyền, ghế).
- **SUPERSEDED.** Tâm Ma là cộng đồng trợ đạo sau thất bại đột phá.

## 17. NPC và tường thuật AI

- **CONFIRMED.** NPC AI hỗ trợ chức năng hệ thống, nhiệm vụ, tường thuật và tương tác. Có thể xuất hiện trong sự kiện.
- **CONFIRMED.** Tường thuật bám sự kiện thật, không bịa, không spam.
- **TUNABLE.** Chức vụ trống do NPC giữ. Người chơi thắng NPC thì lên thay.
- **OPEN-20**: danh mục nhiệm vụ và NPC.

## 18. Tương tác LIVE, reconnect và chống spam

Chi tiết ở SS-15.

- **CONFIRMED.** Reconnect lưu trạng thái ngay lập tức và khôi phục đúng.
- **CONFIRMED.** Tương tác like/comment có hệ thống quy đổi riêng, có chống spam và chống farm.
- **TUNABLE.** Giới hạn tương tác hợp lệ 60 lần/phút mỗi người (từ GAME_FLOW), gộp theo lô.
- **TUNABLE.** Grace khi rớt mạng 60 giây. Trong grace không cộng Tu Vi.
- **OPEN-21**: giá trị chính thức cho grace, credit tối đa, AFK.

## 19. Hậu Tiên Cảnh

- **CONFIRMED.** Sau Tiên Cảnh tiếp tục tu luyện bằng hệ thống hậu Tiên Cảnh (cần thiết kế).
- **OPEN-16**: nội dung hậu Tiên Cảnh. Xem SS-16 có các phương án đề xuất.
- **OPEN-17**: sink kinh tế (SIM_REPORT v0.1 cảnh báo nhóm chi tiêu cao có thể chạm trần sớm).

## 20. Giao diện LIVE

Chi tiết ở SS-14.

- **CONFIRMED.** Tiếng Việt mặc định. Đa ngôn ngữ có thể thêm sau.
- **CONFIRMED.** Bố cục dọc 9:16, OBS Browser Source 1080×1920 (D-005).
- **TUNABLE.** Tên và cảnh giới luôn đọc được. Hiệu ứng không che tên hoặc điểm số quan trọng.

## 21. Nội dung đã loại bỏ hoặc thay thế

| Nội dung cũ | Trạng thái | Lý do | Nguồn |
|---|---|---|---|
| Trang bị và pháp bảo (vũ khí, pháp bảo, hào quang chiến đấu) | SUPERSEDED | Checkpoint loại trừ | Checkpoint |
| Đột phá có thể thất bại, hồi chiêu, đan dược tăng tỉ lệ | SUPERSEDED | Checkpoint: tự động, không thất bại | D-011 (cũ) |
| Tâm Ma và Trợ Đạo | SUPERSEDED | Không còn thất bại để kích hoạt; OPEN-24 nếu PO muốn tái sử dụng | D-011 (cũ) |
| Linh thạch tự động luyện thành Tu Vi | SUPERSEDED | Checkpoint | D-014 (cũ) |
| Tim → Hạ Phẩm Linh Thạch → Tu Vi | SUPERSEDED | Tim cộng trực tiếp Tu Vi | Checkpoint |
| Thang cảnh giới: Chân Tiên là cảnh cuối | SUPERSEDED | Checkpoint: Tiên Cảnh là cảnh cuối | Checkpoint |
| Ngưỡng Tu Vi cũ (Luyện Khí 300 … Độ Kiếp 1.500.000) | SUPERSEDED | Checkpoint | D-020 (cũ) |
| Bảng linh căn cũ (Tứ 1,2×, Nhất Phẩm 2×…) | SUPERSEDED | Checkpoint | GDD v0.3, GAME_FLOW |
| Tiểu cảnh chưa có ngưỡng (Sơ/Trung/Hậu/Đại Viên Mãn) | OPEN-02 | Không có trong checkpoint | — |
| Cơ duyên tặng vũ khí và pháp bảo | SUPERSEDED | Checkpoint | GAME_FLOW §10 |
| Chiến Lực tính từ vũ khí và pháp bảo | SUPERSEDED | Checkpoint | GAME_FLOW §11 |
| Tiêu chí "Full PvP" ngoài MVP | Chỉnh | D-012 đã đưa khiêu chiến vào MVP | OPEN-30 |
| Trao đổi người chơi ngoài MVP | SUPERSEDED | Checkpoint cho phép giao dịch có ranh giới | Checkpoint |

Bản chi tiết từng dòng mâu thuẫn nằm trong `00_PROJECT/GDD_CONFLICT_REPORT.md`.

## 22. Quản trị dự án (liên quan)

- **CONFIRMED.** Đội AI: ChatGPT và Claude. Copilot không thuộc workflow dự án.
- **OPEN-36**: các tài liệu workflow như `AI_ORCHESTRATION.md`, `AI_TASK_ASSIGNMENTS.md`, `AI_HANDOFF.md`, `AI_CONNECTION_CHECK_PROMPT.md` vẫn nhắc Copilot. Không sửa trong nhánh này vì nằm ngoài phạm vi GDD và liên quan đến AI Agency.

## Phụ lục A. Sổ OPEN

| Mã | Chủ đề | Phương án đề xuất (không phải quyết định) | Liên quan |
|---|---|---|---|
| OPEN-01 | Ý nghĩa ngưỡng Tu Vi và trạng thái trước Luyện Khí | Ngưỡng là Tu Vi tích lũy để đạt cảnh giới đó. Trạng thái trước Luyện Khí gọi là "Phàm Nhân" (tạm) | SS-02 |
| OPEN-02 | Tiểu cảnh và ngưỡng | Chia đều mỗi Đại Cảnh thành 4 khoảng bằng nhau (tạm) | SS-02 |
| OPEN-03 | "Xác suất hiếm: cấp Boss × 10%" | Xem SS-03 mục 5 | SS-03 |
| OPEN-04 | Chuẩn hóa hệ số phẩm chất | Nhân hệ số cho Huyền trở lên rồi chia tổng để chuẩn hóa | SS-03 |
| OPEN-05 | Quỹ Top 10 20%/80% | Xem SS-04 mục 4 | SS-04 |
| OPEN-06 | Boss sau despawn | Mặc định L1 theo chữ "reset về L1" | SS-03 |
| OPEN-07 | BOT offline có nhận thưởng Boss không | Có nhận thưởng Boss, không nhận thưởng Top 10 | SS-01, SS-03 |
| OPEN-08 | Thời hạn giữ BOT người chơi | Giữ vô thời hạn, không xóa | SS-01 |
| OPEN-09 | BOT lấp chỗ có rút khi người thật vào không | Không rút (theo chữ checkpoint) | SS-01 |
| OPEN-10 | Bảng quy đổi quà và ngưỡng xu | Chờ catalog TikTok thật | SS-05 |
| OPEN-11 | Quà đặc biệt kích hoạt sự kiện thế giới | Chờ bảng quà | SS-05, SS-06 |
| OPEN-12 | Danh mục sự kiện và điều kiện | Xem SS-06 mục 4 | SS-06 |
| OPEN-13 | Công pháp là nguồn Chiến Lực và tốc độ | Giữ như một loại vật phẩm chức năng, không phải pháp bảo | SS-08, SS-09 |
| OPEN-14 | Công thức Chiến Lực cơ sở | Xem SS-08 mục 2 | SS-08 |
| OPEN-15 | Lệnh bình luận chọn phe và khiêu chiến | Phụ thuộc D-007 | SS-08, SS-14 |
| OPEN-16 | Nội dung hậu Tiên Cảnh | Xem SS-16 | SS-16 |
| OPEN-17 | Sink kinh tế | Xem SS-09 mục 5 | SS-09 |
| OPEN-18 | Tu Vi có chuyển không; chợ | Tu Vi không chuyển; không chợ | SS-10 |
| OPEN-19 | Cấu trúc guild | Xem SS-12 mục 4 | SS-12 |
| OPEN-20 | Danh mục nhiệm vụ và NPC | Chờ thiết kế | SS-11 |
| OPEN-21 | Grace, credit tối đa, AFK | Xem SS-15 | SS-15 |
| OPEN-22 | Điều kiện LIVE đủ điều kiện tu luyện | Xem SS-15 mục 2 | SS-15 |
| OPEN-23 | Quy tắc kiểm duyệt tên | Xem SS-14 mục 6 | SS-14 |
| OPEN-24 | Tâm Ma có được tái sử dụng không | Mặc định không dùng | Mục 16 |
| OPEN-25 | Độ Kiếp: thiên kiếp có tương tác không | Mặc định chỉ trình diễn | Mục 7 |
| OPEN-26 | Vũ khí và pháp bảo trong art spec | Cần PO xác nhận chỉ là hình thức hay không | Art docs |
| OPEN-27 | Nguồn đan dược | Quà và Top 10 | Mục 7 |
| OPEN-28 | Các tab Thiên Bảng | Giữ 4 tab theo GDD v0.3 | Mục 10 |
| OPEN-29 | Tên "Chân Tiên" trong art và tài liệu cũ | Đổi thành "Tiên Cảnh" theo checkpoint | Art docs |
| OPEN-30 | Phạm vi PvP so với PROJECT_BRIEF | Khiêu chiến theo ghế, không PvP tự do | Mục 11 |
| OPEN-31 | Quà cộng Chiến Lực không giới hạn so với nguyên tắc proposal | Giữ D-010, ghi rủi ro | Mục 8 |
| OPEN-32 | "Tim" và "like" có phải cùng một tương tác | Xem xác nhận khi có connector | Mục 7 |
| OPEN-33 | Trợ Chiến khi chưa chọn phe | Không tự cộng cho bên nào | Mục 11 |
| OPEN-34 | Số liệu Linh Khí Triều | Giữ TUNABLE, cân bằng bằng mô phỏng | Mục 12 |
| OPEN-35 | Số ghế và cổng cảnh giới khiêu chiến | Giữ TUNABLE | Mục 11 |
| OPEN-36 | Tài liệu workflow nhắc Copilot | Không sửa trong nhánh này | Mục 22 |
| OPEN-37 | Boss focus có chiếm hàng đợi camera cả trận dài không | Chia Boss focus thành đoạn, xen kẽ với mục không phải Boss | SS-07 mục 6 |
| OPEN-38 | Camera cho khiêu chiến và đổi chức vụ (không có trong bảng ưu tiên checkpoint) | Khiêu chiến là sự kiện vừa, hạng 6; đổi chức vụ hạng 4 | SS-07 mục 2 |
| OPEN-39 | Giá trị thưởng cho bình luận (checkpoint nhắc "comment rewards" nhưng không có số) | 1 bình luận hợp lệ = 1 × hệ số Linh Căn, có trần | SS-15 mục 7 |
| OPEN-40 | Chất lượng TTS tiếng Việt và đọc tên đặc biệt | Thử PoC trước khi dùng cho sự kiện lớn | SS-17 mục 4 |
| OPEN-41 | Thời điểm Boss đầu tiên khi phiên bắt đầu và khoảng nghỉ giữa các Boss | Chưa có; đề xuất 2 phút sau khi phiên bắt đầu hoặc sau khi Boss trước kết thúc | SS-03, SS-06 |
| OPEN-42 | NPC giữ chức trống có được khiêu chiến và trợ chiến không | Có khiêu chiến được; không có trợ chiến | SS-11 mục 5 |
| OPEN-43 | README.md ghi "game plan đã archive" nhưng Issue #40 yêu cầu không đổi trạng thái game thành ARCHIVED | Giữ nguyên trạng thái, chỉ thêm đường dẫn đến GDD master; PO quyết cách ghi trạng thái | Mục 0 (conflict C-27) |

## Phụ lục B. Tham chiếu

- Checkpoint: `00_PROJECT/TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md`
- Quyết định: `00_PROJECT/DECISION_LOG.md`
- Camera: `00_PROJECT/GDD_DECISION_CAMERA_*.md`
- BOT: `00_PROJECT/GDD_DECISION_OFFLINE_BOT_POPULATION.md`
- Proposal: `00_PROJECT/GDD_COMBAT_BOSS_DESIGN_PROPOSAL.md`, `00_PROJECT/GDD_GIFT_SYSTEM_PROPOSAL.md`
- Luồng chơi: `01_GAME_DESIGN/GAME_FLOW_MASTER.md`
- Đặc tả hệ thống: `01_GAME_DESIGN/SYSTEM_SPEC/README.md`
