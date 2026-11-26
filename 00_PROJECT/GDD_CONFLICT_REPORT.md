# GDD Conflict Report — Đồng bộ checkpoint 2026-11-26

| Trường | Giá trị |
|---|---|
| Ngày | 2026-11-27 |
| Issue | WilliamPham0702/TuTienGioi#40 |
| Nhánh | `docs/gdd-sync-2026-11-27` |
| Thẩm quyền | `TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md` > quyết định PO trong `DECISION_LOG.md` (chưa bị thay thế) > `GDD_DECISION_*` đã xác nhận > tài liệu cũ |

## Phương pháp
1. Đọc checkpoint và từng dòng quyết định D-001 đến D-020.
2. Đọc các file quyết định camera và BOT.
3. Đọc GDD v0.1, GDD v0.3, GAME_FLOW v0.1, FEATURE_SPEC v0.1, các proposal boss và gift, PROJECT_BRIEF, README, AI_HANDOFF.
4. Grep toàn bộ `02_ART_DIRECTION`, `04_CONTENT`, `08_TECHNICAL`, `09_SIMULATION`, `packages/core/src/config.ts` tìm thuật ngữ đã bị loại hoặc thay thế (thất bại, Chân Tiên, pháp bảo, vũ khí, trang bị, linh thạch, Tâm Ma, PvP, trading, Copilot).
5. Đối chiếu từng số liệu checkpoint với GDD master và các spec.

## Quy tắc xử lý
- Mâu thuẫn với checkpoint: **áp checkpoint**, ghi conflict ở đây, không xóa lịch sử.
- Mâu thuẫn với quyết định PO không bị checkpoint thay thế: **giữ quyết định**, ghi rõ.
- Checkpoint mơ hồ: **không tự chọn một cách đọc là quyết định**. Ghi OPEN với phương án mặc định TUNABLE.
- Mâu thuẫn ở code, art, technical, simulation: **không sửa trong nhánh này** (issue yêu cầu docs-only). Ghi để xử lý sau.

Nhãn kết quả:
- **RESOLVED-CP:** đã áp checkpoint.
- **RESOLVED-DEC:** đã giữ quyết định PO.
- **OPEN:** cần PO quyết (mã OPEN-xx trong `GDD_MASTER.md` Phụ lục A).
- **FLAG:** nằm ngoài phạm vi, đã ghi nhưng không sửa.

---

## A. Mâu thuẫn trong GDD, GAME_FLOW và FEATURE_SPEC

