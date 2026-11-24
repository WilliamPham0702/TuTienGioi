# Thành phần bên thứ ba dùng trong PoC (C-002), kiểm tra 25/11/2026

| Thành phần | Phiên bản | Giấy phép | Dùng ở đâu |
|---|---|---|---|
| Phaser | 4.2.1 | MIT | `phaser/` |
| Vite | 7.x | MIT | build `phaser/` |
| TypeScript | 5.x | Apache-2.0 | `phaser/` |
| Godot Engine + export templates chính thức | 4.7.2-stable | MIT | `godot/` |
| Node.js (`node:sqlite`, WebSocket có sẵn) | ≥ 22.18 | MIT | `core/`, `measure/` |
| Vitest | 3.x | MIT | test `core/` (chỉ máy phát triển) |
| Noto Sans | — | SIL OFL 1.1 | font tên người chơi |
| OBS Studio (PO tự cài) | ≥ 28 | GPL-2.0 | `measure/` điều khiển qua WebSocket |

Không có dịch vụ trả phí, API key hay kết nối TikTok nào trong PoC.
