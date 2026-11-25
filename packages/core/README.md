# @tutiengioi/core

Lõi luật game (TypeScript thuần, không I/O). Không phụ thuộc engine hiển thị (Phaser/Godot) hay nguồn sự kiện (mô phỏng/TikTok).

- Vào: sự kiện chuẩn hóa (`GameEvent`) + `tick(now)`. Ra: trạng thái (`Game.state`) + hàng đợi thông báo (`Game.announcer`).
- Giờ và số ngẫu nhiên truyền từ ngoài (`seededRng`) → test lặp lại được.
- Mọi con số ở `src/config.ts`, nhãn **TẠM** (D-017).
- Chưa có: lưu SQLite, Linh Khí Triều, Tâm Ma, Thiên Bảng, Đạo Hiệu, kiểm duyệt tên, TTS.

```
cd packages/core && npm install && npm test && npm run typecheck
```
