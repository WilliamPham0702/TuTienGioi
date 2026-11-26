# Code Readiness Audit — TuTienGioi

| Trường | Giá trị |
|---|---|
| Ngày | 2026-11-27 |
| Issue | #40 (vòng 2: audit và roadmap) |
| Căn cứ thiết kế | `01_GAME_DESIGN/GDD_MASTER.md`, `GAME_FLOW_MASTER.md`, `SYSTEM_SPEC/SS-01` đến `SS-18` |
| Căn cứ code | `packages/core`, `packages/live-bridge`, `packages/tiktok-probe`, `poc/` tại `main` @ 99fc8df |
| Phạm vi | Chỉ audit và lập kế hoạch. Không sửa code. Không phát triển Offline Simulator hay AI Agency |

## 1. Cách phân loại

| Nhãn | Nghĩa | Có thể bắt đầu code không? |
|---|---|---|
| **READY** | Thiết kế đã CONFIRMED, không còn OPEN chặn, code hiện có đã phù hợp checkpoint | Có |
| **INCOMPLETE** | Thiết kế đã CONFIRMED đủ để làm, nhưng code thiếu hoặc còn theo thiết kế cũ. Cần sửa hoặc viết mới. Phần không bị OPEN chặn vẫn làm được ngay | Có, một phần |
| **BLOCKED** | Phụ thuộc quyết định PO (OPEN), dữ liệu thật (catalog TikTok), hoặc quyết định phê duyệt kết nối | Chưa. Chỉ làm phần không bị chặn |

Một hệ thống có thể ở nhiều nhãn cùng lúc (ví dụ: lõi đã READY, nhưng phần thưởng BLOCKED). Khi đó ghi cả hai.

## 2. Kết quả tổng quát

| Nhóm | Số hệ thống | READY | INCOMPLETE | BLOCKED |
|---|---:|---:|---:|---:|
| Nền tảng (lưu trữ, log, RNG, kiểm duyệt tên, nhập sự kiện, ánh xạ TikTok) | 6 | 5 | 1 | 1 |
| Gameplay lõi (Linh Căn, Tu Vi, đan, dân số, BOT) | 6 | 0 | 5 | 1 |
| Thế giới (Boss, sự kiện, Top 10, camera) | 4 | 1 | 2 | 3 |
| Xã hội và cạnh tranh (quà, khiêu chiến, tông môn, NPC) | 4 | 0 | 3 | 3 |
| Kinh tế (vật phẩm, sink, giao dịch) | 2 | 0 | 1 | 1 |
| LIVE và trình diễn (TikTok, UI, TTS, thông báo, chống spam) | 5 | 0 | 3 | 2 |
| Hậu Tiên Cảnh | 1 | 0 | 0 | 1 |
| **Tổng** | **28** | **6** | **13** | **11** |

Một hệ thống có thể mang hai nhãn (ví dụ INCOMPLETE và BLOCKED), nên các cột không cộng lại bằng số hệ thống.

Kết luận ngắn: **không có hệ thống gameplay nào đủ điều kiện code đầy đủ theo checkpoint.** Nền tảng kỹ thuật (lưu trữ, log, RNG, kiểm duyệt) có thể dùng tiếp. Phần gameplay cần sửa theo checkpoint, và phần thế giới, kinh tế, LIVE còn nhiều chỗ chờ PO.

Lưu ý về xác minh: sandbox không cài được `vitest`, `tsc` và `ws` do chặn mạng. Test của `packages/core` (khai báo 131 test) và `packages/live-bridge` không chạy được trong lần audit này. Các nhãn READY ở nền tảng là dựa trên đọc code và mã test, chưa dựa trên kết quả chạy test. CI trên PR hiện không chạy test của `packages/core` hay `live-bridge` (chỉ chạy workflow agency).

## 3. Bảng audit chi tiết

### 3.1 Nền tảng

