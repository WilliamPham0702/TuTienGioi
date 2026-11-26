# TuTienGioi — GDD Checkpoint (2026-11-26)

This checkpoint consolidates decisions already confirmed in project context. It does not replace earlier source decision files; it is an index/snapshot for continuing design.

## Project direction
- Custom TikTok LIVE interactive cultivation game; viewers join as persistent characters through comments and participate in a shared world.
- Visual target: 2.5D anime; readable and streamlined for LIVE viewing.
- AI team: ChatGPT + Claude only. Copilot removed from project workflow.
- AI Auto Agent exists; focus is idea/design decisions, then hand tasks to the Agent for implementation and testing. Real-world automation remains disabled until safety/integration checks pass.
- No equipment system. No pháp bảo.

## Cultivation and progression
- Root weights: Tạp 35% ×1; Song 25% ×2; Tam 18% ×3; Thiên 12% ×4; Dị 6% ×5; Tiên 3% ×6; Thánh thể 1% ×10.
- Base cultivation: 1/s while LIVE multiplied by root factor; valid heart/like: 5 base multiplied by root factor.
- Pills: Tụ Khí +100; Ngưng Khí +500; Trúc Cơ +1,500; Kim Đan +5,000; Nguyên Anh +15,000; Hóa Thần +40,000. Auto receive; no cooldown; unlimited.
- Realm cumulative thresholds: Luyện Khí 1,200; Trúc Cơ 6,000; Kim Đan 24,000; Nguyên Anh 72,000; Hóa Thần 180,000; Luyện Hư 420,000; Hợp Thể 900,000; Đại Thừa 1,800,000; Độ Kiếp 3,600,000; Tiên Cảnh 7,200,000.
- Automatic breakthrough; multiple realm breakthroughs can occur; no loss or failure.

## Boss and drops
- Boss level spawn weights L1–L7: 40%,25%,15%,10%,6%,3%,1%; only one active; killing spawns next random.
- L1–L3 remain until defeated; L4–L7 despawn/reset to L1 after 5 minutes.
- Reward cultivation: damage share × root factor × 10,000 × boss level.
- Item counts: L1 1–2; L2 2–3; L3 3–4; L4 4–5; L5 5–7; L6 6–8; L7 7–10.
- Quality tiers: Phàm, Linh, Huyền, Địa, Thiên, Tiên, Thần with weights 35%,25%,18%,10%,7%,4%,1%; Boss modifiers L1×1, L2×1.2, L3×1.4, L4×1.7, L5×2, L6×2.5, L7×3 for Huyền+ normalized. Rare chance boss level×10%.

## Top 10 hourly rewards
- Rank by realm, then total cultivation; ties favor earlier attainment; only LIVE players at cutoff qualify.
- Reward types: pills, spirit stones, monster inner cores, breakthrough materials, Boss items; shares 25,18,14,11,9,7,6,4,3,3.
- Fund: 20% actual Boss drops/cycle; remaining 80% ordinary Boss rewards. Item valuation by quality: Phàm×1, Linh×2, Huyền×4, Địa×8, Thiên×16, Tiên×32, Thần×64. Remainder distributed among eligible ranks; no debt/rollover.

## Gifts
- Gift reward mapping still TBD.
- If sender is not LIVE: gifts go to shared-world rewards, no auto character creation.
- Shared gift rewards distributed equally among online players; remainder assigned randomly.

## Camera system (confirmed)
- Event priority, highest first: Boss currently fighting > Độ Kiếp > Tiên Cảnh > breakthrough > item received > small event.
- Queue: retain all events; one focus at a time; sort by priority; FIFO within same priority.
- Interruption: complete current focus first, then process higher priority events. Do not interrupt current focus.
- Simultaneous/repeated same event: aggregate into one presentation with all relevant players.
- Queue overload: aggregate small events; do not drop events.
- Empty queue: return to overall gameplay camera.
- Focus durations: small 3s; medium 5s; large 8s; Độ Kiếp 12s; Tiên Cảnh 15s; Boss dynamic to battle, no fixed duration.

## Explicitly excluded
- Equipment system.
- Pháp bảo system, artifact types, activation, and related one-use items.

## Pending decisions
- Gift reward mapping, gift tiers and event triggers.
- Shared-world event types, pacing and player participation rules.
- Death/penalty/respawn or whether there is any failure-state system (not yet established in this checkpoint).
- LIVE session lifecycle, reconnect/AFK/eligibility details.
- Combat mechanics, damage formulas, boss combat AI and player interaction details beyond confirmed reward rules.
- Economy/spirit stone sources and sinks, inventory/capacity and item usage rules.
- UI information hierarchy and notification/chat behavior during LIVE.
- Anti-spam/fraud rules for likes/comments/gifts and moderation edge cases.
- Technical safety, test gates and automation permissions.

