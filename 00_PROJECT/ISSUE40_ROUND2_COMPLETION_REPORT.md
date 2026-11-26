# Issue #40 — Báo cáo hoàn thành (vòng 2: audit, hoàn thiện spec, roadmap)

| Trường | Giá trị |
|---|---|
| Issue | WilliamPham0702/TuTienGioi#40 |
| Ngày | 2026-11-27 |
| Căn cứ | Checkpoint 2026-11-26 (`00_PROJECT/TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md`), `GDD_MASTER.md`, `GAME_FLOW_MASTER.md`, `SYSTEM_SPEC/SS-01..SS-18` |
| Phạm vi | Chỉ tài liệu. Không sửa code, engine, stack, connector. Không phát triển Offline Simulator hay AI Agency |

## 1. Đã làm trong vòng này

1. **Đồng bộ GDD với checkpoint:** đã hoàn tất ở vòng 1 (PR #41, đã merge). Vòng này kiểm tra lại: không có số liệu nào của checkpoint bị thay đổi.
2. **Hoàn thiện spec còn thiếu:** thêm **SS-18 — Dữ liệu, lưu trữ và khôi phục** (ràng buộc không xóa nhân vật, không reset Tu Vi nếu không đồng ý, ghi theo giao dịch, chống nhận trùng, khôi phục tất định). Thêm vào chỉ mục SS.
3. **Thêm OPEN mới:** OPEN-44 (hạ tầng nhiều máy chủ) và OPEN-45 (xuất dữ liệu cá nhân), ghi trong phụ lục A của `GDD_MASTER.md`.
4. **Audit toàn bộ hệ thống:** 28 mục (nền tảng, gameplay, thế giới, xã hội, kinh tế, LIVE, hậu Tiên Cảnh) được phân loại READY, INCOMPLETE hoặc BLOCKED, kèm bằng chứng từ code. Kết quả trong `00_PROJECT/CODE_READINESS_AUDIT.md`.
5. **Dependency và roadmap:** 12 phase theo phụ thuộc, 11 gói quyết định PO (gói A đến K), danh sách điều không được làm, rủi ro.
6. **Code Readiness Audit** và báo cáo này.

## 2. Kết quả audit

**Kết luận:** không có hệ thống gameplay nào đủ điều kiện code đầy đủ theo checkpoint. Code hiện tại vẫn mang thiết kế cũ ở Linh Căn, ngưỡng cảnh giới, đột phá có thất bại, đan dược, vũ khí, pháp bảo và Tâm Ma. Module Boss, dân số/filler và tông môn chưa có code.

| Nhãn | Số mục | Ví dụ |
|---|---:|---|
| READY | 6 | Lưu trữ SQLite, nhật ký băm, RNG tái lập, kiểm duyệt tên, nhập sự kiện và mô phỏng, Linh Khí Triều (TUNABLE) |
| INCOMPLETE | 13 | Linh Căn, ngưỡng và đột phá, đan dược, dân số/filler, BOT sở hữu, Chiến Lực, cơ duyên, hàng đợi camera, heartbeat |
| BLOCKED | 11 | Boss hiếm (OPEN-03), tiểu cảnh (OPEN-02), bảng quà (OPEN-10), sink (OPEN-17), giao dịch (OPEN-18), TTS (OPEN-40), kết nối TikTok thật (D-007), hậu Tiên Cảnh (OPEN-16) |

Một hệ thống có thể mang hai nhãn, nên tổng không bằng 28.

Phase 1 của roadmap (đồng bộ `config.ts` và `engine.ts` với checkpoint các mục CONFIRMED) **không cần chờ PO** và là bước đầu tiên.

## 3. File thay đổi

| File | Loại | Nội dung |
|---|---|---|
| `01_GAME_DESIGN/SYSTEM_SPEC/SS-18_data_persistence_recovery.md` | Mới | Spec dữ liệu, lưu trữ, khôi phục |
| `01_GAME_DESIGN/SYSTEM_SPEC/README.md` | Sửa | Thêm SS-18 và con trỏ đến audit |
| `01_GAME_DESIGN/GDD_MASTER.md` | Sửa | Thêm OPEN-44, OPEN-45 vào phụ lục A |
| `00_PROJECT/CODE_READINESS_AUDIT.md` | Mới | Audit READY/INCOMPLETE/BLOCKED, roadmap, dependency, rủi ro |
| `00_PROJECT/ISSUE40_ROUND2_COMPLETION_REPORT.md` | Mới | Báo cáo này |

Không sửa file code, config hay connector nào.

## 4. Validation

| Kiểm tra | Phạm vi | Kết quả |
|---|---|---|
| Liên kết markdown tương đối | GDD_MASTER, GAME_FLOW_MASTER, SYSTEM_SPEC, GDD_CONFLICT_REPORT, CODE_READINESS_AUDIT, GDD_SYNC_COMPLETION_REPORT | Đạt, không có liên kết hỏng |
| OPEN được tham chiếu nhưng chưa định nghĩa | Các file trên | Đạt, không có |
| OPEN trùng trong phụ lục A | `GDD_MASTER.md` | Đạt, không có |
| Mỗi SS có mục Nhãn | 18 file SS | Đạt (18/18) |
| Số SS khớp chỉ mục | `SYSTEM_SPEC/README.md` | Đạt (SS-01 đến SS-18) |
| Chân Tiên ngoài dòng đổi tên/SUPERSEDED | Các file thiết kế | Đạt (vòng 1) |
| Trang bị/pháp bảo như nội dung được duyệt | Các file thiết kế | Đạt (vòng 1; chỉ còn trong dòng cấm) |
| Số liệu audit đối chiếu với code | `CODE_READINESS_AUDIT.md` | Đạt sau khi sửa 5 chỗ sai (xem mục 5) |
| `npm test` (packages/core) | Code | **Không chạy được** trong sandbox (chặn registry npm). Chưa xác nhận 131 test |
| `npm test` (packages/live-bridge) | Code | **Không chạy được**: thiếu gói `ws` (môi trường). 7/8 test chạy được, 1 file lỗi do thiếu `ws` |
| `tsc --noEmit` | Code | **Không chạy được** (thiếu `@types/node` trong môi trường) |
| CI trên PR | GitHub Actions | Xem mục 6 |

Các kiểm tra không chạy được là giới hạn của môi trường, không phải lỗi code đã biết. Nên chạy `npm test` và `npm run typecheck` trên máy có Node 22 trước khi nhận Phase 1.

## 5. Sửa trong quá trình tự kiểm tra

Khi đối chiếu audit với code, đã sửa 5 chỗ sai trước khi commit:
- G-06: ghi "có tên biến bot" → sửa thành "không có code BOT" (đã kiểm tra: 0 khớp).
- S-04: ghi "quest/npc ở tên biến" → sửa thành "chưa có hệ thống nhiệm vụ; chỉ có ghế NPC".
- W-03: thiếu thông tin về 4 tab → sửa thành "code có 4 tab, tên khác SS-04".
- S-02: làm rõ `combatPower` nhân `weaponPct` và `treasurePct` (đã đúng, chỉ làm rõ).
- Bảng tổng hợp mục 2: đếm lại từ bảng chi tiết (ban đầu sai ở nhiều nhóm).

## 6. Commit, PR và merge

Đang thực hiện ở bước tiếp theo: tạo nhánh `docs/issue40-readiness-audit`, commit, push, mở PR vào `main`, chờ CI, merge khi CI đạt. Kết quả (SHA, PR URL, trạng thái CI) sẽ được điền sau khi thực hiện.

Lưu ý về CI: các workflow hiện chạy trên PR chỉ là workflow của AI Agency. Không có workflow nào chạy test của `packages/core` hay `live-bridge` trên PR. Việc "CI đạt" trong vòng này nghĩa là các workflow đã cấu hình chạy xanh, không có nghĩa là test của game đã được chạy.

## 7. Hệ thống đang chờ quyết định

Chi tiết trong `CODE_READINESS_AUDIT.md` mục 5.1 và `GDD_MASTER.md` phụ lục A. Gói cần PO trước tiên:
- **Gói A (cảnh giới):** OPEN-01, OPEN-02.
- **Gói B (Boss, Top 10):** OPEN-03, OPEN-05, OPEN-06.
- **Gói C (quà):** OPEN-10, OPEN-31. Đây là gói quan trọng nhất trước khi mở quà Chiến Lực.
- **Gói E (camera):** OPEN-37, OPEN-38.
- **Gói F (kinh tế):** OPEN-17, OPEN-18.
- **Gói K (kết nối thật):** phê duyệt connector TikTok (D-007).

## 8. Prompt giao task tiếp theo cho ChatGPT (điều phối và kiểm tra)

```
Bạn là người kiểm tra và điều phối cho dự án TuTienGioi (repo WilliamPham0702/TuTienGioi).

Nguồn sự thật, theo thứ tự ưu tiên:
1. 00_PROJECT/TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md
2. 00_PROJECT/DECISION_LOG.md (chỉ các dòng chưa bị đánh dấu SUPERSEDED)
3. 01_GAME_DESIGN/GDD_MASTER.md và GAME_FLOW_MASTER.md
4. 01_GAME_DESIGN/SYSTEM_SPEC/SS-01 đến SS-18
5. 00_PROJECT/CODE_READINESS_AUDIT.md

Nhiệm vụ: kiểm tra độc lập, không tin báo cáo trước.

A. Kiểm tra audit: với từng mục ở CODE_READINESS_AUDIT.md (P-01..T-01), mở file code được dẫn và xác nhận:
   - Nhãn READY/INCOMPLETE/BLOCKED có đúng không.
   - Bằng chứng có thật không (tên hàm, khóa cấu hình, dòng code).
   Trả về danh sách mục sai, kèm file:dòng và lý do.

B. Kiểm tra checkpoint: với từng mục CONFIRMED trong checkpoint, xác nhận có mặt trong GDD_MASTER và đúng số liệu. Đặc biệt: Linh Căn (35/25/18/12/6/3/1), ngưỡng 1.200 đến 7.200.000, thưởng Boss 10.000 × cấp, Top 10 25/18/14/11/9/7/6/4/3/3. Báo cáo mọi sai lệch.

C. Kiểm tra Phase 1 của roadmap: liệt kê chính xác các khóa trong packages/core/src/config.ts và các nhánh trong engine.ts cần sửa để khớp checkpoint, nhưng KHÔNG sửa file. Mỗi thay đổi ghi file:dòng, giá trị cũ, giá trị mới theo checkpoint.

D. Kiểm tra quyết định: xác nhận không có quyết định PO nào bị thay đổi mà không có dòng DECISION_LOG tương ứng. Không được tự đưa quyết định mới; mọi chỗ thiếu phải ghi OPEN.

Ràng buộc (không được vi phạm):
- Không phát triển Offline Simulator hay AI Agency.
- Không sửa code, engine, stack, connector ở vòng này.
- Không đưa đề xuất thành quyết định; đề xuất phải ghi TUNABLE hoặc OPEN.
- Không yêu cầu hay lưu mật khẩu, cookie, token TikTok.
- Không đổi trạng thái repo thành ARCHIVED.

Đầu ra:
1. Bảng sai lệch: ID, file:dòng, mô tả, mức (nghiêm trọng / nhỏ).
2. Kết luận: READY / NOT READY cho Phase 1, kèm lý do.
3. Danh sách việc PO cần quyết, gom theo gói A–K.
4. Đề xuất thứ tự tiếp theo và prompt giao task code Phase 1 (chỉ prompt, không tự thực hiện).
```

## 9. Các quyết định còn OPEN

Không có quyết định nào được chốt trong vòng này. OPEN-44 và OPEN-45 được thêm mới. Toàn bộ danh sách OPEN-01 đến OPEN-45 nằm ở `GDD_MASTER.md` phụ lục A.
