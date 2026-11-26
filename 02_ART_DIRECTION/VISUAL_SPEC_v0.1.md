# TuTienGioi — Visual Specification v0.1 (G-005)

> Cơ sở: Art Direction Brief v0.1, GAME_FLOW v0.1, GDD v0.3.  
> Trạng thái: **đặc tả đề xuất để PO duyệt trước khi tạo bộ hình P0**.  
> Phong cách đã duyệt: premium chibi tiên hiệp, bối cảnh fantasy giàu khí quyển, 2D/2.5D, ưu tiên chất lượng và tốc độ ra LIVE. Không yêu cầu full 3D.

## 1. Mục tiêu hình ảnh

- Khi nhìn lướt trên điện thoại, người xem nhận ra ngay đây là đại điện của một tông môn tiên hiệp.
- Có điểm nhìn chính, thứ bậc rõ: Thái Thượng Tông Chủ → Tông Chủ → Trưởng Phái/Trưởng Lão → Đệ tử.
- Nhân vật chibi có thần thái trưởng thành, trang phục đẹp, không quá trẻ con.
- Cảnh giới càng cao thì silhouette, chất liệu, phụ kiện và hào quang càng khác biệt.
- Sự kiện đột phá/khiêu chiến có khoảnh khắc điện ảnh nhưng không che thông tin.
- Tối ưu cho livestream 9:16 ở kích thước hiển thị thực tế, không chỉ đẹp khi phóng to.

## 2. Khung và lưới 9:16

**Nguyên tắc bối cảnh:** chỉ một sân khấu ngoài trời trước đại điện tông môn. Ba lớp hình nền là ba lớp kỹ thuật của cùng một cảnh, không phải ba khu vực hoặc bản đồ.

**Canvas master:** 1080 × 1920 px, portrait 9:16.  
**Safe area đề xuất:** lề trái 48 px; chừa khoảng 140 px bên phải và 280–320 px phía dưới cho lớp giao diện LIVE của nền tảng; phần trên chừa tối thiểu 100 px. Đây là vùng an toàn tạm thời, phải xác minh bằng video test trên điện thoại/tài khoản thực tế trước khi khóa. Không đặt tên, chỉ số hoặc nút thông tin cốt lõi trong vùng có thể bị UI TikTok che.  
**Typography tối thiểu đề xuất:** 28–32 px cho thông tin chính; 22–24 px cho phụ đề; không dùng chữ nhỏ dưới 18 px ở overlay quan trọng.

### 2.1 Phân vùng dọc

| Vùng | Khoảng Y đề xuất | Nội dung |
|---|---:|---|
| Header | 100–230 | Tên tông môn, tên LIVE/event; chỉ đặt thông tin ít quan trọng ở sát mép |
| Tọa điện tối thượng | 230–520 | Thái Thượng Tông Chủ ở vị trí cao nhất; không gian kiến trúc và ánh sáng chính |
| Khu ghế chấp chưởng | 520–760 | Tông Chủ, Trưởng Phái, Trưởng Lão; ghế trống có dấu hiệu NPC/đang tranh |
| Khu nghi lễ | 760–1030 | Đá Đo Linh Căn hoặc sân khiêu chiến; hai trạng thái thay thế, không hiển thị đồng thời |
| Khu đệ tử | 1030–1600 | Tối đa khoảng 60 nhân vật theo lớp sâu; nhân vật trọng tâm có tên/realm |
| Safe area nền tảng | 1600–1920 và dải phải 940–1080 | Không đặt tên/điểm số cốt lõi; chỉ dùng nền/particle không quan trọng hoặc để trống |

Đây là lưới định hướng, không phải tọa độ cố định của engine. Vùng safe area cần kiểm tra trên TikTok LIVE thực tế vì lớp chat, quà và nút điều hướng có thể thay đổi theo thiết bị. Trong sự kiện lớn, khu nghi lễ có thể mở rộng và giảm mật độ đệ tử tạm thời.

### 2.2 Quy tắc phân cấp