| ID | Nguồn cũ | Nội dung cũ | Thẩm quyền | Nội dung đúng | Xử lý | Trạng thái |
|---|---|---|---|---|---|---|
| C-01 | GDD_v0.3 §5.1 | 7 bậc Linh Căn: Tạp 40%, Tứ 25%, Tam 18%, Song 10%, Nhất Phẩm 5%, Thiên 1,8%, Dị 0,2%; hệ số 1–3 | Checkpoint | Tạp 35% ×1, Song 25% ×2, Tam 18% ×3, Thiên 12% ×4, Dị 6% ×5, Tiên 3% ×6, Thánh thể 1% ×10 | Dùng checkpoint. Bảng cũ đánh dấu SUPERSEDED | RESOLVED-CP |
| C-02 | GAME_FLOW_v0.1 §4 | Bảng Linh Căn khởi điểm (tương tự C-01) | Checkpoint | Như C-01 | Như C-01 | RESOLVED-CP |
| C-03 | GDD_v0.1 §5.2, GDD_v0.3 §7.1, GAME_FLOW §7, FEATURE_SPEC §11 | Cảnh giới cuối gọi là "Chân Tiên" | Checkpoint | Cảnh giới cuối là "Tiên Cảnh" | Đổi tên trong GDD master và spec. Tên trong art và content: OPEN-29 | RESOLVED-CP / OPEN-29 |
| C-04 | GAME_FLOW §7 và DECISION_LOG D-020 | Ngưỡng theo tiểu cảnh: Luyện Khí 300 … Độ Kiếp 1.500.000, Chân Tiên cuối không ngưỡng | Checkpoint | Ngưỡng Tu Vi tích lũy: 1.200 / 6.000 / 24.000 / 72.000 / 180.000 / 420.000 / 900.000 / 1.800.000 / 3.600.000 / 7.200.000 (10 cảnh giới) | D-020 SUPERSEDED. Dùng ngưỡng checkpoint | RESOLVED-CP |
| C-05 | GDD_v0.3 §7.1; GAME_FLOW §7 | Mỗi Đại Cảnh có 4 tiểu cảnh (Sơ, Trung, Hậu, Đại Viên Mãn) | Checkpoint không nói gì | Không có quy định tiểu cảnh | Giữ tên tiểu cảnh là TUNABLE, chưa có ngưỡng | OPEN-02 |
| C-06 | GAME_FLOW §6; GDD_v0.3 §6.2 | Tim → 1 Hạ Phẩm Linh Thạch → Tu Vi khi luyện hóa | Checkpoint | Valid heart/like = 5 × hệ số Linh Căn Tu Vi trực tiếp | Chuỗi tim → linh thạch bị SUPERSEDED | RESOLVED-CP |
| C-07 | GAME_FLOW §6; GDD_v0.3 §6.1 | Chuỗi quy đổi linh thạch (10 Tu Vi/Hạ Phẩm; hoặc 3 Tu Vi theo mô phỏng) | Checkpoint + D-014 (sửa) | Linh thạch không tự động thành Tu Vi (D-028) | Giữ tỉ lệ chuỗi 100 làm TUNABLE trong kinh tế. Bỏ số Tu Vi trên mỗi Hạ Phẩm | RESOLVED-CP |
| C-08 | DECISION_LOG D-014 | Linh thạch tự động luyện hóa thành Tu Vi, không dùng mua đan | Checkpoint | Linh thạch hỗ trợ kinh tế, giao dịch, tính năng, nâng cấp | Phần tự luyện hóa SUPERSEDED. Phần không mua đan vẫn giữ, chờ PO | RESOLVED-CP / OPEN-17 |
| C-09 | GAME_FLOW §6, §8 | Tụ Khí Đan tăng tốc 20% trong 5 phút; Trúc Cơ Đan tăng tỉ lệ đột phá | Checkpoint | Đan dược cộng Tu Vi cố định (100 … 40.000), tự nhận | SUPERSEDED. Thay bằng bảng checkpoint | RESOLVED-CP |
| C-10 | DECISION_LOG D-011; GDD_v0.3 §7.2; GAME_FLOW §8 | Đột phá có thể thất bại, hồi chiêu 60 giây, không mất Tu Vi | Checkpoint | Đột phá tự động, không thất bại, không hồi chiêu | D-011 SUPERSEDED. Hồi chiêu và tỉ lệ đột phá bị loại | RESOLVED-CP |
| C-11 | GDD_v0.1 §7 | "Failure penalties, retry costs ... remain undecided" | Checkpoint | Không có thất bại | Không còn là câu hỏi mở | RESOLVED-CP |
| C-12 | FEATURE_SPEC §3; GDD_v0.3 §11, §13; GAME_FLOW §8 | Tâm Ma và Trợ Đạo (sau thất bại đột phá) là một tính năng MVP | Checkpoint | Không có thất bại, không có trigger | Tâm Ma SUPERSEDED. Có thể tái sử dụng nếu PO yêu cầu (OPEN-24) | RESOLVED-CP / OPEN-24 |
| C-13 | GAME_FLOW §10; GDD_v0.3 §8 | Cơ duyên tặng công pháp, pháp bảo, vũ khí, tu vi | Checkpoint | Không có pháp bảo, không có trang bị (vũ khí là trang bị) | Pháp bảo và vũ khí SUPERSEDED. Công pháp OPEN-13 | RESOLVED-CP / OPEN-13 |
| C-14 | GAME_FLOW §11; GDD_v0.3 §9.2 | Chiến Lực = Tu Vi × (1+%công pháp) × (1+%vũ khí) × (1+%pháp bảo) | Checkpoint | Không có vũ khí, pháp bảo | Bỏ hai thừa số. Công thức cơ sở là TUNABLE (SS-08) | RESOLVED-CP / OPEN-14 |
| C-15 | GDD_v0.3 §2 bước 8, §4 | Hồ sơ gồm vũ khí, pháp bảo, công pháp; ngoại hình thay bằng vũ khí | Checkpoint | Không trang bị, không pháp bảo | Bỏ vũ khí và pháp bảo. Công pháp OPEN-13 | RESOLVED-CP / OPEN-13 |
| C-16 | GDD_v0.3 §10 | Thiên Bảng 4 tab, chu kỳ reset chưa xác định | Checkpoint | Top 10 hàng giờ theo cảnh giới rồi Tu Vi | Top 10 là CONFIRMED. Bốn tab là TUNABLE | RESOLVED-CP / OPEN-28 |
| C-17 | PROJECT_BRIEF §5 | "Unbounded gift-to-power conversion" không thuộc MVP trừ khi được duyệt | D-010 (PO duyệt rõ) | Quà cộng Chiến Lực không giới hạn | D-010 là phê duyệt rõ ràng nên đưa vào MVP. Ghi rủi ro pay-to-win | RESOLVED-DEC |
| C-18 | GDD_GIFT_SYSTEM_PROPOSAL (Principles) | "Gift triggers must not create a permanent advantage that cannot be counterbalanced" | D-010 | D-010 cho phép quà tạo lợi thế lâu dài | Giữ D-010. Nguyên tắc proposal là câu hỏi mở | OPEN-31 |
| C-19 | GDD_v0.1 §9 | Chức vụ do người chơi giành là "later scope" | D-012 | Khiêu chiến và chức vụ thuộc MVP | Giữ D-012 | RESOLVED-DEC |
| C-20 | PROJECT_BRIEF §5 | "Full PvP combat" không thuộc MVP | D-012 | Khiêu chiến theo ghế thuộc MVP | Phân biệt: khiêu chiến theo ghế là MVP; PvP tự do vẫn ngoài MVP | OPEN-30 |
| C-21 | PROJECT_BRIEF §5 | "Player trading ... not in MVP unless approved" | Checkpoint | Giao dịch người chơi được bật trong ranh giới chống gian lận | Giao dịch là MVP (SS-10). Chợ phức tạp vẫn ngoài MVP | RESOLVED-CP / OPEN-18 |
| C-22 | PROJECT_BRIEF §2 | "Likes may contribute linh khí" (dùng "linh khí" cho tài nguyên) | Checkpoint | Tim/like cộng Tu Vi | Thuật ngữ: tài nguyên là Tu Vi. "Linh khí" chỉ còn trong tên sự kiện Linh Khí Triều | RESOLVED-CP |
| C-23 | PROJECT_BRIEF §7 | Mở: "Realm names, sub-stages, progression curve" | Checkpoint | Tên cảnh giới và ngưỡng đã có. Tiểu cảnh chưa có | Phần tên và ngưỡng đã đóng. Tiểu cảnh còn mở | RESOLVED-CP / OPEN-02 |
| C-24 | GDD_v0.1 §11 | Mở: "Automatic versus player-triggered breakthrough"; "Watch-time versus likes versus gifts contribution" | Checkpoint | Đột phá tự động; nguồn Tu Vi đã định nghĩa | Đóng câu hỏi đột phá. Câu hỏi nguồn Tu Vi đã có trả lời | RESOLVED-CP |
| C-25 | Checkpoint, mục Cultivation | "Cumulative realm thresholds" không nói rõ ngưỡng là mức đạt hay mức vượt | — | Chưa rõ | Giả định ngưỡng là mức để đạt. Trạng thái trước Luyện Khí chưa đặt tên | OPEN-01 |
| C-26 | Checkpoint, mục Top 10 | "Fund 20% actual Boss drops/cycle; 80% ordinary Boss rewards" | — | Chưa rõ nghĩa "quỹ" và cách tính | Đề xuất TUNABLE: 20% giá trị vật phẩm rơi thật, 80% thưởng thường, quy đổi bằng bảng giá trị | OPEN-05 |
| C-27 | README.md | "Current focus: AI Agency ... previous plan archived" | Issue #40 | Không đổi trạng thái game thành ARCHIVED | Thêm đường dẫn đến GDD master, giữ nguyên trạng thái, PO quyết cách ghi | OPEN-43 |
| C-28 | Checkpoint, mục Boss | "Rare chance: Boss level ×10%" không định nghĩa "hiếm" | — | Chưa rõ | Liệt kê ba cách đọc, đề xuất cách A (nâng bảng hiếm) | OPEN-03 |
| C-29 | Checkpoint, mục Boss | "L4–L7 despawn/reset to L1 after 5 minutes" | — | Chưa rõ Boss tiếp theo là L1 hay roll | Mặc định L1 | OPEN-06 |
| C-30 | Checkpoint, mục Boss | Vật phẩm rơi không nói chia cho ai | — | Chưa có | Đề xuất xổ số có trọng số theo đóng góp (SS-03 mục 6) | OPEN-05 |
| C-31 | Checkpoint, mục Camera | Boss focus ưu tiên cao nhất, không thời lượng cố định, không ngắt focus. Hai luật này cùng áp dụng khiến hàng đợi có thể bị chặn cả trận dài | — | Chưa có | Đề xuất chia đoạn, xen kẽ (SS-07 mục 6) | OPEN-37 |
| C-32 | Checkpoint, mục Camera | Khiêu chiến và đổi chức vụ không có trong bảng ưu tiên | — | Chưa có | Đề xuất hạng 6 và hạng 4 | OPEN-38 |
| C-33 | Checkpoint, mục LIVE | "Like/comment rewards" nhưng không có giá trị bình luận | — | Chưa có | Đề xuất 1 × hệ số Linh Căn, có trần | OPEN-39 |
| C-34 | Checkpoint, mục Population | Filler không bị xóa; dân số có thể vượt 50 khi người chơi thật tăng | — | Chưa rõ việc filler thừa có được rút không | Mặc định không rút; công thức không cộng dồn (SS-01 mục 4) | OPEN-09 |
| C-35 | Checkpoint, mục Population | Không nói BOT sở hữu có nhận thưởng Boss không | — | Chưa rõ | Mặc định có, không nhận Top 10 | OPEN-07 |
| C-36 | GDD_v0.1 §5.2; checkpoint Realm | "Độ Kiếp: confirm whether realm or breakthrough event" | Checkpoint có cả ngưỡng cảnh giới và ưu tiên camera | Độ Kiếp là cảnh giới (ngưỡng) và là sự kiện trình diễn | Cơ chế tương tác thiên kiếp chưa rõ | OPEN-25 |
| C-37 | Checkpoint, mục Camera vs Boss | Ngoài C-31, ưu tiên "Boss đang đánh" và "Độ Kiếp" có thể xảy ra song song | — | Theo luật ưu tiên | Đã xử lý trong SS-07 mục 8 | RESOLVED-CP |
| C-38 | Checkpoint, mục Gifts | "Gift reward mapping still requires detailed reward table" | Checkpoint | Chưa có bảng | Không bịa bảng. Ghi OPEN-10 | OPEN-10 |
| C-39 | Checkpoint, mục Economy | "Spirit stones ... to be specified" | Checkpoint | Chưa có sink | Đề xuất sink TUNABLE (SS-09 mục 5.2) | OPEN-17 |