| ID | Hệ thống | Bằng chứng code | Nhãn | Lý do và việc còn lại | Spec |
|---|---|---|---|---|---|
| P-01 | Lưu trữ SQLite và khôi phục | `core/src/store.ts`, `persistence.test.ts` (khai báo test khôi phục 20 điểm tắt) | READY | Khớp SS-18. Cần chạy lại test trên máy có npm | SS-18 |
| P-02 | Nhật ký kiểm toán chuỗi băm | `core/src/audit.ts`, `MemoryAuditLog`, `SqliteAuditLog` | READY | Khớp SS-18 mục 3 (nhật ký vận hành) | SS-18 |
| P-03 | RNG có hạt giống (tái lập được) | `core/src/rng.ts`, `weightedPick` | READY | Nền cho mọi tỉ lệ và kiểm thử lặp lại | SS-18 mục 4.5 |
| P-04 | Kiểm duyệt tên người chơi | `core/src/moderation.ts` (`NameFilter`, danh sách token, bỏ dấu tiếng Việt) | READY | Khớp SS-14 mục 6. Danh sách từ cấm cần PO rà soát nội dung | SS-14 |
| P-05 | Nhập sự kiện chuẩn hóa và bộ nguồn mô phỏng | `core/src/types.ts` (`GameEvent`), `sim.ts`, `runner.ts` | READY (chỉ mô phỏng) | Nguồn mô phỏng dùng được. Nguồn TikTok thật bị BLOCKED (P-06) | GAME_FLOW mục J |
| P-06 | Ánh xạ sự kiện TikTok | `live-bridge/src/tiktok-map.ts`, `sources.ts` | INCOMPLETE + BLOCKED | Ánh xạ có test (`tiktok-map.test.ts`). Chưa có nguồn thật được duyệt (D-007). Bảng quà thật chờ OPEN-10 | SS-15, SS-05 |

### 3.2 Gameplay lõi

| ID | Hệ thống | Bằng chứng code | Nhãn | Lý do và việc còn lại | Spec |
|---|---|---|---|---|---|
| G-01 | Linh Căn (7 bậc) | `config.ts` `roots`: 40/25/18/10/5/1,8/0,2 và hệ số 1,0–3,0 | INCOMPLETE | Lệch checkpoint. Checkpoint: 35/25/18/12/6/3/1 và hệ số ×1 đến ×10 (Thánh thể). Sửa được ngay, không bị OPEN chặn | SS-02 mục 3 |
| G-02 | Tu Vi, cảnh giới, đột phá | `config.ts` `realms`, `autoBreakthrough`, `breakCooldownMs`; `engine.ts` `tryBreakthrough` có nhánh `'fail'` và `'cooldown'` | INCOMPLETE | Lệch: còn thất bại và hồi chiêu (D-011 đã SUPERSEDED). Ngưỡng cũ 300/1.500.000 (D-020 SUPERSEDED). Sửa ngay: bỏ thất bại, đặt ngưỡng checkpoint. Tiểu cảnh chờ OPEN-02 | SS-02 |
| G-03 | Đan dược | `config.ts` `pills` (Tụ Khí tăng 20% trong 5 phút; Trúc Cơ tăng tỉ lệ đột phá) | INCOMPLETE | Lệch: checkpoint là cộng Tu Vi cố định 100 đến 40.000. Sửa được ngay | SS-02 mục 7 |
| G-04 | Dân số và filler | Không có code (0 khớp `filler`, `population`) | INCOMPLETE | Thiết kế đầy đủ (SS-01). Cần module mới. OPEN-08 và OPEN-09 không chặn bước đầu | SS-01 |
| G-05 | BOT sở hữu và trả quyền | Chưa có module riêng. `engine.ts` có `presenceTimeoutMs` và `maxTickGapMs` nhưng chưa có trạng thái BOT | INCOMPLETE | Cần trạng thái nghỉ/BOT và cơ chế trả quyền (SS-01, SS-18) | SS-01, SS-13 |
| G-06 | Hành vi BOT (AI trong game) | Không có code BOT (0 khớp `bot` trong `core/src` và `live-bridge/src`) | BLOCKED | Chờ OPEN-08 (hành vi) và chốt đơn giản cho MVP | SS-13 |

### 3.3 Thế giới