- Thái Thượng Tông Chủ: cao nhất, trung tâm, có ngai riêng và hào quang ổn định; không có nút/thông tin khiêu chiến.
- Tông Chủ: trung tâm bậc dưới; có nameplate chức vụ và hiệu ứng quyền lực.
- Trưởng Phái: hai ghế phụ gần trung tâm, có thể dùng màu viền/ấn tín riêng.
- Trưởng Lão: ghế hai bên thấp hơn, tối đa số ghế cấu hình.
- Đệ tử: sắp hàng theo phối cảnh; người vừa vào/đo linh căn/đột phá được đưa vào vùng spotlight.

Không dùng màu sắc làm tín hiệu duy nhất; mỗi chức vụ cần thêm hình dạng huy hiệu và nhãn chữ.

## 3. Crowd layout và khả năng đọc

- Mục tiêu hiển thị tối đa khoảng 60 nhân vật là **mục tiêu thử nghiệm**, không phải cam kết hiệu năng.
- Chia 6–7 hàng theo chiều sâu; nhân vật hàng trước lớn hơn, hàng sau nhỏ hơn.
- Tên + cảnh giới chỉ hiển thị thường trực cho khoảng 8–12 nhân vật ở hàng trước hoặc nhân vật đang được spotlight. Các nhân vật phía sau dùng huy hiệu/màu realm và được mở tên khi focus, chọn từ Thiên Bảng hoặc có sự kiện.
- Không cố ép 60 nameplate cùng lúc: ở 1080 px chiều ngang, việc đó sẽ làm chữ không đọc được.
- Người chơi ngoài nhóm đang render vẫn phải tồn tại trong dữ liệu; có thể luân phiên vị trí hiển thị.
- Nhân vật spotlight được phóng lớn trong một cửa sổ 3–6 giây, sau đó trả về vị trí.

## 4. Một bối cảnh duy nhất — quảng trường ngoài trời trước đại điện

**Game chỉ có một cảnh nền duy nhất:** quảng trường/sân đá ngoài trời phía trước đại điện chính của tông môn, theo concept nền đã được PO chọn. Đây là sân khấu cố định của TikTok LIVE. Không thiết kế bản đồ phụ, cảnh trong nhà, khu vực khám phá, nền võ đài riêng hoặc chuyển cảnh sang địa điểm khác.

Bố cục nền gồm bầu trời và núi tiên ở xa, đại điện cùng đài cao/ngai Tông chủ ở trung cảnh, sân đá rộng và quảng trường ở tiền cảnh. Trên sân có khoảng trống để bố trí tối đa khoảng 60 nhân vật theo hàng; vùng nghi lễ trung tâm dùng cho các hoạt động đặc biệt.

Các hoạt động sau **không phải bối cảnh riêng**; chúng chỉ là trạng thái gameplay, đạo cụ, overlay hoặc VFX trên cùng một sân khấu:
1. **Trạng thái thường:** Tông Chủ/Thái Thượng, trưởng lão và đệ tử ở vị trí thường trực; hiệu ứng nền nhẹ.
2. **Đo Linh Căn:** đạo cụ Đá Đo Linh Căn và phù văn được bật tại vùng nghi lễ giữa sân.
3. **Đột phá:** nhân vật được spotlight ngay tại sân; ánh sáng và phù văn hội tụ quanh nhân vật.
4. **Thiên Kiếp:** mây/sét/VFX xuất hiện phía trên cùng bối cảnh; không thay nền sang bản đồ khác.
5. **Khiêu chiến/Trợ Chiến:** hai nhân vật được đưa vào vùng nghi lễ trung tâm; vòng đấu/hiệu ứng chiến đấu là overlay trên mặt sân hiện tại, không tạo arena scene riêng.
6. **Linh Khí Triều/Cơ duyên:** sóng sáng, particle, banner và thẻ thông báo chạy trên sân khấu hiện tại.

Chỉ có một hiệu ứng toàn màn hình ưu tiên cao tại một thời điểm. Sự kiện nhỏ chạy dưới dạng icon/particle ngắn. Có thể thay đổi ánh sáng, thời tiết và VFX theo sự kiện, nhưng camera và địa điểm vẫn giữ nguyên.

## 5.0 Mẫu tạo hình nhân vật chuẩn — PO chỉ định