---

## B. Mâu thuẫn trong proposal và tài liệu phụ

| ID | Nguồn | Nội dung | Thẩm quyền | Xử lý | Trạng thái |
|---|---|---|---|---|---|
| C-40 | GDD_v0.1 §8, §4 | "weapons" là thành phần cosmetic của nhân vật | Checkpoint | Cosmetic có thể giữ nếu PO xác nhận không chức năng | OPEN-26 |
| C-41 | GDD_COMBAT_BOSS_DESIGN_PROPOSAL | Không có trang bị, không có pháp bảo | Checkpoint | Phù hợp, không mâu thuẫn | Đã kiểm tra |
| C-42 | GDD_GIFT_SYSTEM_PROPOSAL | Quà không tạo trang bị hoặc pháp bảo; sender không LIVE vào kho chung | Checkpoint | Phù hợp | Đã kiểm tra |
| C-43 | DECISION_LOG, đoạn "Clarification" | "Technical stack and LIVE integration remain open" trong khi D-005 đã khóa stack | D-005 (locked 2026-11-25) | Đã ghi chú bổ sung ngay dưới đoạn gốc, không sửa đoạn gốc. Chỉ tích hợp LIVE còn mở | RESOLVED-DEC |
| C-44 | DECISION_LOG D-016 | "Bằng nhau thì bên bị khiêu chiến thắng" với Chiến Lực nhân ngẫu nhiên liên tục | D-016 | Đề xuất làm tròn số nguyên trước khi so sánh (SS-08 mục 3.3) | OPEN-14 |
| C-45 | Checkpoint và `GDD_DECISION_CAMERA_*` | Các file camera trùng lặp nội dung. `GDD_DECISION_CAMERA_EVENT_QUEUE.md` ghi "detailed tiers remain to be defined" | Checkpoint + `QUEUE_FINAL` | Không có mâu thuẫn số liệu. `QUEUE_FINAL` và checkpoint là chuẩn. Các file khác giữ làm lịch sử | RESOLVED-CP |
| C-46 | GDD_DECISION_CAMERA_PRIORITY_ORDER vs checkpoint | "Item acquisition" vs "Item received" | Checkpoint | Cùng nghĩa | RESOLVED-CP |
| C-47 | FEATURE_SPEC §1 (Linh Khí Triều) | ×2 Tu Vi trong 3 phút, bộ đếm tim, cooldown, trần | Không có trong checkpoint | Không mâu thuẫn với checkpoint. Là TUNABLE | Giữ TUNABLE (SS-06 mục 5) |
| C-48 | GDD_v0.3 §6.2 | Tim đóng góp cho sự kiện Tâm Ma | Checkpoint | Tâm Ma SUPERSEDED | RESOLVED-CP |
| C-49 | Checkpoint vs `packages/core/src/config.ts` | Heart/like: checkpoint nói "heart/like", code có `like`; thuật ngữ chưa thống nhất | — | Chưa có quyết định | OPEN-32 |

