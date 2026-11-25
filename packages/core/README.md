# @tutiengioi/core

Lõi luật game (TypeScript thuần, không I/O). Không phụ thuộc engine hiển thị (Phaser/Godot) hay nguồn sự kiện (mô phỏng/TikTok).

- Vào: sự kiện chuẩn hóa (`GameEvent`) + `tick(now)`. Ra: trạng thái (`Game.state`) + hàng đợi thông báo (`Game.announcer`).
- Giờ và số ngẫu nhiên truyền từ ngoài (`seededRng`) → test lặp lại được.
- Mọi con số ở `src/config.ts`, nhãn **TẠM** (D-017).
- `Store` (SQLite, `node:sqlite`, cần Node ≥ 22.5; Node 22 in cảnh báo "experimental"): commit một giao dịch, chỉ ghi người chơi thay đổi, sao lưu nóng `backup()`.
- `scenario()`/`burst()` = nguồn sự kiện MÔ PHỎNG; `run()` chạy nguồn qua `Game`, tick + commit định kỳ.
- Khôi phục sau tắt đột ngột cho kết quả y hệt chưa từng tắt (test 20 điểm tắt khác nhau).
- Có: Linh Khí Triều, Tâm Ma, Thiên Bảng (4 tab), Danh Hiệu tối thiểu, operator tạm dừng/tiếp tục.
- Kiểm duyệt tên (`moderation.ts`), nhật ký kiểm toán chuỗi băm (`audit.ts`), lệnh vận hành (`operator.ts`), bảng điều khiển web local (`dashboard.ts`, `npm run dashboard` để chạy thử), kiểm tra/áp số cho công cụ GM (`tuning.ts`). Xem `08_TECHNICAL/C-004_OPERATOR_TOOLS.md`. 131 test.
- Chưa có: nội dung Đạo Hiệu, TTS, giao diện công cụ GM.

```
cd packages/core && npm install && npm test && npm run typecheck
```