**Tham chiếu bắt buộc:** nhóm **5 nhân vật đầu tiên** đã được ChatGPT thiết kế và PO lựa chọn trong phiên làm concept. Đây là chuẩn tạo hình cho **toàn bộ nhân vật trong game**.

- Mọi nhân vật mới phải bám sát ngôn ngữ tạo hình, chất lượng hoàn thiện, tỷ lệ chibi, gương mặt, đường nét, chất liệu trang phục và cảm giác thẩm mỹ của đúng nhóm 5 nhân vật đầu tiên.
- **Không dùng nhóm 5 nhân vật xuất hiện sau làm tham chiếu.** PO đã phản hồi rõ nhóm sau không đẹp và không phải phong cách mong muốn; loại nhóm này khỏi chuẩn art direction.
- Không tự ý thay bằng một biến thể chibi khác, phong cách đơn giản hơn, trẻ con hơn, hoặc tạo hình đại trà chỉ vì dễ sản xuất.
- Được phép thay đổi giới tính, gương mặt, kiểu tóc, màu sắc, trang phục, phụ kiện, vũ khí, cấp bậc và khí chất để tạo đa dạng nhân vật; nhưng chất lượng và ngôn ngữ tạo hình phải nhất quán với mẫu 5 nhân vật đầu tiên.
- Bảng màu trang phục đa sắc, sáng và hài hòa như mục 6.1; không ép toàn bộ nhân vật mặc cùng một tông.
- Trước khi sản xuất hàng loạt, concept mới phải được đặt cạnh nhóm 5 nhân vật chuẩn để PO đối chiếu. Nếu nhìn vào thấy khác phong cách hoặc kém chất lượng rõ rệt thì không đạt.

Lưu ý: các concept được tạo bằng AI hiện tại chỉ là hình tham chiếu định hướng; chưa mặc nhiên là sprite, rig hoặc asset production-ready.

## 5. Nhân vật chibi module

### 5.1 Tỷ lệ và silhouette

- Tỷ lệ khởi điểm: khoảng 2.5–3 đầu, thân gọn, tay chân rõ.
- Khuôn mặt biểu cảm, mắt có điểm sáng, đường nét sạch.
- Tránh quá nhiều chi tiết nhỏ trên áo; ưu tiên mảng lớn, viền thêu và phụ kiện dễ nhận biết.
- Giữ nhận diện mặt/tóc cơ bản xuyên suốt quá trình thăng cấp.

### 5.2 Layer stack đề xuất

1. Shadow/ground contact.
2. Aura nền phía sau.
3. Tóc sau.
4. Thân/áo chính.
5. Tay trái/phải và tay áo.
6. Vũ khí/pháp bảo phía sau (nếu có).
7. Cổ áo/giáp/đai lưng.
8. Đầu/mặt.
9. Tóc trước.
10. Mũ/trâm/miện.
11. Vũ khí/pháp bảo phía trước.
12. Realm badge/nameplate (UI, không bake vào ảnh).
13. Particles/aura foreground.

Các layer có anchor/pivot nhất quán để ghép rig. Không tạo 10 nhân vật hoàn toàn khác nhau nếu có thể tái sử dụng base rig và đổi trang phục.

### 5.3 Animation P0

- Idle: thở nhẹ, chớp mắt, tóc/ống tay chuyển động nhỏ.
- Cultivate: ngồi thiền hoặc đứng vận khí; vòng linh khí chậm.
- Walk/enter: bước vào từ cổng hoặc tiến đến Đá Đo Linh Căn.
- Measure: pose đặt tay lên đá, đá phát sáng.
- Celebrate: pose vui mừng ngắn.
- Breakthrough: pose vận công, aura bùng sáng.
- Tribulation: pose chịu kiếp, shield/formation.
- Challenge: stance đối đầu và 1–2 nhịp giao chiêu.
- Gift/assist: nhận luồng linh lực hoặc hiệu ứng phe được trợ giúp.

## 6. Mười bộ trang phục theo Đại Cảnh

Đây là định hướng tạo hình; màu hào quang chỉ là gợi ý, không khóa bảng màu cuối cùng.

