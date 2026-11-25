# C-003 — Game core v0.1 và rà soát kỹ thuật các đặc tả

- Owner: Claude · Ngày: 2026-11-25 · Nhánh: `claude/c-003-game-core` (dựng trên `docs/game-flow-v0.1`)
- Đã đọc: `GAME_FLOW_v0.1`, `FEATURE_SPEC_v0.1`, `GDD_v0.3`, `DECISION_LOG` (D-001…D-018)
- Không đổi tài liệu sản phẩm. Mọi chỗ cần PO/ChatGPT chốt nằm ở mục 3.

## 1. Đã làm: `packages/core`

Lõi luật thuần TypeScript, chạy được với Local Simulation, độc lập engine (D-005 chưa khóa).

| Luật | Nguồn | Trạng thái |
|---|---|---|
| Nhân vật ngẫu nhiên, cố định theo người chơi | D-013 | Có, có test |
| Linh căn 7 bậc, đo 1 lần/phiên, phiên sau đo lại, giữ Tu Vi | D-009 | Có, có test phân bố (20.000 lần, seed cố định) |
| Tu Vi theo giây × hệ số linh căn; dừng sau 30 giây không có bằng chứng hiện diện | GAME_FLOW §5 | Có |
| Tim → Hạ Phẩm Linh Thạch → Tu Vi, trần 60/phút | D-014 | Có |
| Quà → Tu Vi theo bảng cố định, không trần | D-010 | Có (hệ số tạm) |
| 10 Đại Cảnh × 4 Tiểu Cảnh, đột phá có thể thất bại, không mất Tu Vi, hồi 60 giây, Đan dược tăng tỉ lệ 1 lần | D-011 | Có |
| Khiêu chiến: ngưỡng cảnh giới, ghế, hồi chiêu 5 phút, miễn khiêu chiến 2 phút, NPC giữ ghế trống | D-012 | Có |
| Chiến Lực = Tu Vi × (1+công pháp) × (1+vũ khí) × (1+pháp bảo), dao động ±10%, hòa → bên thủ thắng | D-016 | Có, có test |
| Cửa sổ Trợ Chiến 30 giây, chọn phe `!ung A/B`, quà cộng Chiến Lực cố định | D-018 | Có (xem mục 3, câu 1) |
| Tông Chủ do người chơi giữ → host thành Thái Thượng Tông Chủ | D-015 | Có (cờ `hostSupreme`) |
| Cơ duyên: chọn đều trong người hiện diện, không ưu tiên người tặng quà | GAME_FLOW §10 | Có, có test thống kê |
| Hàng đợi thông báo: ưu tiên, 1 câu đọc/3,5 giây, quá tải bỏ mục thấp, không bỏ mục cao | GAME_FLOW §12 | Có |
| Chống xử lý trùng theo ID sự kiện; snapshot/khôi phục | Brief §4.5 | Có |

**Bằng chứng:** `cd packages/core && npm install && npm test` → **31/31 đạt**; `npm run typecheck` sạch (chạy trên máy cloud, 2026-11-25). Đây là test đơn vị trên logic; chưa đo hiệu năng, chưa nối SQLite, chưa nối TikTok.

**Chưa làm (thuộc MVP theo GDD v0.3):** Linh Khí Triều, Tâm Ma, Thiên Bảng (4 tab, Cúng Phụng theo phiên), Đạo Hiệu/Danh Hiệu, kiểm duyệt tên, TTS, lưu SQLite, operator/audit log.

## 2. Rà soát: mâu thuẫn và rủi ro kỹ thuật trong đặc tả

Mức: **Chặn** = không làm đúng được nếu chưa giải quyết; **Cao**; **Vừa**.

### 2.1 Mâu thuẫn giữa các tài liệu

