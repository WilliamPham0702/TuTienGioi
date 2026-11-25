# TuTienGioi — Concept Art Review Brief v0.1

**Mục đích:** chuẩn hóa bộ concept nhỏ để PO duyệt phong cách trước khi tạo asset P0. Đây là brief hình ảnh, không phải phê duyệt toàn bộ layout hay công nghệ.

## 1. Định hướng đã được PO xác nhận

- Thế giới thuộc một **tông môn chính đạo**: sáng, thanh nhã, cát tường, có khí chất tiên gia.
- Phong cách **premium chibi tiên hiệp**, biểu cảm tốt, tạo hình tinh xảo, không trẻ con.
- Bối cảnh fantasy giàu khí quyển; ưu tiên 2D/2.5D, có thể tạo chiều sâu bằng layer, parallax, particle và ánh sáng. Không bắt buộc full 3D.
- Khung hiển thị dọc 9:16, thiết kế để vẫn đọc được khi thu nhỏ trong TikTok LIVE.
- **Bảng màu đa sắc nhưng hài hòa, sáng nhưng sang trọng.** Không giới hạn ở xanh/trắng.

## 2. Bảng màu trang phục

Các màu dưới đây là nhóm gợi ý, không phải mã màu khóa cứng:

| Nhóm | Màu gợi ý | Cảm giác / cách dùng |
|---|---|---|
| Ngọc | Xanh ngọc, lục bảo, thanh ngọc | Đệ tử, người tu hành, chi tiết thêu |
| Thiên thanh | Xanh da trời, lam nhạt, xanh khói | Trang phục thanh thoát, tay áo, lớp ngoài |
| Thanh khiết | Trắng ngà, ivory, bạc sáng | Pháp bào, lớp trong, nhân vật có khí chất cao |
| Hoa đào | Hồng phấn, hồng đào, hồng san hô nhạt | Nhân vật trẻ, nữ tu, phụ kiện hoặc lớp áo |
| Cát tường | Vàng nhạt, vàng mật ong, vàng kim | Huy hiệu, viền thêu, chức vị và điểm nhấn |
| Ánh dương | Cam đào, cam nắng, màu mơ | Nhân vật nổi bật, lớp áo ngoài hoặc dải lụa |
| Tiên mộng | Tím lavender, tử đinh hương | Pháp thuật, nhân vật có cá tính riêng, điểm nhấn |
| Trung tính | Kem, be sáng, nâu gỗ nhạt | Đai lưng, giày, phụ kiện để cân bằng |

**Quy tắc phối màu**
- Mỗi nhân vật dùng 1 màu chủ đạo + 1 màu phụ + 1 màu nhấn; tránh dùng tất cả màu mạnh cùng lúc.
- Không để toàn bộ đệ tử mặc một màu. Có thể dùng cùng ngôn ngữ hoa văn/huy hiệu để vẫn nhận ra cùng tông môn.
- Cấp bậc cao hơn tăng độ tinh xảo của chất liệu, lớp áo, thêu và phụ kiện; không chỉ đơn giản tăng độ sáng hoặc phủ vàng.
- Tông môn chính đạo không dùng đen, đỏ máu hoặc màu u ám làm bảng màu chủ đạo. Có thể dùng chúng cho Tâm Ma, phản diện, Thiên Kiếp hoặc cảnh tương phản.
- Màu không phải tín hiệu duy nhất cho chức vụ/cảnh giới; kết hợp silhouette, huy hiệu, hoa văn và phụ kiện.

## 3. Một bối cảnh duy nhất — quảng trường ngoài trời trước đại điện

Game chỉ sử dụng **một cảnh nền duy nhất**: quảng trường/sân đá ngoài trời trước đại điện chính của tông môn. Đây là sân khấu cố định xuyên suốt phiên TikTok LIVE. Không tạo cảnh đại điện trong nhà, bản đồ phụ, khu vực khám phá, màn chơi riêng hoặc nền võ đài thay thế.

Bố cục dọc 9:16, nhìn chính diện hơi từ trên cao, cân đối và có chiều sâu:
- **15% trên cùng:** bầu trời, mây sáng và núi tiên xa; ánh sáng ban ngày ấm.
- **15%–30%:** đại điện chính trên đài cao, ngai Tông chủ ở giữa, bảng hiệu trống không chữ và cầu thang rộng.
- **30%–40%:** sân/hiên cao với các ghế phụ hai bên dành cho trưởng lão; để trống khi chưa có nhân vật.
- **40%–55%:** vòng nghi lễ tròn khắc trên đá ở chính giữa, dùng làm điểm đặt đạo cụ hoặc hiệu ứng khi có sự kiện.
- **55%–85%:** quảng trường đá rộng, có phối cảnh và đủ không gian cho khoảng 60 nhân vật nhỏ đứng theo hàng.
- **15% dưới cùng:** nền đá và lan can thấp, ít chi tiết vì có thể bị lớp chat LIVE che.

Ánh sáng ban ngày ấm, bảng màu ngọc, xanh trời, trắng ngà và điểm vàng nhạt. Kiến trúc tiên gia phương Đông, mái cong, bậc đá lớn, lan can, đèn lồng và hoa. Không có nhân vật, chữ, logo, HUD hoặc nút giao diện trong bản nền.