| # | Đại Cảnh | Silhouette/trang phục | Chất liệu/chi tiết | Hào quang gợi ý |
|---|---|---|---|---|
| 1 | Luyện Khí | Đạo bào đơn giản, tay áo gọn | Vải thô tốt, dây lưng vải, ít trang sức | Trắng ngà/xanh nhạt |
| 2 | Trúc Cơ | Áo dài có viền thêu, lớp ngoài ngắn | Viền bạc, phù văn nhỏ | Lục ngọc |
| 3 | Kim Đan | Đạo bào nhiều lớp, vai/cổ áo rõ | Chỉ vàng, ngọc bội | Vàng kim |
| 4 | Nguyên Anh | Áo choàng nhẹ, đai ngọc, tay áo rộng | Lụa, hoa văn mây | Lam ngọc |
| 5 | Hóa Thần | Pháp bào có giáp vai mềm | Kim loại mảnh, phù văn phát sáng | Tím |
| 6 | Luyện Hư | Ngoại bào bay, dải lụa linh động | Họa tiết tinh tú, viền bạc | Bạc/trắng |
| 7 | Hợp Thể | Trang phục cân bằng hai lớp âm dương | Thái cực/đồ án song hành | Xanh lam + tím |
| 8 | Đại Thừa | Pháp y uy nghi, miện/quan nhỏ | Kim tuyến, ngọc và lớp giáp trang trí | Vàng trắng |
| 9 | Độ Kiếp | Pháp bào chống thiên kiếp, áo choàng có dấu sét | Phù văn hộ thể, chi tiết lôi văn | Tím sẫm/lam điện |
| 10 | Chân Tiên | Tiên y thanh thoát, silhouette cao quý | Lụa sáng, ngọc tinh xảo, vệt tiên quang | Trắng vàng/ánh ngọc |

Quy tắc: tăng cấp độ tinh xảo theo từng Đại Cảnh nhưng không biến nhân vật thành khối sáng. Hào quang phải tách khỏi layer trang phục để có thể bật/tắt và tái sử dụng.

### 6.1 Bảng màu trang phục tông môn chính đạo — PO đã xác nhận

Bảng màu trang phục **đa sắc nhưng hài hòa, sáng nhưng sang trọng**. Không giới hạn tông môn vào xanh, ngọc và trắng. Các nhóm màu được khuyến khích:

| Nhóm màu | Màu đề xuất | Cách sử dụng |
|---|---|---|
| Ngọc | Xanh ngọc, lục bảo, thanh ngọc | Áo chính, đai lưng, viền thêu |
| Thiên thanh | Xanh da trời, lam nhạt, xanh khói | Lớp áo ngoài, dải lụa, pháp bào |
| Thanh khiết | Trắng ngà, ivory, bạc sáng | Lớp áo trong, nhân vật khí chất thanh cao |
| Hoa đào | Hồng phấn, hồng đào, san hô nhạt | Trang phục và phụ kiện tạo nét mềm mại |
| Cát tường | Vàng nhạt, vàng mật ong, vàng kim | Viền thêu, huy hiệu, điểm nhấn quyền uy |
| Ánh dương | Cam đào, cam nắng, màu mơ | Nhân vật nổi bật, áo choàng hoặc dải lụa |
| Tiên mộng | Lavender, tử đinh hương, tím khói sáng | Nhân vật có cá tính riêng, pháp thuật |
| Trung tính | Kem, be sáng, nâu gỗ nhạt | Đai, giày, phụ kiện để cân bằng |

**Quy tắc phối màu**
- Mỗi nhân vật ưu tiên 1 màu chủ đạo, 1 màu phụ và 1 màu nhấn; không dồn quá nhiều màu bão hòa vào một bộ.
- Các nhân vật trong cùng tông môn có thể khác màu áo, nhưng thống nhất bằng huy hiệu, ngôn ngữ hoa văn, đường viền hoặc phụ kiện nhận diện.
- Cấp bậc được phân biệt chủ yếu bằng silhouette, chất liệu, số lớp áo, độ tinh xảo và phụ kiện; không chỉ bằng màu.
- Không dùng đen, đỏ máu hoặc màu u ám làm màu chủ đạo của tông môn chính đạo. Có thể dùng chúng cho Tâm Ma, phản diện, Thiên Kiếp hoặc cảnh tương phản.
- Màu sắc không phải tín hiệu duy nhất để nhận diện chức vụ/cảnh giới; luôn kết hợp hình dạng huy hiệu và nhãn chữ.

