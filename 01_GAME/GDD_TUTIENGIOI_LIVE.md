# GDD TuTienGioi — TikTok LIVE Interactive Game
**Checkpoint:** 2026-11-26  
**Status:** Design decisions captured; implementation not started.  
**Scope:** New standalone LIVE game concept. Keep separate from the archived legacy game plan and from AI Agency infrastructure.

## 1. Product vision
- A shared 2.5D anime-xianxia world streamed from a PC through TikTok LIVE Studio.
- Viewers join as persistent characters and participate through LIVE comments, likes/hearts, Gifts, Boss fights, quests and shared events.
- One shared world and one shared camera. Group instances are a possible future expansion only, not part of the current baseline.
- Gameplay should be simple, highly automated and easy to participate in through comments. Avoid traditional RPG management complexity.
- No offline cultivation accrual. Character identity, realm, root and history persist between LIVE sessions.

## 2. Player identity and joining
- One persistent character per stable TikTok User ID; do not key identity by mutable username.
- Comment `CHƠI` joins the world. Returning viewers resume their existing character.
- Understand Vietnamese commands with/without diacritics, case and spaces, and common typos; fuzzy matching must avoid accidental commands. Important actions require confirmation where appropriate.
- Character progress persists, but cultivation accrues only while the player is participating in an active LIVE.
- Spiritual root is checked once per TikTok User ID and saved permanently; no reroll.

## 3. Spiritual roots
| Root | Cultivation multiplier | Distribution |
|---|---:|---:|
| Tạp linh căn | ×1 (100%) | 35% |
| Song linh căn | ×2 (200%) | 25% |
| Tam linh căn | ×3 (300%) | 18% |
| Thiên linh căn | ×4 (400%) | 12% |
| Dị linh căn | ×5 (500%) | 6% |
| Tiên linh căn | ×6 (600%) | 3% |
| Thánh thể linh căn | ×10 (1000%) | 1% |
- Distribution totals 100%.
- Like/heart and other base cultivation rewards are multiplied by the player's root multiplier.

## 4. Cultivation and realms
- Base meditation: 1 cultivation per second, only while the player is participating in LIVE.
- Each valid heart grants 5 base cultivation, then root multiplier is applied.
- Formula: actual cultivation = base cultivation × root multiplier × applicable effect multiplier.
- Spirit stones are separate from cultivation.
- Realm order: Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Hợp Thể → Đại Thừa → Độ Kiếp → Tiên Cảnh.
- Each realm has Sơ kỳ / Trung kỳ / Hậu kỳ / Viên mãn.
- Confirmed cumulative cultivation thresholds:
  - Luyện Khí: 1,200
  - Trúc Cơ: 6,000
  - Kim Đan: 24,000
  - Nguyên Anh: 72,000
  - Hóa Thần: 180,000
  - Luyện Hư: 420,000
  - Hợp Thể: 900,000
  - Đại Thừa: 1,800,000
  - Độ Kiếp: 3,600,000
  - Tiên Cảnh: 7,200,000
- Exact allocation of each realm threshold across its four phases has not been confirmed.
- Breakthrough is automatic as soon as the required cultivation is reached; if a reward carries enough cultivation, the character may pass multiple thresholds automatically.
- Breakthrough failure does not remove cultivation or lower the character's realm. Record breakthrough history and announce successful breakthroughs on LIVE.
- Offline time does not generate cultivation.

## 5. Pills (đan dược)
- Pills grant direct cultivation immediately; they do not provide temporary cultivation-speed buffs or healing.
- Automatic consumption: every pill received is used immediately, with no inventory-management action or comment command.
- No realm restriction and no usage cap.
- Pill values are base cultivation, multiplied by root multiplier:
  | Pill | Base cultivation |
  |---|---:|
  | Tụ Khí Đan | +100 |
  | Ngưng Khí Đan | +500 |
  | Trúc Cơ Đan | +1,500 |
  | Kim Đan | +5,000 |
  | Nguyên Anh Đan | +15,000 |
  | Hóa Thần Đan | +40,000 |
- Prevent duplicate reward processing and keep transaction history.

## 6. Spirit stones
- Four separate grades: Hạ phẩm, Trung phẩm, Thượng phẩm, Cực phẩm.
- No conversion between grades.
- Exact drop rates, quantities and economy/pricing remain undecided.