---

## C. Mâu thuẫn ở tài liệu ngoài GDD (không sửa trong nhánh này)

| ID | Tài liệu | Mâu thuẫn | Lý do không sửa | Đề xuất xử lý | Trạng thái |
|---|---|---|---|---|---|
| C-50 | `00_PROJECT/AI_HANDOFF.md` ("Read before work" mục 5) | Đọc `GDD_v0.1.md` (đã thay thế) | Nằm ngoài phạm vi GDD và thuộc workflow AI | Đổi sang `GDD_MASTER.md` trong PR riêng về workflow | FLAG |
| C-51 | `AI_ORCHESTRATION.md`, `AI_TASK_ASSIGNMENTS.md`, `AI_CONNECTION_CHECK_PROMPT.md`, `AI_AGENCY_AUTO_DISPATCH_V1.md`, `AI_TASK_TEMPLATE.md`, `.github/workflows/*` | Vẫn nhắc GitHub Copilot như thành viên đội AI | Checkpoint: Copilot removed from project workflow. Thuộc AI Agency, issue không cho mở rộng | Cập nhật trong PR riêng về AI workflow | OPEN-36 |
| C-52 | `02_ART_DIRECTION/VISUAL_SPEC_v0.1.md` (dòng về vũ khí, pháp bảo, "Chân Tiên", Tâm Ma, FX Tâm Ma), `CONCEPT_ART_REVIEW_BRIEF_v0.1.md` (Tâm Ma), `04_CONTENT/SYSTEM_VOICE_LINES_v0.1.md` (HEART_DEMON_*) | Có tài sản và mẫu câu cho vũ khí, pháp bảo, Chân Tiên, Tâm Ma | Art và content thuộc workstream riêng; cần PO quyết về cosmetic | Cập nhật art spec sau khi OPEN-26, OPEN-29 có quyết định | OPEN-26, OPEN-29 |
| C-53 | `08_TECHNICAL/CORE_AND_SPEC_REVIEW_v0.1.md`, `08_TECHNICAL/TECHNICAL_ARCHITECTURE_LIVE_ADDENDUM.md` (dòng 106), `08_TECHNICAL/C-004_OPERATOR_TOOLS.md` (dòng 75) | Dùng quy tắc đã thay thế: đột phá thất bại, Chiến Lực có vũ khí, linh thạch → Tu Vi, Tâm Ma | Technical review thuộc workstream riêng | Cập nhật khi chuẩn bị triển khai | FLAG |
| C-54 | `packages/core/src/config.ts` | Linh Căn cũ (40/25/18/10/5/1,8/0,2), `realms` theo perMinor 300…, `breakChance` (đột phá có thất bại), `tuViPerLowStone`, `fortune` có `weapon` và `treasure`, challenge thresholds cũ, tên Chân Tiên | Issue yêu cầu docs-only, không thay code | Mở task code riêng để đồng bộ `config.ts` với checkpoint | FLAG |
| C-55 | `09_SIMULATION/economy_sim.py`, `SIM_REPORT_v0.1.md` | Dựa trên số cũ (Tu Vi/giây, ngưỡng, quy đổi linh thạch) | Simulator thuộc phạm vi cấm trong issue | Chạy lại mô phỏng sau khi PO chốt OPEN-01, OPEN-05, OPEN-17 | FLAG |
| C-56 | `00_PROJECT/ARCHIVE/LEGACY_GAME_PLAN.md` | Lịch sử kế hoạch cũ | Lưu trữ, giữ nguyên | Không cần sửa | RESOLVED (giữ lịch sử) |

