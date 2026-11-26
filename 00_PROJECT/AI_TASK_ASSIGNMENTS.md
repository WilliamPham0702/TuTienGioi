# AI Task Assignments — TuTienGioi

## Governance
- Product Owner: WilliamPham0702. Final authority on scope, priorities, visual direction, budget, acceptance, and production release.
- ChatGPT: Product Design & Creative Direction.
- Claude: Lead Developer & Technical Architect.

## Non-overlapping ownership

### ChatGPT — Product / Creative
Owns product vision, gameplay and UX specifications, art direction, visual references, scene composition, chibi character/costume design, VFX direction, UI layout, and product-side acceptance review.

### Claude — Engineering
Owns technical feasibility, architecture, engine/rendering evaluation, local data and event systems, implementation, automated tests, performance, bug fixing, and engineering documentation.

Neither AI may independently incur costs, change approved product decisions, merge to main, or deploy to production. Product Owner approval is required.

## Approved constraints and direction
- Visual direction: chibi tiên hiệp characters, beautiful atmospheric environments, polished and eye-catching effects.
- Prefer a 2D/2.5D production approach for the first release. Full 3D is not required.
- Optimize for attractive 9:16 LIVE presentation and fast time-to-live.
- Additional project spend must remain 0 VND: no paid APIs, cloud/VPS, subscriptions, paid assets, plugins, or services that may incur charges.
- Local simulation mode must be available while TikTok LIVE integration is unavailable.
- See `00_PROJECT/DECISION_LOG.md`, `00_PROJECT/PROJECT_BRIEF.md`, `01_GAME_DESIGN/GDD_v0.1.md`, and `02_ART_DIRECTION/ART_DIRECTION_BRIEF_v0.1.md`.

## Current phase: discovery and foundation; no production implementation yet

### Task C-001 — Claude: Free/local-first technical feasibility
Prepare `08_TECHNICAL/TECHNICAL_ARCHITECTURE_PROPOSAL.md` covering:
1. Compare 2D and 2.5D approaches and suitable free engines/frameworks for a vertical LIVE game. Do not assume a 3D game.
2. Recommend a stack that is maintainable by an AI-assisted, non-programmer Product Owner.
3. Evaluate local persistence, event processing, operator controls, OBS capture, and local simulation.
4. Investigate TikTok LIVE event access, account/region constraints, platform terms, reliability, and whether the candidate connector requires an external signing service or subscription.
5. Classify every component as free by license, free with limits, unverified, or paid/unacceptable.
6. Estimate MVP phases and performance risks; propose a small proof of concept and measurable acceptance criteria.
7. Explicitly identify anything that prevents a reliable 0 VND launch.

Constraints: no implementation code, no secrets, no paid service signup, no recurring costs, no changes to approved product documents, no merge/deploy. Use a feature branch and PR if supported; otherwise provide the report for review.

### Task G-001 — ChatGPT: Product and visual foundation
Deliver:
1. Refine the MVP experience and 9:16 LIVE screen zones.
2. Specify the sect hall composition, chibi character roster, roles, costume progression, and VFX language.
3. Define player lifecycle and feedback for watch time, likes, gifts/pills, breakthrough, and reconnects.
4. Prioritize a small reusable P0 asset set suitable for rapid production.
5. Ensure designs remain readable at actual livestream size and are feasible under the zero-additional-spend constraint.

Constraints: do not lock the technical stack; do not finalize unapproved economy values or gift mappings; do not claim assets are integrated until implemented.

## Kế hoạch v0.1 và giao việc (cập nhật 2026-11-25)

Nguồn: `01_GAME_DESIGN/GAME_FLOW_v0.1.md`, D-009..D-018. Thời gian là ước tính.

| Giai đoạn | Nội dung | Cổng qua |
|---|---|---|
| P0 – Chốt thiết kế (~1 tuần) | GDD v0.3, đặc tả tính năng mở rộng, lời thoại hệ thống, quy cách hình ảnh, duyệt số mô phỏng | PO duyệt |
| P1 – PoC kỹ thuật (~1–2 tuần) | PoC trong `08_TECHNICAL/POC_PLAN.md` và `08_TECHNICAL/TECHNICAL_ARCHITECTURE_LIVE_ADDENDUM.md`, chốt D-005, D-007 | Bằng chứng chạy thử |
| P2 – Vòng chơi cốt lõi, mô phỏng (~2–3 tuần) | Vào phòng → linh căn → tu luyện → cảnh giới → đột phá/Tâm Ma → thông báo | Chạy trơn, có test |
| P3 – Phần còn lại MVP (~2 tuần) | Khiêu chiến, Trợ Chiến, chức vụ, cơ duyên, Thiên Bảng, Linh Khí Triều | Mô phỏng 200 người không lag |
| P4 – LIVE thật (~1 tuần) | Nối TikTok + OBS, bảng điều khiển, LIVE thử riêng | 1 giờ không lỗi |
| P5 – Giai đoạn 2 | Yêu Thú Công Sơn, Bí Cảnh, Sư Đồ, Điểm Danh Bế Quan, Tông Môn Đại Bỉ, nội dung cuối game | Sau MVP ổn định |