## 7. Hệ màu Linh Căn

| Linh Căn | Màu nhận diện đề xuất | Ngôn ngữ hiệu ứng |
|---|---|---|
| Tạp | Trắng ngà pha ngũ sắc rất nhẹ | Hạt sáng nhỏ, ổn định |
| Tứ | Xanh lục | Bốn vòng phù văn |
| Tam | Lam | Ba luồng khí xoắn |
| Song | Tím | Hai dải năng lượng song hành |
| Nhất Phẩm | Vàng kim | Một trụ sáng rõ |
| Thiên | Trắng bạc | Quang trụ và chuông ngân |
| Dị – Lôi | Lam điện | Tia điện phân nhánh |
| Dị – Băng | Băng lam | Tinh thể và sương lạnh |
| Dị – Phong | Thanh ngọc | Dải gió cong, lá/linh vũ |

Không dùng chỉ màu; mỗi loại có biểu tượng/hình dạng riêng để người xem phân biệt.

## 8. Ngôn ngữ VFX

- **Tầng 1 – Tiểu Cảnh:** vòng sáng/particle nhỏ, 0.5–1.5 giây.
- **Tầng 2 – Đại Cảnh:** cột sáng, phù văn, đổi costume, 3–5 giây.
- **Tầng 3 – Thiên Kiếp:** mây, sét, pháp trận, 5–8 giây; tránh flash toàn màn hình liên tục.
- **Tầng 4 – Thiên Phạt/Chân Tiên:** cinematic đặc biệt, chỉ chạy khi không có sự kiện ưu tiên cao khác.

Hiệu ứng hỗ trợ:
- Tâm Ma: bóng ma sau nhân vật, viền tím/đen; không che mặt.
- Trợ Chiến: linh quang/ấn ký bay vào phe đã chọn; màu phe phân biệt bằng màu + biểu tượng.
- Linh Khí Triều: sóng sáng lan qua hàng đệ tử, hạt linh khí tăng mật độ.
- Cơ duyên: thẻ hệ thống, tia sáng từ trên xuống, icon vật phẩm.

## 9. UI overlay

- Header: tên tông môn, tên sự kiện, trạng thái LIVE/Simulation (chỉ operator thấy chi tiết kết nối).
- Nameplate: tên, realm, icon chức vụ; giới hạn độ dài và lọc từ.
- Thiên Bảng: top 3–5 trong một panel gọn, có nhãn tab rõ.
- Thông báo: khung tự vẽ của game, màu đỏ cho lời triệu tập đo Linh Căn; không giả lập rằng game có thể ghi vào comment gốc TikTok.
- Challenge HUD: hai bên, thanh Chiến Lực, đồng hồ, phe đang được hỗ trợ.
- Không hiển thị dashboard kỹ thuật, API key, ID nội bộ hoặc lỗi connector trên broadcast.

## 10. Danh sách asset P0

