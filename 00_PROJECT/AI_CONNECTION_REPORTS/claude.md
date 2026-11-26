# AI Connection Report — Claude

| Mục | Giá trị |
|---|---|
| AI Name | Claude (Anthropic) |
| AI Model | `claude-opus-5-5` (Claude Opus 5.5) — lấy từ thông tin phiên, không đoán |
| Mode đang sử dụng | Claude Code trên web (claude.ai, project thread), chế độ Agent, permission mode `auto` |
| Ngày kiểm tra | 2026-11-26 (UTC) |
| Commit gốc khi đọc | `e2121e3` trên `main` ("Prepare AI agency shared-artifact connection test") |
| **GitHub Read** | **PASS** |
| **GitHub Write** | **PASS** — báo cáo này được commit và push trực tiếp lên `main` bằng `git` |
| Trạng thái theo `AI_CONNECTION_REPORTS/README.md` | `CONNECTED` |

## Cách kết nối (đã kiểm tra thực tế)
- Repository được gắn vào phiên Claude Code qua GitHub App (quyền push), clone bằng `git clone --depth 1` qua git proxy của phiên.
- Đọc file trực tiếp từ bản clone; ghi bằng `git commit` + `git push origin main`.
- Không dùng web fetch, không cần người dùng tải/copy file. Không token hay secret nào được ghi vào repo.

## Các tài liệu đã đọc (đọc trực tiếp từ repo, commit `e2121e3`)
| File | Kết quả | SHA-256 (12 ký tự đầu) |
|---|---|---|
| `AI_HANDOFF.md` | ĐỌC ĐƯỢC | `cd77cc11dafa` |
| `00_PROJECT/AI_ORCHESTRATION.md` | ĐỌC ĐƯỢC | `94d75722d90d` |
| `00_PROJECT/PROJECT_BRIEF.md` | ĐỌC ĐƯỢC | `9ce7788f6c07` |
| `00_PROJECT/AI_TASK_ASSIGNMENTS.md` | ĐỌC ĐƯỢC | `bdc1faa35b9b` |
| `00_PROJECT/AI_AGENCY_ARCHITECTURE.md` | ĐỌC ĐƯỢC | `be1dbc282cbc` |
| `00_PROJECT/AI_SHARED_WORKSPACE.md` | ĐỌC ĐƯỢC | `9567387235e9` |
| `00_PROJECT/AGENCY/tasks/CONNECTION-001.md` | ĐỌC ĐƯỢC | `2b12428606e8` |

7/7 file đọc được. Không file nào thiếu.

## Hiểu kiến trúc AI Agency
- GitHub (file, issue, commit) là nguồn sự thật chung; bộ nhớ chat của từng AI không phải.
- Không có AI sở hữu cố định; ChatGPT là dispatcher ưu tiên nhưng AI nào cũng có thể nhận, làm, review và handoff.
- Vòng đời task: OPEN → CLAIMED → IN_PROGRESS → HANDOFF_READY → REVIEW → ACCEPTED; BLOCKED/FAILED kèm lý do và bằng chứng.
- Mỗi deliverable cần manifest (asset ID, task ID, AI/mode, thời gian UTC, đường dẫn, MIME, kích thước, SHA-256, bằng chứng kiểm tra, task tiếp theo, ghi chú handoff).
- Runner tự động (webhook/polling để đánh thức AI khác) **chưa được triển khai**; hiện tại điều phối vẫn bán thủ công.

## Khả năng
| Khả năng | Đánh giá | Ghi chú |
|---|---|---|
| Nhận Task | CÓ | Đọc được task record trong `00_PROJECT/AGENCY/tasks/`, tự xác định phạm vi, tiêu chí chấp nhận và bước handoff (ví dụ CONNECTION-001 gồm ASSET-TEST-001 → HANDOFF-TEST-002 → REVIEW-TEST-003). |
| Tạo file | CÓ (đã kiểm chứng) | File này được tạo mới trong lần kiểm tra. |
| Commit trực tiếp | CÓ (đã kiểm chứng) | Push thẳng lên `main` được. Theo quy tắc dự án, code/thay đổi lớn vẫn đi qua feature branch + PR và cần PO duyệt merge. |
| Đọc output từ AI khác | CÓ về kỹ thuật, CHƯA kiểm chứng bằng artifact thật | Đọc được mọi file trong repo; hiện chưa có artifact/manifest nào do AI khác publish cho CONNECTION-001 để đối chiếu. |
| Tiếp tục task từ AI khác | CÓ về kỹ thuật, CHƯA kiểm chứng | Chỉ chứng minh được khi có handoff thật từ AI khác (HANDOFF-TEST-002). |

## Shared Workspace / Task Handoff
- **SHARED WORKSPACE: NOT TESTED** — chưa có artifact của AI A để Claude (AI B) đọc. Theo `AI_AGENCY_ARCHITECTURE.md`, kiểm tra chỉ có quyền truy cập là chưa đủ để PASS.
- **TASK HANDOFF: NOT TESTED** — cần chạy CONNECTION-001 với hai AI khác nhau.
- Claude có thể đảm nhận vai PRODUCER (ASSET-TEST-001) hoặc CONSUMER (HANDOFF-TEST-002) khi được giao.

## Hạn chế và quyền còn thiếu
- Claude **không thể tự gọi hoặc đánh thức AI khác** (ChatGPT, Copilot, Gemini, DeepSeek). Chưa có runner/adapter nào được cấu hình.
- Claude chỉ làm việc khi Product Owner mở phiên/thread; không tự chạy theo sự kiện GitHub nếu chưa có trigger được thiết lập.
- Quyền GitHub phụ thuộc GitHub App được cài cho repo này; nếu PO gỡ quyền, việc ghi sẽ thất bại.
- Clone hiện tại là shallow (`--depth 1`); cần fetch thêm nếu muốn xem lịch sử dài.
- Chưa có object store (R2) cho file lớn; chỉ phù hợp file text/nhỏ trên GitHub.

## Kết quả
```
AI CONNECTION TEST
- READ: PASS
- WRITE: PASS
- COMMIT: PASS
- SHARED WORKSPACE: NOT TESTED
- TASK HANDOFF: NOT TESTED
```