### Claude
| ID | Việc | Trạng thái |
|---|---|---|
| C-001 | Đề xuất kiến trúc kỹ thuật | Xong → `08_TECHNICAL/TECHNICAL_ARCHITECTURE_PROPOSAL.md` (PR #2, đã merge) + phụ lục `TECHNICAL_ARCHITECTURE_LIVE_ADDENDUM.md` |
| C-002 | Mô phỏng kinh tế | Xong bản v0.1 → `09_SIMULATION/`, chờ PO |
| C-003 | PoC 1–5 | Chờ duyệt C-001 |
| C-004 | Lõi game + mô phỏng + SQLite (P2) | Chờ P1 |
| C-005 | Màn hình Phaser, hiệu ứng, thông báo + TTS (P2–P3) | Chờ P1 + G-005 |
| C-006 | Khiêu chiến, Trợ Chiến, chức vụ, cơ duyên, Thiên Bảng (P3) | Chờ P2 + G-003 |
| C-007 | Nối TikTok thật, bảng điều khiển, kiểm thử vận hành (P4) | Chờ P3 + D-007 |

### ChatGPT
| ID | Việc | Đầu vào |
|---|---|---|
| G-002 | Cập nhật GDD lên v0.3 theo GAME_FLOW và D-009..D-018 | GAME_FLOW, DECISION_LOG |
| G-003 | Đặc tả tính năng mở rộng (MVP + giai đoạn 2) | GAME_FLOW, SIM_REPORT |
| G-004 | Bộ lời thoại thông báo hệ thống | GAME_FLOW mục 12 |
| G-005 | Quy cách hình ảnh: bố cục 9:16, nhân vật module, 10 bộ trang phục, hiệu ứng, danh sách hình P0 | ART_DIRECTION_BRIEF, GAME_FLOW |
| G-006 | Tạo bộ hình P0 đầu tiên (gói đang dùng, 0 đồng) | G-005 đã duyệt |

Prompt giao việc cho ChatGPT: `00_PROJECT/CHATGPT_PROMPTS.md`.

## Handoff and release protocol
Every task handoff includes task ID, owner, source versions/commit, deliverables and changed paths, assumptions, decisions needed, test/review evidence, risks, and next action.

Claude submits technical proposals; ChatGPT reviews product implications; Product Owner approves. ChatGPT submits product/visual specifications; Claude reviews feasibility; Product Owner approves. Implementation starts only after these gates. Use feature branches and PRs. No merge, deployment, paid service, or external commitment without explicit approval. Never claim tests passed without recorded evidence.


## AI shared orchestration (added 2026-11-26)

ChatGPT is the preferred dispatcher for the Product Owner, but any AI may coordinate, claim, execute, review, and hand off tasks by following `00_PROJECT/AI_ORCHESTRATION.md`. GitHub is the source of truth; chat memory is not.

### Free-first task routing
- **Copilot — Agent Mode:** first choice for scoped repository edits and implementation tasks.
- **DeepSeek — Reasoning/DeepThink:** first choice for game logic, algorithms, debugging and code assistance.
- **Gemini — Thinking/Research mode (if available):** research, independent review, QA and documentation.
- **ChatGPT — Thinking:** dispatch, task breakdown, requirements, integration and review; use any available agent/work mode only if appropriate and available.
- **Claude — Code/Agent mode plus deep reasoning (if available):** reserve Pro quota for architecture, difficult cross-module work and complex debugging.
Mode names depend on current UI and account entitlements. Every assignment must name the exact selectable mode and fallback. Prefer free access and never incur new project costs without PO approval.

### Mandatory task assignment fields
Every task must state: Task ID/title; AI/account; mode and fallback; why selected; repository; branch and starting commit; module/files in scope; dependencies; goal; acceptance criteria; out-of-scope; tests/evidence; deliverables; handoff and next owner. Use `00_PROJECT/AI_TASK_TEMPLATE.md`.

### Shared task claiming and handoff
Use GitHub Issues as the shared task board when available, otherwise `00_PROJECT/TASK_BOARD.md`. One AI owns edits per task/files at a time. Other AIs may review or research in parallel only when not editing overlapping scope. Before takeover, read shared project docs and verify code/branch/commit/test evidence. Task statuses: OPEN, CLAIMED, IN_PROGRESS, BLOCKED, REVIEW, DONE, CANCELLED. A task is DONE only with test/verification evidence. Any AI may take over; Product Owner retains approvals for scope, design, paid services, secrets, merge/release and production deployment.