### 3.1 Tách lớp kỹ thuật của cùng một cảnh
- **Layer A — hậu cảnh:** chỉ bầu trời, mây và núi xa, phủ toàn canvas.
- **Layer B — trung cảnh:** đại điện, đài cao, ngai, cầu thang và ghế phụ; nền trong suốt.
- **Layer C — tiền cảnh:** sân/quảng trường đá, vòng nghi lễ và lan can; nền trong suốt.

Ba layer phải cùng kích thước, cùng tọa độ và khớp tuyệt đối khi ghép lại. Đây là cách tạo parallax/chiều sâu cho **một cảnh duy nhất**, không phải ba background độc lập.

Đá Đo Linh Căn, vòng khiêu chiến và các dấu ấn nghi lễ là đạo cụ/overlay riêng có thể bật tắt trên mặt sân; không tạo background mới cho từng hoạt động.

### B. Dàn nhân vật đại diện — character lineup
Tạo một nhóm nhỏ để kiểm tra độ đa dạng và tính thống nhất:
1. Đệ tử mới nhập môn: trang phục đơn giản, màu xanh ngọc hoặc lam nhạt.
2. Đệ tử có thiên phú: trang phục hồng đào hoặc vàng nhạt, phụ kiện riêng.
3. Chấp sự: silhouette gọn gàng, đai/huy hiệu rõ, phối ivory + màu nhấn.
4. Trưởng lão: nhiều lớp áo, tay áo và hoa văn tinh tế, có thể dùng lavender hoặc xanh ngọc đậm hơn.
5. Tông chủ: dáng đứng quyền uy, pháp bào cao cấp, điểm nhấn vàng kim/cam nắng nhưng không quá phô trương.

Nhân vật cần có mặt và biểu cảm dễ đọc ở kích thước nhỏ; giữ được nhận diện khi đổi cảnh giới/trang phục.

### C. Hiệu ứng tu luyện — VFX language
- Tu luyện thường: linh khí mảnh, hạt sáng nhỏ, vòng khí chuyển động chậm.
- Đột phá: phù văn mở rộng, cột sáng và lớp áo/hào quang đổi cấp.
- Thiên Kiếp: mây tụ, sét có hướng, pháp trận bảo hộ; tránh flash trắng toàn màn hình.
- Linh Khí Triều: làn sóng ánh sáng chạy qua các hàng đệ tử.
- Tâm Ma: bóng hình/viền tối tím làm tương phản, nhưng không biến đại điện chính đạo thành bối cảnh u ám.

## 4. Nguyên tắc bố cục livestream

- Canvas thiết kế: 1080 × 1920, dọc 9:16.
- Khu trung tâm ưu tiên đại điện, ghế chức vụ, nghi lễ và nhân vật đang có sự kiện.
- Dành vùng trống cho lớp giao diện TikTok; không đặt tên, điểm hoặc thông tin thiết yếu sát mép phải/dưới trước khi test thực tế.
- Chỉ 8–12 nhân vật được spotlight thường trực có nameplate; đám đông phía sau ưu tiên silhouette và chuyển động nhẹ.
- Nhìn ở kích thước preview điện thoại vẫn phải phân biệt được mặt, màu áo, chức vụ và sự kiện chính.

## 5. Phạm vi review và điều kiện nghiệm thu

**Bộ review nhỏ chỉ gồm:** (1) một cảnh quảng trường ngoài trời trước đại điện, có bản ghép hoàn chỉnh và bản tách 3 layer; (2) một lineup 5 nhân vật; (3) một sheet thử màu trang phục; (4) một sheet hiệu ứng tu luyện. Chưa sản xuất 10 bộ trang phục hoàn chỉnh hoặc toàn bộ asset P0.

PO đánh giá theo 5 tiêu chí:
- Đúng chất tiên hiệp và tông môn chính đạo.
- Chibi cao cấp, đẹp, không trẻ con.
- Bảng màu đa dạng, sáng, phối hài hòa.
- Nhân vật phân biệt được cấp bậc và vẫn rõ khi thu nhỏ.
- Bối cảnh có chiều sâu, đủ không gian cho hoạt động LIVE.

Chỉ sau khi PO duyệt bộ review mới mở rộng thành asset P0.

## 6. Ràng buộc chi phí và nguồn tài nguyên

- Ngân sách bổ sung: **0 VND**.
- Không mua asset, font, plugin, phần mềm, API hoặc dịch vụ tạo hình.
- Chỉ sử dụng công cụ đã có trong gói hiện tại hoặc công cụ mã nguồn mở phù hợp.
- Ghi lại nguồn và điều khoản sử dụng của mọi tài nguyên bên ngoài trước khi đưa vào game.
- Không tạo bộ asset lớn trước khi concept review được duyệt.


## 7. Nguyên tắc gameplay trên sân khấu

Đo Linh Căn, tu luyện, đột phá, Thiên Kiếp, khiêu chiến, Trợ Chiến, Linh Khí Triều và Cơ duyên đều diễn ra trên cùng một sân khấu ngoài trời. Chỉ thay đổi vị trí nhân vật, đạo cụ, ánh sáng, thời tiết, overlay và VFX. Không chuyển cảnh hoặc tải một bản đồ khác. Mục tiêu là giữ sân khấu liên tục, dễ theo dõi và có sức hút trong livestream.
