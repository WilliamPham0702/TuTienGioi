# SS-01 — Dân số, BOT offline và trả quyền

## 1. Mục tiêu
Thế giới luôn đông và sống động, người chơi offline vẫn giữ được nhân vật và tiến trình, và không bao giờ mất dữ liệu vì dân số.

## 2. Khái niệm
- **Nhân vật người chơi (player character):** nhân vật có hồ sơ người chơi. Gồm hai trạng thái: đang online (điều khiển bởi người chơi thật) và offline (đang do BOT sở hữu điều khiển).
- **BOT sở hữu (player-owned BOT):** nhân vật người chơi đang offline. Dùng cùng logic với người chơi (SS-13).
- **BOT lấp chỗ (filler BOT):** nhân vật không thuộc người chơi nào, tạo để bù chỗ trống dân số.
- **Số nhân vật người chơi (`player_char_count`):** số nhân vật có hồ sơ người chơi = online + BOT sở hữu. Đây là đại lượng dùng để so với 50 (CONFIRMED, checkpoint: "counting real players and player-owned BOTs").

## 3. Quy tắc (CONFIRMED)
1. Người chơi offline không bị xóa, reset hay mất tiến trình.
2. Nhân vật offline chuyển sang BOT sở hữu và tiếp tục hoạt động.
3. Khi người chơi quay lại trên đúng định danh, BOT dừng và quyền điều khiển trả về người chơi.
4. Dân số tối thiểu: 50 nhân vật (player_char_count + filler) phải đạt ít nhất 50.
5. Thiếu thì spawn BOT lấp chỗ đúng bằng phần thiếu.
6. Không có trần dân số. Không kick hay xóa nhân vật để giữ dân số ở 50.
7. Khi `player_char_count` ≥ 50 thì không spawn BOT lấp chỗ.
8. BOT lấp chỗ khác với BOT sở hữu (không tạo, không nhận, không chuyển tiến trình).

## 4. Công thức (TUNABLE, cần PO xác nhận cách đọc, OPEN-09)

Định nghĩa mục tiêu filler:
```
filler_target = max(0, 50 - player_char_count)
```
Quy tắc đồng bộ, chạy định kỳ (ví dụ mỗi 10 giây):
```
if filler_count < filler_target:
    spawn (filler_target - filler_count) filler BOT
# không bao giờ xóa filler
```

Lý do chọn công thức này:
- Chỉ spawn để bù phần thiếu, không cộng dồn qua các chu kỳ. Nếu viết kiểu "thiếu thì spawn" mà không so với số filler đã có, hệ thống sẽ sinh ra vô hạn filler.
- Khi người chơi thật tăng, `filler_target` giảm, nhưng filler đã có không bị xóa (theo quy tắc 6). Kết quả: tổng thế giới có thể vượt 50 bằng filler thừa, và không spawn thêm.
- Khi `player_char_count` ≥ 50, `filler_target = 0`, nên không spawn filler mới.

Ví dụ:
| Tình huống | player_char_count | filler_count | filler_target | Hành động |
|---|---:|---:|---:|---|
| Khởi động, không ai | 0 | 0 | 50 | Spawn 50 |
| 30 người chơi thật vào | 30 | 50 | 20 | Không spawn; 20 filler thừa được giữ |
| 60 người chơi thật, 0 offline | 60 | 20 | 0 | Không spawn; 20 filler thừa được giữ |
| 40 người chơi thật, 10 offline (BOT) | 50 | 0 | 0 | Không spawn |

## 5. Trả quyền điều khiển (CONFIRMED)
- Khi người chơi vào LIVE hợp lệ với cùng định danh, hệ thống:
  1. Dừng BOT của nhân vật đó.
  2. Khôi phục trạng thái đã lưu chính xác.
  3. Trả quyền điều khiển cho người chơi.
- Hành động dở dang của BOT (ví dụ đang đánh Boss) được hủy an toàn. Không cộng phần thưởng dở dang (TUNABLE).

## 6. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Người chơi offline tức thì vào lại | Trả quyền ngay, không đổi nhân vật |
| Hai phiên cùng định danh | Chỉ một phiên có quyền. Phiên thứ hai không được trả quyền lần hai |
| Filler bị hủy do lỗi | Spawn bù trong chu kỳ tiếp theo theo công thức mục 4 |
| Người chơi không bao giờ quay lại | Giữ BOT vô thời hạn (OPEN-08). Không xóa |
| Boss đang đánh khi người chơi quay lại | Trả quyền; hành động dở dang bị hủy an toàn theo mục 5 |
| Filler bị hạ trong Boss | Không phân phần thưởng cho filler (SS-03 mục 6) |
| Người chơi mới tạo nhân vật lần đầu | Tăng `player_char_count`, cập nhật `filler_target` ngay |

## 7. Không được xảy ra
- Xóa nhân vật để giảm dân số.
- Spawn filler khi `player_char_count` ≥ 50.
- Spawn filler theo kiểu cộng dồn không so với số filler đã có.
- Trả quyền hai lần cho cùng nhân vật.
- Mất Tu Vi, vật phẩm, chức vụ khi chuyển BOT.

## 8. Nghiệm thu
- Với 0 người thật: hệ thống tạo đủ 50 filler trong ≤ 1 chu kỳ, và số lượng không tăng thêm ở các chu kỳ sau.
- Với 60 người thật và 0 BOT: không có filler mới.
- Người chơi offline rồi quay lại: tiến trình, vật phẩm, chức vụ đúng từng số.
- Không có chu kỳ nào mà `player_char_count + filler_count` < 50 kéo dài quá một chu kỳ.

## 9. Nhãn
- CONFIRMED: mục 2 (định nghĩa), mục 3, mục 5.
- TUNABLE: mục 4 (công thức đồng bộ), mục 6, mục 8 (một phần).
- OPEN-08 (BOT người không quay lại), OPEN-09 (filler thừa có được rút không; mặc định không).