| ID | Hệ thống | Bằng chứng code | Nhãn | Lý do và việc còn lại | Spec |
|---|---|---|---|---|---|
| W-01 | Boss L1–L7 | Không có code (0 khớp `boss`) | BLOCKED | Chưa chốt OPEN-03 (hiếm ×10%) và OPEN-06 (Boss kế tiếp). Phần cơ bản (vòng đời, despawn 5 phút, công thức thưởng) có thể làm trước | SS-03 |
| W-02 | Sự kiện thế giới và Linh Khí Triều | `config.ts` `tide` (×2 trong 3 phút, ngưỡng 2.000, trần 6 lần); `engine.ts` đã có nhánh tide | READY (Linh Khí Triều, TUNABLE) và cần sửa Tâm Ma | Linh Khí Triều khớp SS-06 (TUNABLE). Tâm Ma (`xinMa`, `Tâm Ma` xuất hiện 7 lần) là SUPERSEDED và phải gỡ | SS-06 |
| W-03 | Top 10 và Thiên Bảng | `engine.ts` có leaderboard (4 khớp), `config.ts` `badges` | INCOMPLETE + BLOCKED | Xếp hạng cần sửa theo checkpoint (cảnh giới rồi Tu Vi). Chia quỹ chờ OPEN-05. Code có 4 tab (`tuVi`, `chienLuc`, `beQuan`, `cungPhung`) nhưng chưa khớp SS-04; tên và số tab chờ OPEN-28 | SS-04 |
| W-04 | Camera và hàng đợi ưu tiên | `announce.ts` có hàng đợi ưu tiên `high/medium/low/textOnly`, nhưng chưa có thứ tự camera, thời lượng 3/5/8/12/15 giây, hay ưu tiên Boss | INCOMPLETE + BLOCKED | Hàng đợi chung dùng được. Thứ tự camera (SS-07 mục 2) làm được. Boss chặn hàng đợi chờ OPEN-37; khiêu chiến chờ OPEN-38 | SS-07 |

### 3.4 Xã hội và cạnh tranh

| ID | Hệ thống | Bằng chứng code | Nhãn | Lý do và việc còn lại | Spec |
|---|---|---|---|---|---|
| S-01 | Quà và định tuyến | `engine.ts` `onGift` (quy đổi `tuViPerDiamond`, phân nhánh bên A/B), `TikTokMapper` | INCOMPLETE + BLOCKED | Định tuyến cần sửa (người gửi không LIVE vào kho chung; người nhận BOT được nâng cấp). Bảng bậc quà và ngưỡng xu chờ OPEN-10 (catalog TikTok thật) | SS-05 |
| S-02 | Khiêu chiến và Chiến Lực | `engine.ts` `pickSeat`, `resolveChallenge`, `combatPower`, `assistPowerPerDiamond`; `config.ts` `powerSwing: 0.1` (D-016) | INCOMPLETE | Đúng: ±10% (D-016), Trợ Chiến 30 giây, bên bị khiêu chiến thắng khi hòa. Lệch: `combatPower` còn nhân với `weaponPct` và `treasurePct`; cần bỏ. Làm tròn khi hòa chờ OPEN-14 | SS-08 |
| S-03 | Chức vụ và tông môn | `types.ts` `SeatRole` (`truongLao`, `truongPhai`, `tongChu`); `config.ts` `seatCount`, `npcPower` | INCOMPLETE + BLOCKED | Có khung ghế NPC và cổng cảnh giới. Chưa có tông môn (0 khớp `guild`). Host khi chưa có người giành chờ OPEN-19 | SS-12 |
| S-04 | NPC và nhiệm vụ | Chưa có hệ thống nhiệm vụ. NPC chỉ có dạng ghế NPC giữ chức (`engine.ts` `resolveChallenge`, `types.ts` `holder: null`) | BLOCKED | Quy tắc NPC giữ chức trống chờ OPEN-42. Nhiệm vụ chưa có thiết kế chi tiết đủ để code | SS-11 |

### 3.5 Kinh tế

| ID | Hệ thống | Bằng chứng code | Nhãn | Lý do và việc còn lại | Spec |
|---|---|---|---|---|---|
| E-01 | Vật phẩm và cơ duyên | `config.ts` `fortuneItemPct: { gongfa, weapon, treasure }`, `fortuneTable`; `engine.ts` `runFortune` | INCOMPLETE | Lệch: có vũ khí và pháp bảo (đã loại). Cần bỏ hai loại, giữ công pháp (OPEN-13 về cách dùng) | SS-09, SS-06 |
| E-02 | Linh thạch, sink, giao dịch | `config.ts` `tuViPerLowStone: 10`, `likeToLowStone` (quy đổi linh thạch → Tu Vi, SUPERSEDED). Giao dịch: 2 khớp, chưa có module | BLOCKED | Quy đổi linh thạch → Tu Vi phải gỡ (D-028). Sink chờ OPEN-17. Giao dịch cần OPEN-18 | SS-09, SS-10 |

### 3.6 LIVE và trình diễn

