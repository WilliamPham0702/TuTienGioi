# SS-11 — NPC, nhiệm vụ và chức vụ do NPC giữ

## 1. Mục tiêu
NPC giữ nhịp cho thế giới: nhận vai trò hệ thống, dẫn dắt nhiệm vụ, giữ chỗ cho chức vụ trống, và tham gia sự kiện mà không cạnh tranh công bằng với người chơi.

## 2. Nguyên tắc (CONFIRMED)
- NPC AI hỗ trợ chức năng hệ thống, nhiệm vụ, tường thuật và tương tác.
- NPC có thể xuất hiện trong sự kiện.
- Tường thuật của NPC bám sự kiện thật, không bịa, không spam (SS-17).

## 3. Danh sách NPC (TUNABLE, đề xuất)

| NPC | Vai trò | Ghi chú |
|---|---|---|
| Host (Tông Chủ hiện tại) | Điều phối đại điện và tường thuật | Trở thành Thái Thượng Tông Chủ khi người chơi lên Tông Chủ (D-015) |
| Trưởng Lão NPC | Giữ ghế Trưởng Lão khi trống | Thắng NPC thì người chơi lên thay |
| Trưởng Phái NPC | Giữ ghế Trưởng Phái khi trống | Như trên |
| Chấp Sự | Vai trò vận hành, thông báo | Không giữ chức vụ có khiêu chiến |

- NPC không nhận quà. Quà chỉ gửi cho người chơi (SS-05).
- NPC không nhận Tu Vi và không tham gia Top 10.
- NPC không nhận chức vụ khi người chơi đã giữ chức đó, trừ khi chức trống.

## 4. Nhiệm vụ (OPEN-20, khung TUNABLE)

### 4.1 Cấu trúc
```
Quest {
  id, tên, mô tả (tiếng Việt)
  trigger: điều kiện bắt đầu (cảnh giới, sự kiện)
  mục tiêu: danh sách sự kiện từ ledger (không từ client)
  thưởng: bảng cố định (SS-02, SS-09)
  cooldown: lặp lại hay không
  hết hạn: tùy chọn
}
```

### 4.2 Quy tắc
- Tiến độ chỉ tính từ **sự kiện ledger** đã xác thực. Không cho client báo cáo tiến độ.
- Thưởng là bảng cố định, ghi ledger, chống nhận trùng.
- Nhiệm vụ không được cho Tu Vi vượt bảng cố định đã công bố.
- Nhiệm vụ không được cho vật phẩm trang bị hoặc pháp bảo (checkpoint).
- Nhiệm vụ hoàn thành có thể đưa vào camera ở hạng sự kiện nhỏ hoặc vừa (SS-07).

### 4.3 Danh mục
Chưa có. Cần thiết kế ở vòng tiếp theo (OPEN-20). Không tự bịa nhiệm vụ trong tài liệu này.

## 5. Chức vụ trống (TUNABLE)
- Khi không có người giữ ghế, NPC giữ ghế.
- Người chơi thắng NPC trong khiêu chiến (SS-08) thì lên thay.
- Trận với NPC dùng cùng luật Chiến Lực với người chơi. NPC có Chiến Lực cố định theo cấp ghế (cần cân bằng).
- NPC không bị khiêu chiến trong Trợ Chiến nếu không có người chơi nào đứng đối diện (xác nhận, OPEN).

## 6. Trường hợp biên

| Tình huống | Xử lý |
|---|---|
| Quest hoàn thành hai lần do retry | Chống trùng theo ledger, chỉ thưởng một lần |
| NPC bị ảnh hưởng bởi sự kiện gây lỗi | NPC tiếp tục vai trò hệ thống; sự kiện bị bỏ qua và ghi log |
| Người chơi cố tương tác với NPC ngoài luật | Từ chối, không thay đổi trạng thái |
| Nhiều người cùng chiến thắng NPC trong một chu kỳ | Chỉ người đầu tiên được lên ghế |

## 7. Nghiệm thu
- Quest không hoàn thành được nếu sự kiện ledger chưa xác thực.
- NPC không nhận quà và không nhận Tu Vi.
- Người chơi thắng NPC giữ chức trống → chức thuộc người chơi, NPC không còn giữ.
- Không có nhiệm vụ phát thưởng trang bị.

## 8. Nhãn
- CONFIRMED: mục 2.
- TUNABLE: mục 3, 4.2, 5, 6, 7.
- OPEN: OPEN-20 (danh mục nhiệm vụ), NPC có được Trợ Chiến không.
