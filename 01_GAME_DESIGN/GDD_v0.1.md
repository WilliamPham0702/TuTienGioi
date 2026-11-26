# Game Design Document — TuTienGioi v0.2

> **Trạng thái (2026-11-27): LỊCH SỬ / ĐÃ THAY THẾ MỘT PHẦN.** Tài liệu này giữ để truy vết. Thẩm quyền hiện tại là `01_GAME_DESIGN/GDD_MASTER.md` và `01_GAME_DESIGN/GAME_FLOW_MASTER.md`, bám checkpoint `00_PROJECT/TUTIENGIOI_GDD_CHECKPOINT_2026-11-26.md`. Xung đột được ghi trong `00_PROJECT/GDD_CONFLICT_REPORT.md`. Không dùng các số liệu, thất bại đột phá, Tâm Ma, trang bị hay pháp bảo trong tài liệu này làm quyết định.

> Status: concept baseline updated to the Product Owner's approved art direction. Gameplay economy and technical implementation remain proposals until approved.

## 1. Game premise
A cultivation sect's grand hall is continuously shown on TikTok LIVE. The Tông chủ and Trưởng lão preside over the hall. Each participating viewer is represented as a chibi tiên hiệp đệ tử cultivating within the sect.

## 2. Visual and presentation direction
- Character style: chibi xianxia, expressive faces, attractive silhouettes, readable costumes and accessories.
- Environment: beautiful sect hall with layered architecture, lanterns, banners, clouds, spiritual formations, gardens or distant mountain scenery as appropriate.
- Effects: refined, high-contrast VFX for linh khí, realm-up, breakthrough, tribulation, pills, and special events.
- Presentation: vertical 9:16 LIVE composition, clear focal hierarchy, readable names and realm labels.
- Production priority: achieve a polished, visually coherent result quickly using reusable 2D assets, layered backgrounds, skeletal/sprite animation, particles, shaders, and selective parallax.
- 2D/2.5D is the preferred starting hypothesis. Full 3D is not required and must not be assumed.

## 3. Main LIVE scene
- Central focal area: Tông chủ and ceremonial platform.
- Side areas: Trưởng lão and sect officials.
- Main floor: disciple characters arranged in readable rows or zones.
- Character labels: TikTok display name, cultivation realm, compact progress indicator.
- Broadcast overlays: sect name, current event, top cultivators, breakthrough notices, participation instructions.
- Design for mobile readability and controlled crowd density. Store all eligible players even if only a subset can be rendered prominently.

## 4. Player lifecycle
1. Viewer enters or is detected in the LIVE session, if the event source supports it.
2. System creates or restores the viewer's cultivator profile using a permitted stable identifier.
3. A chibi character appears in the sect hall.
4. While eligible and present, the character accumulates time-based cultivation.
5. Eligible interactions may add linh khí or grant an item.
6. At a threshold, the player can attempt or automatically trigger a breakthrough, subject to final design.
7. Successful breakthrough updates realm, costume, aura, and public milestone.
8. At selected milestones, the player may enter a dramatic độ kiếp sequence.

## 5. Progression model

### 5.1 Initial resources
- Tu Vi: primary progression value.
- Linh Khí: optional secondary resource.
- Đan Dược: optional consumables.

Keep MVP economy small. Exact rates, costs, and gift mappings require Product Owner approval.

### 5.2 Realm ladder
Initial genre-inspired proposal, not final canon:
1. Luyện Khí
2. Trúc Cơ
3. Kim Đan
4. Nguyên Anh
5. Hóa Thần
6. Luyện Hư
7. Hợp Thể
8. Đại Thừa
9. Độ Kiếp (confirm whether realm or breakthrough event)
10. Chân Tiên

Potential sub-stages: Sơ kỳ, Trung kỳ, Hậu kỳ, Đại viên mãn.

## 6. Interaction inputs
### 6.1 Watch time
- Award progress only during eligible LIVE presence/session.
- Define heartbeat, reconnect grace period, maximum offline credit, and duplicate-session handling.
- No unlimited progress from stale connections.

### 6.2 Likes
- May add linh khí.
- Use per-user and global rate limits, batching, and diminishing returns.
- Do not assume every raw like can be processed individually.

### 6.3 Gifts
- Gifts are the primary revenue driver (D-018). Gifts map to Tu Vi, đan dược, Chiến Lực and visible status effects, subject to TikTok policies and supported event access (D-007).
- Gift contribution to Chiến Lực is uncapped (D-010).
- Every gift reward must be fixed and known in advance. No paid randomized rewards (spin, mystery box, lucky draw) and no misleading reward promises.
- Free viewers (watch time, likes) remain necessary for collective events and audience size, even though gifting players progress faster.

## 7. Breakthrough and tribulation
Suggested spectacle sequence:
1. Eligibility announcement.
2. Character moves or is highlighted in a dedicated ritual area.
3. Ambient light and spiritual energy build.
4. Breakthrough animation and outcome.
5. Realm, costume, aura, and profile update.
6. LIVE announcement and ranking refresh.

Failure penalties, retry costs, cooldowns, and skill challenges remain undecided. Do not implement punitive loss before approval.

## 8. Reusable character art system
- Base chibi body and a small number of body/face variants.
- Modular hair, headwear, robes, accessories, weapons, and realm badges.
- Reusable animation states: idle, cultivate, celebrate, breakthrough, tribulation, receive gift.
- Layered aura and VFX independent from costume.
- Preserve character identity while upgrading appearance.

## 9. Sect hierarchy
- Tông chủ: central authority / host character.
- Trưởng lão: senior figures flanking the Tông chủ.
- Chấp sự: operational roles.
- Đệ tử: viewer-controlled cultivators.

Player-earned official sect positions are later scope, not required for MVP.

## 10. MVP production strategy
- One hero background, one main hall composition.
- A limited chibi roster with modular cosmetic variations.
- A small set of reusable animation loops.
- A compact VFX library reused with color/intensity variations.
- Simulated LIVE events before real connector integration.
- One local save database and operator panel.
- No open world, complex combat, or large bespoke 3D pipeline in MVP.

## 11. Open design questions
- Exact 2D/2.5D technique and engine.
- Viewer leave/rejoin behavior and identity mapping.
- Maximum visible characters and crowd layout.
- Name moderation and ranking tie rules.
- Realm duration and progression rates.
- Watch-time versus likes versus gifts contribution.
- Automatic versus player-triggered breakthrough.
- Whether tribulation is spectacle-only or interactive.
- Which asset sources are allowed under the zero-additional-spend rule.

## 12. MVP acceptance criteria
- Viewer can be represented by a distinct chibi cultivator.
- Eligible watch time updates progress correctly.
- Likes are rate-limited and do not overload event processing.
- Character can reach and display a breakthrough.
- Breakthrough updates realm, costume, and VFX consistently.
- Reconnects do not duplicate or erase progression.
- Operator can pause event intake and recover from errors.
- Vertical LIVE composition remains attractive and readable at target player count.
- MVP can be built and operated without additional paid services or assets.