## 7. TikTok LIVE Gifts
- Each Gift triggers its own mapped in-game reward.
- Gift reward design uses a combination of in-game items and cultivation; exact per-Gift mapping and quantities remain undecided.
- If the sender has not joined, their Gift reward goes to the shared world. Do not auto-create a character or hold a personal reward for them.
- Shared-world Gift rewards are distributed to all eligible online players equally; any indivisible remainder is assigned by random draw among eligible online players.
- “Online” means a valid character participating in the LIVE at the event time; offline players are excluded.
- Record sender, Gift, timestamp, recipients, rewards and transaction/idempotency identifiers to prevent duplicate grants.
- Real TikTok integration must use an approved integration method and comply with TikTok policies. Do not assume API access or guaranteed payout/conversion.

## 8. Monsters and Bosses
- Monster appearances combine scheduled regular monsters, random spawns and special events.
- Ordinary monsters are fought individually or in small groups; Bosses are shared LIVE-wide encounters.
- Boss reward eligibility: player must have at least one valid damage event and still be participating in LIVE when the Boss dies. Leaving before death forfeits the reward. A player defeated during the fight remains eligible if they dealt damage and stayed in LIVE until Boss death.
- Boss contribution is damage-based.
- Divisible rewards are distributed proportionally to damage contribution.
- An indivisible item goes to the highest damage contributor; if highest damage is tied, the finisher (last valid damage event reducing HP to zero) receives it.
- All LIVE participants may attack any Boss regardless of realm.
- Boss levels 1–7, with fixed spawn probabilities:
  | Boss level | Probability |
  |---|---:|
  | 1 | 40% |
  | 2 | 25% |
  | 3 | 15% |
  | 4 | 10% |
  | 5 | 6% |
  | 6 | 3% |
  | 7 | 1% |
- Only one active Boss at a time. On defeat, immediately spawn the next random Boss.
- Boss levels 1–3 remain until defeated. Boss levels 4–7 have a 5-minute maximum duration; if not defeated, despawn and reset to Boss level 1.
- Boss does not automatically scale stats based on participant count.
- Boss item-count ranges:
  | Level | Number of items |
  |---|---:|
  | 1 | 1–2 |
  | 2 | 2–3 |
  | 3 | 3–4 |
  | 4 | 4–5 |
  | 5 | 5–7 |
  | 6 | 6–8 |
  | 7 | 7–10 |
- Boss cultivation reward formula: damage contribution ratio × root multiplier × 10,000 × Boss level.
- Rare-item chance is a separate rare property: Boss level × 10% (10% through 70%).
- Seven item quality grades:
  Phàm phẩm, Linh phẩm, Huyền phẩm, Địa phẩm, Thiên phẩm, Tiên phẩm, Thần phẩm.
- Base quality distribution: Phàm 35%, Linh 25%, Huyền 18%, Địa 10%, Thiên 7%, Tiên 4%, Thần 1%.
- Boss quality multipliers: level 1 ×1.0; level 2 ×1.2; level 3 ×1.4; level 4 ×1.7; level 5 ×2.0; level 6 ×2.5; level 7 ×3.0. Apply the multiplier to weights from Huyền phẩm upward; keep Phàm and Linh weights unchanged, then normalize to exactly 100%.
- Rounded per-level distributions should be normalized in implementation to avoid rounding drift.
- Boss loot groups retained in this GDD: monster inner cores (tâm hạch yêu thú), pills, spirit stones and breakthrough materials. Equipment and pháp bảo are not part of this game.

## 9. Explicitly removed systems
- No equipment of any kind: no weapons, armor, accessories, equipment slots, auto-equip or equipment stats.
- No pháp bảo: no pháp bảo items, one-use pháp bảo, activation mechanics or pháp bảo effects.
- No upgrade system: no +1 to +10, upgrade success/failure rates, upgrade materials or upgrade costs.
- Keep the LIVE game simple; do not reintroduce these systems in future proposals.