| ID | Hệ thống | Bằng chứng code | Nhãn | Lý do và việc còn lại | Spec |
|---|---|---|---|---|---|
| L-01 | Kết nối TikTok LIVE thật | `tiktok-probe/` chỉ đọc, có `--dry-run`; PO chạy trên máy của mình | BLOCKED | Chờ phê duyệt connector (D-007). Không dùng connector không chính thức trên tài khoản thật. Không yêu cầu mật khẩu, cookie, token | SS-15 |
| L-02 | Giao diện LIVE (OBS 1080×1920) | `dashboard.ts` (bảng điều khiển web local); `poc/phaser` và `poc/godot` là PoC | INCOMPLETE | PoC hiển thị được. Chưa có giao diện sản phẩm theo SS-14. Chờ OPEN-28 (bốn tab) | SS-14 |
| L-03 | TTS tiếng Việt | Chưa có TTS. `announce.ts` có cờ `speak` | BLOCKED | Chất lượng và đọc tên chưa kiểm chứng (OPEN-40). PoC trước | SS-17 |
| L-04 | Hàng đợi thông báo và tường thuật | `announce.ts` (nhịp 3,5 giây, bỏ mục thấp khi quá tải) | INCOMPLETE | Cơ chế có. Thiếu phân mức theo SS-17 mục 2 và gộp sự kiện cùng lúc (SS-17 mục 3). Tường thuật AI chưa có | SS-17 |
| L-05 | Chống spam và heartbeat | `config.ts` `likeCapPerMinute: 60`, `presenceTimeoutMs: 30_000`, `maxTickGapMs` | INCOMPLETE | Giới hạn 60/phút có. Heartbeat theo SS-15 là 45 giây và grace 60 giây, còn lệch 30 giây. Thưởng bình luận chờ OPEN-39 | SS-15 |

### 3.7 Hậu Tiên Cảnh

| ID | Hệ thống | Bằng chứng code | Nhãn | Lý do và việc còn lại | Spec |
|---|---|---|---|---|---|
| T-01 | Tiến trình sau Tiên Cảnh | Chưa có | BLOCKED | Chờ chọn phương án A/B/C (OPEN-16) và sink (OPEN-17) | SS-16 |

## 4. Những thứ cần gỡ khỏi code (đã SUPERSEDED)

Liệt kê để việc sửa không bỏ sót. Mỗi mục đã có trong `GDD_CONFLICT_REPORT.md`.

| Mục | Vị trí trong code | Thay bằng |
|---|---|---|
| Linh Căn cũ (40/25/18/10/5/1,8/0,2) | `config.ts` `roots` | Bảng checkpoint (SS-02 mục 3) |
| Ngưỡng cảnh giới cũ | `config.ts` `realms` | Ngưỡng checkpoint (SS-02 mục 5) |
| Đột phá có thất bại, hồi chiêu | `config.ts` `breakChance`, `breakCooldownMs`; `engine.ts` `tryBreakthrough` | Đột phá tự động (SS-02 mục 6) |
| Đan dược tăng tốc, tăng tỉ lệ | `config.ts` `pills` | Đan cộng Tu Vi cố định (SS-02 mục 7) |
| Quy đổi linh thạch → Tu Vi | `config.ts` `tuViPerLowStone`, `likeToLowStone` | Linh thạch không tự luyện hóa (D-028) |
| Vũ khí, pháp bảo trong cơ duyên và Chiến Lực | `config.ts` `fortuneItemPct`, `fortune`; `engine.ts` `combatPower`, `runFortune` | Không trang bị, không pháp bảo (checkpoint) |
| Tâm Ma (`xinMa`) | `config.ts` `xinMa`; `engine.ts` và `announce` liên quan | Gỡ hoàn toàn (SS-06 mục 8) |

## 5. Dependency và roadmap

### 5.1 Quyết định PO cần thiết trước khi code phần BLOCKED

Gom thành một gói để PO trả lời một lần. Mỗi mục có đề xuất mặc định trong `GDD_MASTER.md` phụ lục A.

| Gói | OPEN | Chặn những gì |
|---|---|---|
| A. Cảnh giới | OPEN-01, OPEN-02 | Tên trạng thái đầu, tiểu cảnh, ngưỡng cấp nhỏ |
| B. Boss | OPEN-03, OPEN-05, OPEN-06 | Bảng Boss hiếm, Top 10 quỹ, Boss kế tiếp |
| C. Quà | OPEN-10, OPEN-31 | Bảng quà, ngưỡng xu, giới hạn quà Chiến Lực |
| D. Chiến đấu | OPEN-13, OPEN-14, OPEN-15, OPEN-33 | Công pháp, làm tròn khi hòa, hệ số |
| E. Camera | OPEN-37, OPEN-38 | Boss chặn hàng đợi, khiêu chiến trong camera |
| F. Kinh tế | OPEN-17, OPEN-18 | Sink linh thạch, giao dịch |
| G. Xã hội | OPEN-19, OPEN-42 | Host tông môn, NPC giữ chức trống |
| H. LIVE và TTS | OPEN-39, OPEN-40, OPEN-28 | Thưởng bình luận, TTS, bốn tab |
| I. Hậu Tiên Cảnh | OPEN-16 | Chọn phương án A/B/C |
| J. Hạ tầng | OPEN-43, OPEN-44, OPEN-45 | Trạng thái README, nhiều máy chủ, quyền riêng tư |
| K. Kết nối thật | D-007 (phê duyệt connector) | Kết nối TikTok thật |