---

## D. Kiểm tra từng quyết định trong DECISION_LOG

| ID | Trạng thái sau đồng bộ | Ghi chú |
|---|---|---|
| D-001 | Còn hiệu lực | Repository |
| D-002 | Còn hiệu lực | Concept |
| D-003 | Còn hiệu lực | Like → Tu Vi (D-022) |
| D-004 | Còn hiệu lực | Visual progression |
| D-005 | Còn hiệu lực (đã khóa) | Stack; xem C-43 |
| D-006 | Còn hiệu lực | Art direction |
| D-007 | Còn hiệu lực | Connector chưa duyệt |
| D-008 | Còn hiệu lực | 0 VND |
| D-009 | Còn hiệu lực | Linh Căn mỗi phiên |
| D-010 | Còn hiệu lực | Quà vào Chiến Lực; OPEN-31 |
| D-011 | **SUPERSEDED** | Bởi D-023 (C-10) |
| D-012 | Còn hiệu lực | Khiêu chiến MVP; OPEN-30 |
| D-013 | Còn hiệu lực | Nhân vật cố định |
| D-014 | **Một phần SUPERSEDED** | Phần tự luyện hóa bị thay bằng D-028 (C-08); phần không mua đan còn giữ |
| D-015 | Còn hiệu lực | Thái Thượng Tông Chủ |
| D-016 | Còn hiệu lực | ±10%; OPEN-14 về làm tròn khi hòa (C-44) |
| D-017 | **Một phần SUPERSEDED** | Số liệu linh căn, thang cảnh giới, Tu Vi/giây bị thay bằng checkpoint; các số khác TUNABLE |
| D-018 | Còn hiệu lực | Quà là nguồn doanh thu chính |
| D-019 | Còn hiệu lực | PoC đã ủy quyền; không ảnh hưởng GDD |
| D-020 | **SUPERSEDED** | Bởi D-023 (C-04) |
| D-021 đến D-030 | Bổ sung từ checkpoint | Xem `DECISION_LOG.md` |

