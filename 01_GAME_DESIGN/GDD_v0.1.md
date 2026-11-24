# Game Design Document — TuTienGioi v0.1

> Status: concept baseline. Items marked “proposal” require Product Owner approval.

## 1. Game premise
A cultivation sect's grand hall is continuously shown on TikTok LIVE. The Sect Master and Elders preside over the hall. Each participating viewer is represented as a disciple cultivating within the sect.

## 2. Main LIVE scene
- Central focal area: Sect Master and ceremonial platform.
- Side areas: Elders and sect officials.
- Main floor: disciple characters arranged in readable groups.
- Character labels: TikTok display name, cultivation realm, and a compact progress indicator.
- Broadcast overlays: sect name, current event, top cultivators, breakthrough notices, and participation instructions.

The scene must remain readable on a vertical phone screen. Character count, nameplate density, and UI overlays need performance and legibility testing.

## 3. Player lifecycle
1. Viewer enters or is detected in the LIVE session.
2. System creates or restores the viewer's cultivator profile using a stable platform identifier where permitted.
3. A character appears in the sect hall.
4. While eligible and present, the character accumulates time-based cultivation.
5. Eligible interactions may add spiritual energy or grant an item.
6. At a threshold, the player can attempt a breakthrough.
7. Successful breakthrough updates realm, appearance, outfit tier, aura, and public milestone.
8. At selected high realms, the player may enter a tribulation sequence.

Persistence, identity rules, and re-entry grace periods are implementation decisions to be finalized.

## 4. Progression model

### 4.1 Cultivation resources
- Tu Vi (tu vi): primary progression value.
- Linh Khí (linh khí): optional resource used to represent cultivation energy.
- Đan Dược (đan dược): consumable items that may accelerate progression.
- Optional later resources: sect contribution, merit, spirit stones, technique fragments.

The MVP should start with as few resources as possible to avoid unnecessary complexity.

### 4.2 Realm ladder
The following is an initial genre-inspired proposal, not a final canon:
1. Luyện Khí
2. Trúc Cơ
3. Kim Đan
4. Nguyên Anh
5. Hóa Thần
6. Luyện Hư
7. Hợp Thể
8. Đại Thừa
9. Độ Kiếp
10. Chân Tiên

Each realm may contain stages such as Sơ kỳ, Trung kỳ, Hậu kỳ, and Đại viên mãn. Confirm exact realm taxonomy and whether Độ Kiếp is a realm or a breakthrough event before implementation.

## 5. Progression inputs

### 5.1 Watch time
- Accumulate progress only during an eligible LIVE presence/session.
- Define heartbeat, reconnect grace period, maximum offline credit, and duplicate-session handling.
- Do not award unlimited progress from a stale connection.

### 5.2 Likes
- Likes may contribute spiritual energy.
- Use per-user and global rate limits, batching, and diminishing returns to prevent spam or event floods.
- Avoid assuming every raw like event can be processed individually at scale.

### 5.3 Gifts and pills
- Gifts may map to named in-game pills or effects.
- The mapping must be configurable and reviewed against TikTok policies and supported integration terms.
- Provide clear feedback without making paid gifts mandatory for progression.
- No real-money gambling, randomized paid rewards, or misleading reward promises.

## 6. Breakthrough and tribulation
Suggested sequence:
1. Eligibility notification.
2. Character moves to a designated stage/arena.
3. Ambient lighting and spiritual energy build.
4. Breakthrough animation and outcome.
5. Realm, outfit, aura, and profile update.
6. Broadcast announcement and ranking refresh.

Failure rules, retry cost, cooldown, and whether tribulation is deterministic or skill-based remain open decisions. Do not implement punitive loss before approval.

## 7. Character visual progression
Visual progression should be modular:
- Base body/rig.
- Outfit set per realm tier.
- Realm-specific aura and particles.
- Optional weapon/accessory.
- Nameplate and rank emblem.
- Special breakthrough/tribulation VFX.

The same character identity should remain recognizable as it advances. Art direction and asset ownership/licensing must be documented.

## 8. Sect hierarchy
Initial scene roles:
- Tông chủ (Sect Master): central authority / host character.
- Trưởng lão (Elders): senior figures flanking the Sect Master.
- Chấp sự (Deacons/officials): operational roles.
- Đệ tử (Disciples): viewer-controlled cultivators.

Whether players can earn official sect positions is a later progression feature, not required for the first MVP.

## 9. Social and competitive systems
Potential later features:
- Top cultivators by realm, total cultivation, or weekly contribution.
- Sect contribution and disciple titles.
- Scheduled tribulation events.
- Multiple sects and sect-versus-sect events.

Do not build these before the single-sect MVP is stable.

## 10. Open design questions
- What happens when a viewer leaves and returns?
- Can one account have multiple characters?
- What is the maximum number of visible characters?
- Are names filtered/moderated before display?
- How are ties handled in rankings?
- How long should each realm take for a free player?
- What proportion of progression comes from watch time vs likes vs gifts?
- Is breakthrough automatic or player-triggered?
- Is tribulation a spectacle only or a gameplay challenge?

## 11. MVP acceptance criteria
- A viewer can be identified and represented as a character.
- Eligible watch time updates progression correctly.
- Likes are rate-limited and do not overload the event pipeline.
- A character can reach a breakthrough threshold.
- Breakthrough updates realm and visual tier consistently.
- Reconnects do not duplicate or erase progression.
- Operator can pause event intake and recover from errors.
- The vertical LIVE composition remains readable at the target player count.