| Asset ID | Tên file đề xuất | Kích thước/định dạng | Ghi chú |
|---|---|---|---|
| BG-01 | `bg_sect_plaza_back.png` | 1080×1920 PNG | Layer A: bầu trời, mây và núi xa |
| BG-02 | `bg_sect_plaza_mid.png` | 1080×1920 PNG transparent | Layer B: đại điện ngoài trời, đài cao, ngai và ghế hai bên |
| BG-03 | `bg_sect_plaza_front.png` | 1080×1920 PNG transparent | Layer C: sân/quảng trường đá, vòng nghi lễ và lan can tiền cảnh |
| PR-01 | `prop_spirit_measure_stone.png` | 1024×1024 PNG transparent | Đạo cụ Đá Đo Linh Căn đặt trên sân khấu duy nhất |
| FX-07 | `fx_challenge_circle.png` | 1024×1024 PNG transparent | Vòng/ấn ký khiêu chiến phủ trên mặt sân; không phải nền võ đài riêng |
| CH-01 | `chibi_base_body.png` | 1024×1024 transparent | Base rig, neutral pose |
| CH-02 | `chibi_face_variants.png` | 1024×1024 transparent hoặc atlas | Bộ mặt/biểu cảm |
| CH-03 | `chibi_hair_set.png` | 2048×2048 transparent atlas | Tóc trước/sau tách layer |
| CH-04 | `chibi_robe_tiers_01_03.png` | 2048×2048 transparent atlas | Luyện Khí, Trúc Cơ, Kim Đan |
| CH-05 | `chibi_robe_tiers_04_06.png` | 2048×2048 transparent atlas | Nguyên Anh, Hóa Thần, Luyện Hư |
| CH-06 | `chibi_robe_tiers_07_10.png` | 2048×2048 transparent atlas | Hợp Thể đến Chân Tiên |
| CH-07 | `chibi_accessories_weapons.png` | 2048×2048 transparent atlas | Trâm, miện, kiếm, pháp bảo |
| FX-01 | `fx_aura_tiers.png` | 1024×1024 transparent atlas | Hào quang tách khỏi nhân vật |
| FX-02 | `fx_breakthrough.png` | 2048×2048 transparent atlas | Vòng sáng/cột sáng/phù văn |
| FX-03 | `fx_tribulation.png` | 2048×2048 transparent atlas | Mây, sét, pháp trận |
| FX-04 | `fx_spirit_tide.png` | 1024×1024 transparent atlas | Sóng linh khí |
| FX-05 | `fx_heart_demon.png` | 1024×1024 transparent atlas | Tâm Ma |
| FX-06 | `fx_assist.png` | 1024×1024 transparent atlas | Trợ Chiến |
| UI-01 | `ui_notification_frame.png` | 1080×240 transparent | Khung thông báo |
| UI-02 | `ui_realm_badges.png` | 1024×1024 transparent atlas | 10 huy hiệu Đại Cảnh |
| UI-03 | `ui_sect_seals.png` | 1024×1024 transparent atlas | Huy hiệu chức vụ |
| UI-04 | `ui_leaderboard_panel.png` | 600×900 transparent | Panel Thiên Bảng |

Các kích thước trên là kích thước master đề xuất; có thể xuất WebP/PNG tối ưu khi tích hợp. PNG trong suốt dùng cho asset nhân vật/VFX/UI. Không bake chữ động, tên người chơi hoặc chỉ số vào ảnh.

## 11. Pipeline art 0 VND

1. Tạo concept gốc bằng công cụ đã có trong gói hiện tại hoặc công cụ mã nguồn mở; không mua asset.
2. Kiểm tra điều khoản sử dụng của công cụ và nguồn asset trước khi đưa vào bản phân phối.
3. Lưu source gốc và file license/attribution.
4. Cắt lớp, chuẩn hóa pivot/anchor, tạo atlas/spritesheet.
5. Dùng một base rig và kiểm tra ít nhất ba bộ trang phục đầu.
6. Kiểm tra ở 1080×1920 và preview thu nhỏ tương đương màn hình điện thoại.
7. Tối ưu texture/atlas và xác nhận không che UI khi chạy nhiều nhân vật.

## 12. Checklist nghiệm thu G-005

- [ ] Bố cục dọc đọc được trên màn hình điện thoại.
- [ ] Thứ bậc chức vụ nhận ra trong 2–3 giây.
- [ ] 8–12 nhân vật spotlight có tên/realm rõ; crowd phía sau không tạo nhiễu chữ.
- [ ] Nhân vật giữ nhận diện qua 10 bộ trang phục.
- [ ] Bảy bậc Linh Căn phân biệt được bằng màu và biểu tượng.
- [ ] Bốn tầng VFX có độ dài/độ mạnh phù hợp và không che mặt.
- [ ] Chỉ có một bối cảnh ngoài trời trước đại điện tông môn; đo Linh Căn, đột phá, Thiên Kiếp, khiêu chiến và Linh Khí Triều đều diễn ra trên cùng sân khấu bằng đạo cụ/overlay/VFX.
- [ ] Tất cả asset có nguồn/license rõ ràng và không phát sinh chi phí.
- [ ] Bộ P0 có thể tích hợp thành cảnh chạy thử trước khi mở rộng asset.