| # | Mức | Vấn đề | Tôi đã làm gì |
|---|---|---|---|
| A | Cao | **Quà của người xem chưa chọn phe.** GAME_FLOW §11.1: mặc định cho bên giữ chức. FEATURE_SPEC §5 và GDD v0.3 §9.3: không tự cộng cho phe nào. | Cấu hình `assistDefaultSide`, mặc định `'none'` (theo hai tài liệu mới hơn, an toàn hơn). Đổi bằng 1 dòng |
| B | Vừa | Quy đổi Hạ Phẩm → Tu Vi: GAME_FLOW = 10; mô phỏng gợi ý thử 3 (GDD v0.3 §6.1). | Cấu hình 10; chưa đổi. Cần PO duyệt sau mô phỏng |
| C | Vừa | GAME_FLOW §6: "tặng hoa" là nguồn Tu Vi riêng; chưa có bảng quà → Tu Vi. | Dùng `tuViPerDiamond = 20` tạm cho mọi quà |

### 2.2 Chỗ đặc tả chưa đủ để lập trình (tôi đã chọn tạm, cần xác nhận)

| # | Câu hỏi | Quy ước tạm trong core |
|---|---|---|
| 1 | Có nhiều ghế cùng chức (4 Trưởng Lão, 2 Trưởng Phái): người khiêu chiến đánh ghế nào? | Ghế có Chiến Lực **thấp nhất** trong chức đó |
| 2 | Người đang giữ ghế A đi giành ghế B, thắng thì ghế A thế nào? | Bỏ ghế A (NPC giữ lại) |
| 3 | Tông Chủ (người chơi) bị đánh bại: host còn là Thái Thượng Tông Chủ không? | Giữ nguyên cờ Thái Thượng (chưa quay lại) |
| 4 | Tu Vi vượt mức khi đã đầy Đại Viên Mãn rồi đột phá thất bại: phần dư xử lý ra sao? | Phần dư chỉ nằm trong tổng Tu Vi (tính Chiến Lực), **không** chuyển sang Đại Cảnh mới. Thực tế người chơi giàu quà sẽ "đầy" nhanh rồi chờ đột phá — cần PO quyết có chuyển dư hay không |
| 5 | Quà đến trễ sau 30 giây (độ trễ mạng) | Bỏ khỏi trận (vẫn được Tu Vi). Có thể cần thời gian ân hạn vài giây |
| 6 | Khiêu chiến người chơi thường (không ghế): thắng thì nhận gì? | Chỉ thông báo, không phần thưởng |
| 7 | Đan dược đột phá lấy từ đâu? | Chỉ từ cơ duyên (D-014: không mua bằng linh thạch) |

### 2.3 Phụ thuộc vào TikTok — chưa kiểm chứng, ảnh hưởng thiết kế

| # | Mức | Vấn đề |
|---|---|---|
| T1 | **Chặn** | **"Tu Vi theo giây xem" cho người xem im lặng.** Nguồn nêu các loại sự kiện: bình luận, quà, like, vào phòng, theo dõi, chia sẻ, số người xem. Chưa thấy nguồn nào nói có sự kiện "đang xem" theo từng người hay sự kiện rời phòng. Nếu đúng, core không có "heartbeat" thật; adapter phải suy ra hiện diện từ vào phòng/bình luận/like/quà, và người chỉ xem im lặng có thể bị tính sai. GDD v0.3 §5.2 đã cảnh báo hướng này. **Cần PoC-3 TikTok để đo.** |
| T2 | Cao | **Định danh bền vững.** Tiến trình lưu qua phiên cần ID ổn định (không dùng tên hiển thị). Chưa biết connector trả trường nào, có bị che ở gói miễn phí không. Nếu không ổn định, không thể giữ Tu Vi/chức vụ qua phiên |
| T3 | Cao | **Tim theo người gửi.** Core đang nhận `like` kèm `playerId`. Nếu nguồn chỉ có tổng tim (FEATURE_SPEC §1 đã lường trước), Linh Thạch từ tim theo cá nhân và trần 60/phút không làm được; Linh Khí Triều vẫn làm được bằng tổng. Cần thêm sự kiện `communityLike` không có người gửi |
| T4 | Cao | **Quà kèm phe.** Quà TikTok không mang tham số "ủng hộ A/B". Phải chọn phe bằng bình luận **trước** khi tặng (core đã làm vậy); người tặng quên chọn thì quà không tính vào trận. UX cần nói rõ |
| T5 | Cao | **Combo quà.** Tổng chạy của chuỗi combo phải xử lý theo phần chênh; core chưa làm vì chưa biết dạng dữ liệu thật |
| T6 | Vừa | **Bình luận lệnh tiếng Việt.** `!khieuchien Trưởng Lão` có dấu/không dấu, sai chính tả; core đã nhận vài biến thể, chưa đủ |
| T7 | Vừa | **Tên hiển thị**: kiểm duyệt trước khi hiện/đọc; core chưa có |
| T8 | Chặn (chính sách) | D-018 + D-010 (quà → sức mạnh không trần, doanh thu từ quà) cần PO tự đọc chính sách kiếm tiền của TikTok trong app trước LIVE thật. Tôi không xác minh được văn bản này |