## 10. Breakthrough presentation and LIVE camera
- Every one of the 10 realms has its own distinct breakthrough visual identity; the current concepts are:
  1. Luyện Khí — circulating qi and a soft green aura.
  2. Trúc Cơ — gathering spiritual energy and forming a light ring.
  3. Kim Đan — golden core appears and emits a golden burst.
  4. Nguyên Anh — Nascent Soul manifests.
  5. Hóa Thần — spirit/soul radiates and energy expands.
  6. Luyện Hư — spatial distortion and illusory image.
  7. Hợp Thể — body and soul merge, larger aura.
  8. Đại Thừa — celestial phenomenon and gathering energy.
  9. Độ Kiếp — heavenly lightning tribulation.
  10. Tiên Cảnh — immortal gate opens and immortal light fills the scene.
- These are approved visual directions, not final art assets or technical implementation.
- Camera automatically detects notable events, focuses on them, then returns to the world overview.
- Higher-importance events interrupt lower-priority events; interrupted events remain queued and are not discarded.
- When several players break through, show them sequentially. Higher breakthrough realm first; if same level, earlier breakthrough first.
- Camera time should be longer than the initial baseline (user selected “increase viewing time”), but exact durations have not been approved.
- Exact total event-priority ordering has not been finalized; only the principle that higher-importance events take priority is confirmed.
- The previously suggested specific durations and event ordering are proposals only, not approved values.

## 11. LIVE leaderboard and hourly rewards
- LIVE leaderboard displays Top 10.
- Ranking: higher realm first; if same realm, higher total cultivation first; if still tied, the player who reached that realm earlier ranks first.
- Update automatically when cultivation or realm changes.
- Hourly reward cycle: every 1 hour of LIVE, snapshot the leaderboard and distribute rewards to eligible players who are participating in LIVE at the snapshot time.
- Reward pool contains pills, spirit stones and Boss items. No equipment or pháp bảo.
- Top 10 pool split:
  | Rank | Share |
  |---|---:|
  | 1 | 25% |
  | 2 | 18% |
  | 3 | 14% |
  | 4 | 11% |
  | 5 | 9% |
  | 6 | 7% |
  | 7 | 6% |
  | 8 | 4% |
  | 9 | 3% |
  | 10 | 3% |
  | **Total** | **100%** |
- The pool is sourced by reserving 20% of the total value of Boss drops generated during that 1-hour cycle; the remaining 80% remains for ordinary Boss rewards. Do not mint extra items.
- Eligible Boss-drop categories for this pool: pills, spirit stones, monster inner cores and breakthrough materials. No direct cultivation is included.
- Use internal rarity valuation to calculate allocations; do not convert one item type into another.
- Confirmed internal rarity coefficients for Top 10 pool valuation only:
  | Quality | Coefficient |
  |---|---:|
  | Phàm phẩm | ×1 |
  | Linh phẩm | ×2 |
  | Huyền phẩm | ×4 |
  | Địa phẩm | ×8 |
  | Thiên phẩm | ×16 |
  | Tiên phẩm | ×32 |
  | Thần phẩm | ×64 |
- These coefficients are internal allocation weights only, not market prices, trading prices or upgrade values.
- Distribute available items to approximate each rank's share without converting item types. Any indivisible remainder is prioritized to higher-ranked players in order, starting at Top 1.
- Record each hourly cycle and each reward transaction to prevent duplicate grants.

## 12. Decisions still open (do not assume)
- The latest pending question: what to do when a rank's allocated value cannot be satisfied by available items:
  A. Give the nearest lower-value available item.
  B. Carry the shortfall into the next hourly cycle.
  C. Give a lower-value item and carry the remaining shortfall forward.
  This has not been answered yet.
- Exact camera focus durations.
- Exact camera event-priority list beyond the principle “higher importance first”.
- Exact pill/Gift mapping and Gift quantities.
- Spirit-stone drop rates and amounts.
- Exact value mapping for each item beyond the rarity coefficient.
- Exact per-phase thresholds within each realm.
- Final art assets, animation timing and camera implementation.
- TikTok integration availability and production connection.
- No game code, LIVE integration or production deployment has been implemented by this GDD checkpoint.

## 13. Change control
- This document records design decisions and clearly labels unresolved proposals.
- Do not overwrite or reactivate the archived legacy game plan.
- Do not modify AI Agency infrastructure as part of game design work.
- Do not introduce equipment, pháp bảo or upgrades again.