### 5.2 Thứ tự triển khai đề xuất

Thứ tự theo phụ thuộc. Phase 1 không cần chờ PO vì toàn bộ thuộc CONFIRMED.

| Phase | Việc | Phụ thuộc | Nhãn đầu vào |
|---|---|---|---|
| 1 | Đồng bộ `config.ts` và `engine.ts` với checkpoint: Linh Căn, ngưỡng, bỏ thất bại, đan, gỡ Tâm Ma, gỡ vũ khí và pháp bảo, heartbeat | Không | G-01, G-02, G-03, W-02, E-01, L-05 (phần CONFIRMED) |
| 2 | Dân số, filler, BOT sở hữu, trả quyền | Phase 1 | G-04, G-05 |
| 3 | Boss: vòng đời, công thức thưởng, rơi đồ (phần không chặn) | Phase 2, gói B | W-01 |
| 4 | Top 10 theo cảnh giới rồi Tu Vi; chia quỹ khi có OPEN-05 | Phase 3, gói B | W-03 |
| 5 | Camera: thứ tự, thời lượng; Boss chặn hàng đợi khi có OPEN-37 | Phase 3, gói E | W-04 |
| 6 | Định tuyến quà; bảng quà khi có OPEN-10 (catalog thật) | Phase 1, gói C, D-007 | S-01, P-06 |
| 7 | Chiến Lực và khiêu chiến: bỏ vũ khí, làm tròn khi hòa khi có OPEN-14 | Phase 1, gói D | S-02 |
| 8 | Vật phẩm, sink linh thạch, giao dịch | Phase 7, gói F | E-01, E-02 |
| 9 | Tông môn, NPC, BOT AI | Phase 2, gói G | S-03, S-04, G-06 |
| 10 | Thông báo, camera thực, tường thuật; TTS sau PoC | Phase 5, gói H | L-03, L-04 |
| 11 | Kết nối TikTok thật (chỉ sau phê duyệt; PO tự chạy probe) | Gói K | L-01 |
| 12 | Hậu Tiên Cảnh | Gói I, Phase 8 | T-01 |

Song song được: Phase 1 và việc chốt gói A–J; L-02 (giao diện) có thể làm song song từ Phase 2 trở đi.

### 5.3 Điều không được làm

- Không code theo thiết kế cũ (thất bại đột phá, vũ khí, pháp bảo, Tâm Ma, Chân Tiên).
- Không đoán bảng quà hay ngưỡng xu từ TikTok; phải lấy từ catalog thật (OPEN-10).
- Không chạy connector TikTok không chính thức trên tài khoản thật.
- Không lưu mật khẩu, cookie hay token TikTok.
- Không phát sinh chi phí ngoài 0 VND (D-008).

## 6. Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Code hiện tại mâu thuẫn checkpoint và nếu dùng ngay sẽ chạy theo thiết kế cũ | Cao | Phase 1 làm đầu tiên, có test khớp checkpoint |
| Test không chạy được trong sandbox nên không xác nhận được 131 test | Trung bình | Chạy `npm test` trên máy có Node 22 trước khi nhận Phase 1 |
| Quà có thể tạo lợi thế không giới hạn (D-010, OPEN-31) | Cao | Gói C trước khi bật quà Chiến Lực trên môi trường thật |
| Boss và camera chặn lẫn nhau | Trung bình | Gói E trước Phase 5 |
| Chưa có kết nối TikTok thật, nên toàn bộ dữ liệu LIVE mới là mô phỏng | Cao | Probe do PO chạy; không suy diễn số liệu thật |
| Bảng quà không có catalog thật | Cao | Chặn Phase 6 đến khi có OPEN-10 |

## 7. Việc không thuộc audit này

- Sửa code: không làm trong vòng này. Phase 1 là việc của task code riêng.
- Offline Simulator và AI Agency: ngoài phạm vi theo issue.
- `09_SIMULATION/`: số liệu cũ, chạy lại sau khi chốt gói A và F.
- Art và content còn Tâm Ma, vũ khí, Chân Tiên: xem `GDD_CONFLICT_REPORT.md` C-52.
