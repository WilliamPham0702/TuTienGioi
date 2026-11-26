# Combat & Boss System — Detailed Design Proposal
Status: proposed design, aligned to approved GDD constraints; formulas and values are tunable during testing.

## Design goals
- Auto-combat readable on TikTok LIVE; no constant manual commands.
- Player characters and offline-player BOTs use the same combat rules.
- Cultivation/root/realm progression matters without equipment or pháp bảo.
- Boss fights create shared spectacle; camera queue is presentation-only and never pauses combat simulation.
- Rewards are based on participation and contribution, not camera time.

## Character combat profile
Each character has derived combat attributes:
- HP (survivability)
- Attack (damage output)
- Defense (damage mitigation)
- Speed (attack cadence and movement responsiveness)
- Crit chance / crit multiplier
- Combat rating (summary, not used to determine rewards by itself)

Attributes are derived from realm tier, cultivation within the realm, root multiplier, and character growth. No equipment slots or artifact/weapon modifiers exist. All derived values should be normalized and capped/soft-capped where needed to prevent extreme outliers.

## Proposed damage resolution
1. Choose target using encounter rules (Boss priority for eligible active combatants; otherwise encounter target).
2. Resolve hit based on attack vs target evasion/defensive profile.
3. Compute raw damage from attacker attack and skill coefficient.
4. Apply target defense with diminishing returns; clamp damage to a minimum positive value on a successful hit.
5. Roll critical hit; apply crit multiplier.
6. Apply shields/status effects if the Boss or event skill has them.
7. Record actual damage dealt for reward contribution.
Avoid one-shot scaling except for clearly telegraphed Boss mechanics that are tuned and tested.

## Auto-combat loop
- Characters automatically enter combat when in range and eligible.
- AI selects a target and uses basic attacks; skills are selected by cooldown, conditions, and tactical utility.
- Players and player-owned BOTs share identical logic and data.
- Supplemental population BOTs have a distinct simulated behavior profile but obey the same combat/reward fairness rules.
- Combat decisions should be deterministic from state plus seeded random rolls for replay/debugging.

## Boss encounter behavior
Each Boss level has a distinct profile:
- L1–L2: straightforward attack patterns, few mechanics.
- L3–L4: telegraphed area attacks and one defensive mechanic.
- L5–L6: multiple phases, alternating pressure and recovery windows.
- L7: multi-phase signature encounter with clear telegraphs and spectacle; still readable on mobile LIVE.
Boss abilities must have visible warning/response windows; avoid unavoidable repeated wipes.

## Player defeat
- Defeat does not remove cultivation or realm.
- Character temporarily withdraws/recovers, then returns to combat automatically.
- No punitive loss of inventory or spirit stones in the default combat loop.

## Contribution and rewards
- Boss cultivation and item rewards use the already-approved contribution basis and Boss-level multipliers.
- Contribution should be based on actual valid damage and/or clearly defined support actions if support is later added; camera focus and time online alone do not count.
- Supplemental population BOTs should not siphon player reward pools unless an explicit future rule allows it.
- Prevent reward exploits: duplicate damage events, repeated reconnect claims, fake targets, and scripted farming.

## Camera separation
- Camera is a viewer presentation layer. It follows the approved event priority/queue but never pauses or alters combat outcomes.
- Boss camera dynamically follows battle, without fixed duration.
- When other camera events arrive, current focus completes; events remain queued and are prioritized afterward.

## Needs playtest tuning
- Exact HP/attack/defense/speed curves by realm.
- Hit/evasion/critical probability curves and caps.
- Skill coefficients, cooldowns, range, telegraphs, phases and recovery.
- BOT behavior profiles and supplemental BOT participation in Boss fights.
- Performance budgets and battle readability at high population.
