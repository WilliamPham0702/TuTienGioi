# TuTienGioi — GDD Checkpoint (2026-11-26, Updated)

This checkpoint consolidates confirmed decisions from project context and the latest approval of the remaining default proposals. Separate decision files remain the detailed source for each decision.

## Project
- Custom TikTok LIVE interactive cultivation game; viewers join as characters through comments in a persistent shared world.
- Visual target: 2.5D anime; optimized for readability on LIVE.
- AI team: ChatGPT + Claude only; Copilot removed from project workflow.
- AI Auto Agent exists; focus is designing/confirming game ideas and passing tasks to it for implementation/testing. Real-world automation remains disabled until safety/integration checks complete.
- Explicitly excluded: equipment and pháp bảo systems.

## Population and offline characters
- Preserve player-owned character identity, progress, cultivation, inventory and other data when offline.
- Offline player characters transition to BOT control and continue activity in the world.
- Returning players regain direct control of their existing character; BOT control ends.
- Maintain at least 50 active characters in the world, counting real players and player-owned BOTs.
- If below 50, spawn filler BOT characters to cover the deficit. Population has no maximum cap; never kick/delete characters to enforce 50.
- Do not spawn filler BOTs if population is already at or above 50.

## Cultivation
- Root weights: Tạp 35% ×1; Song 25% ×2; Tam 18% ×3; Thiên 12% ×4; Dị 6% ×5; Tiên 3% ×6; Thánh thể 1% ×10.
- Base cultivation: 1/s while LIVE × root factor; valid heart/like: 5 base × root factor.
- Pills: Tụ Khí +100; Ngưng Khí +500; Trúc Cơ +1,500; Kim Đan +5,000; Nguyên Anh +15,000; Hóa Thần +40,000. Auto receive, unlimited, no cooldown.
- Cumulative realm thresholds: Luyện Khí 1,200; Trúc Cơ 6,000; Kim Đan 24,000; Nguyên Anh 72,000; Hóa Thần 180,000; Luyện Hư 420,000; Hợp Thể 900,000; Đại Thừa 1,800,000; Độ Kiếp 3,600,000; Tiên Cảnh 7,200,000.
- Automatic breakthrough; multiple breakthroughs can occur; no loss/failure. After reaching Tiên Cảnh, continue cultivation with a post-Tiên-Cảnh progression system (details to design).

## Boss
- Boss L1–L7 spawn weights: 40%,25%,15%,10%,6%,3%,1%; only one active; killing spawns the next random level.
- L1–L3 stay until defeated; L4–L7 despawn/reset to L1 after 5 minutes.
- Reward cultivation: damage share × root factor × 10,000 × Boss level.
- Item drops: L1 1–2; L2 2–3; L3 3–4; L4 4–5; L5 5–7; L6 6–8; L7 7–10.
- Item quality weights: Phàm 35%, Linh 25%, Huyền 18%, Địa 10%, Thiên 7%, Tiên 4%, Thần 1%; Boss modifiers L1×1, L2×1.2, L3×1.4, L4×1.7, L5×2, L6×2.5, L7×3 for Huyền+ normalized. Rare chance: Boss level ×10%.
- Player participation is automatic based on character stats/cultivation; Boss can attack players; defeated players recover and return without losing realm; Bosses have distinct skills by level.

## Top 10 hourly
- Rank by realm, then total cultivation; ties favor earlier attainment; only LIVE players at cutoff qualify.
- Rewards: pills, spirit stones, monster inner cores, breakthrough materials and Boss items. Distribution shares: 25,18,14,11,9,7,6,4,3,3.
- Fund 20% actual Boss drops/cycle; 80% ordinary Boss rewards. Item valuation: Phàm×1, Linh×2, Huyền×4, Địa×8, Thiên×16, Tiên×32, Thần×64. Remainder goes to eligible ranks; no debt or rollover.

## Gifts
- Gift reward mapping still requires its detailed reward table.
- If sender is not LIVE, rewards enter the shared-world pool; no auto character creation.
- Shared rewards are divided equally among online players; remainder randomly allocated.
- Gifts have tiers converted into rewards; gifts to an existing player enhance their existing character. Special gifts trigger world events. Gift specifics and balancing still require tables.

## World and social systems
- World events: random events plus events triggered by player actions.
- All eligible players can participate.
- Non-conflicting world events may run concurrently; camera handles presentation through its queue.
- Guilds/groups are supported for community play.
- Character name based on TikTok identity; profiles, titles, and achievement records supported.
- Fame/titles emerge from achievements and behavior beyond the Top 10.
- AI NPCs support system functions, quests, narration, and interactions; may also appear in events.

## Camera (confirmed)
- Priority: Boss currently fighting > Độ Kiếp > Tiên Cảnh > realm breakthrough > item received > small event.
- One focus at a time; keep all events until processed; sort by priority, FIFO within equal priority.
- Finish current focus before processing higher-priority events; do not interrupt.
- Aggregate simultaneous/repeated same-type events into one presentation with all relevant players.
- Queue overload: aggregate small events without dropping them.
- Empty queue returns to overall gameplay camera.
- Durations: small 3s; medium 5s; large 8s; Độ Kiếp 12s; Tiên Cảnh 15s; Boss dynamically follows battle.

## Items and economy
- Boss items auto-enter inventory.
- Items may be usable, but only consumables, materials, and items with defined functions; no equipment or pháp bảo.
- Spirit stones support economy, trading, features, activities, and upgrades to be specified.
- Player trading is enabled within anti-fraud boundaries; spirit-stone transfers are allowed.
- Inventory has no capacity limit and auto-categorizes items.

## LIVE interactions
- Like/comment rewards use a dedicated conversion system with anti-spam/farming and valid interaction rules.
- LIVE reconnect saves state immediately and restores exactly.
- Scale for surges; prioritize gameplay and aggregate small events/notifications.
- Display only noteworthy tiered events without covering gameplay.
- AI narration is event-grounded, non-fabricating, and non-spammy.
- Vietnamese default; content moderation/safety filters; multilingual can be added later.

## Still needs detailed design (not decisions to reopen)
- Exact gift mappings/tier values, event catalogue and triggers, post-Tiên-Cảnh progression, combat stat/damage formulas, economy sinks and item definitions, trading safeguards, guild structure, NPC/quest catalogue, LIVE eligibility/reconnect/AFK edge cases, anti-spam thresholds, UI details, and safe automation test gates.