### 2.4 Rủi ro hiệu năng/vận hành

- **Số nhân vật hiển thị**: tối đa ~60–80 (PoC), nhưng người xem có thể đông hơn. Cần quy tắc ai được hiện (đang hoạt động gần nhất? chức vụ trước?) — chưa có trong đặc tả.
- **Nhiều thông báo cùng lúc**: core giới hạn nhịp đọc 3,5 giây; khi quá tải sẽ bỏ thông báo thấp. Hàng chục người đột phá cùng lúc sẽ rất dài; GAME_FLOW §8 đã nói xếp hàng hiệu ứng ~5–8 giây — cần giới hạn trần ở lớp hiển thị.
- **Kinh tế**: SIM_REPORT cảnh báo nhóm chi tiêu cao chạm Chân Tiên trong vài tháng; core có `Chân Tiên` là đích cuối, chưa có "sink".

## 2.5 PO đã trả lời (25/11/2026)

- Quà của người xem chưa chọn phe: **không tính vào trận; quà thành Tu Vi của người tặng** (core đã đúng như vậy, `assistDefaultSide = 'none'`).
- Quà đến trễ: **ân hạn 3 giây** sau khi hết 30 giây (đã làm: `assistGraceMs = 3000`, trận chốt ở giây 33; lệnh `!ung` vẫn chỉ nhận trong 30 giây).
- 7 quy ước tạm ở mục 2.2: **dùng tạm như đề xuất**.
- Đây là trả lời trong chat, chưa ghi vào `DECISION_LOG.md` (ChatGPT/PO ghi nếu muốn khóa).

## 3. Cần PO / ChatGPT quyết (còn lại: câu 4)

1. **Quà chưa chọn phe**: không tính vào trận (đang dùng) hay mặc định cho bên giữ chức?
2. Mục 2.2, câu 1–4 (chọn ghế, nhường ghế, Thái Thượng sau khi mất ghế, Tu Vi dư khi đột phá).
3. Có cho **thời gian ân hạn** nhận quà trễ sau khi hết 30 giây không?
4. Ưu tiên bước tiếp theo: (a) lưu SQLite + khôi phục + adapter mô phỏng; (b) Linh Khí Triều, Tâm Ma, Thiên Bảng; (c) PoC-3 TikTok để trả lời T1–T3 (cần PO duyệt, xem `TECHNICAL_ARCHITECTURE_PROPOSAL.md` mục 5–6).

## 4. Handoff

- Task: C-003 · Owner: Claude → ChatGPT (xem 2.1–2.2) → PO (mục 3)
- Thay đổi: `packages/core/**`, `08_TECHNICAL/CORE_AND_SPEC_REVIEW_v0.1.md`, `.gitignore`
- Test: 31/31 đạt (sau khi thêm ân hạn 3 giây) (vitest), tsc sạch — máy cloud, 2026-11-25
- Giới hạn: số liệu kinh tế là tạm; chưa chạy trên PC của PO; chưa có kết nối TikTok
- Không merge khi chưa được PO duyệt