---

## E. Đã kiểm tra và không mâu thuẫn

- Tu Vi gốc 1 mỗi giây: GDD_v0.3 §5.2, GAME_FLOW §5 và checkpoint đều dùng 1.
- Linh Khí Triều: nằm ngoài checkpoint, không mâu thuẫn, giữ TUNABLE.
- Các file camera (`GDD_DECISION_CAMERA_*`): thứ tự ưu tiên, thời lượng và luật hàng đợi đều khớp checkpoint.
- Quy tắc BOT sở hữu và filler (`GDD_DECISION_OFFLINE_BOT_POPULATION`): khớp checkpoint.
- Boss proposal: không có trang bị, không có pháp bảo, camera không ảnh hưởng combat; khớp checkpoint.
- Gift proposal: quà không tạo trang bị, người gửi không LIVE vào kho chung; khớp checkpoint.
- Tâm Ma (chỉ là vấn đề thất bại, đã nêu ở C-12).
- Khiêu chiến, Trợ Chiến, ±10%, Thái Thượng Tông Chủ: khớp D-012, D-015, D-016, D-018.
- Chi phí 0 VND và không connector TikTok thật: khớp D-007, D-008.

---

## F. Tóm tắt

Tổng cộng 56 mục xung đột (C-01 đến C-56), trải trên các bảng A–D. Trạng thái từng mục nằm ở cột "Trạng thái" hoặc "Xử lý" của bảng tương ứng. Trong các bảng, có khoảng 25 mục ghi RESOLVED-CP, 5 mục RESOLVED-DEC, 4 mục FLAG (ngoài phạm vi, không sửa trong nhánh này), và các mục còn lại được chuyển sang OPEN với mã OPEN-xx tương ứng. Một số mục ghi nhiều mã OPEN hoặc trạng thái kép, nên số đếm chỉ mang tính tham khảo; nguồn chuẩn là từng dòng.
