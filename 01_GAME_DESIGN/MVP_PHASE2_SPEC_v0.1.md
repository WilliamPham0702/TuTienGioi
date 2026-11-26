# TuTienGioi — MVP & Phase 2 Product Specification v0.1

- **Task:** G-003
- **Status:** Draft for Product Owner review
- **Source of truth:** PROJECT_BRIEF.md, GDD_v0.3.md, GAME_FLOW_v0.1.md, FEATURE_SPEC_v0.1.md and DECISION_LOG.md
- **Important:** This document organizes existing decisions and proposes implementation boundaries. It does not approve new mechanics, technical choices, economic values, or TikTok integration.

## 1. Product objective

Deliver the smallest attractive and reliable TikTok LIVE cultivation experience in which viewers become persistent cultivators in one sect grand hall. The MVP must be operable on a PC, readable in a vertical livestream layout, recoverable after interruptions, and testable without TikTok through Local Simulation.

**MVP success path:** a viewer joins → receives or resumes a cultivator profile → appears as a distinct chibi character → gains eligible cultivation progress → experiences a realm/breakthrough milestone → can participate in supported community or challenge interactions → progress is saved.

## 2. Scope labels

- **APPROVED:** explicitly recorded in the Product Brief or Decision Log.
- **PROPOSED:** product behavior described in existing design documents but still needs validation or PO approval where noted.
- **PENDING:** blocked on a decision, platform capability, simulation, or test.
- **PHASE 2:** intentionally deferred from the initial MVP.
- **OUT OF SCOPE:** must not be implemented in G-003.

Do not treat a proposed number, probability, threshold, cooldown, seat count, or reward table as approved merely because it appears in a draft.

## 3. MVP boundary

### 3.1 World and presentation

| Feature | Status | MVP requirement |
|---|---|---|
| One sect and one grand-hall scene | APPROVED | One primary scene suitable for continuous LIVE presentation |
| Vertical 9:16 output | APPROVED direction | Design for OBS-compatible vertical output; exact runtime setup remains to validate |
| Chibi cultivators | APPROVED direction | Distinct, readable characters; random assignment and persistent character identity |
| Realm-based visual progression | APPROVED direction | Outfit, aura, title and effects reflect progression |
| 2D/2.5D approach | Preferred hypothesis | Validate before locking engine or pipeline |
| Full 3D world / expansive exploration | OUT OF SCOPE | Do not start a full 3D pipeline before a prototype proves value |

### 3.2 Player and progression systems

| Feature | Status | MVP requirement |
|---|---|---|
| Player profile and persistent progression | APPROVED | Persist Tu Vi, realm, items and role/position data across LIVE sessions |
| Random fixed chibi assignment | APPROVED — D-013 | Assign once per player; no character-change feature |
| Linh Căn | APPROVED — D-009 | Roll once per LIVE session; do not overwrite persistent progression |
| Time-based cultivation | APPROVED direction | Credit only eligible presence supported by the event source; do not claim exact watch time if unavailable |
| Realm and breakthrough | APPROVED direction | Failure does not remove Tu Vi/items; retry cooldown and success rates remain pending |
| Linh Thạch conversion | APPROVED — D-014 | Automatically refine into Tu Vi; not a currency for buying pills |
| Gifts and combat power | APPROVED — D-010/D-018 | Fixed, known, disclosed rewards; paid advantage is an acknowledged design risk |
| Challenge and office seats | APPROVED for MVP — D-012 | Include player challenges and competition for Elder/Branch Leader/Sect Master positions; detailed thresholds remain configurable/proposed |
| Challenge power variance and tie rule | APPROVED — D-016 | Apply the recorded ±10% battle modifier; defender wins on a tie |
| Host role | APPROVED — D-015 | If a player takes Sect Master, host becomes unchallengeable Supreme Sect Master |
| Community events | MVP per GDD | Linh Khí Triều and Tâm Ma; triggers, rates and rewards remain subject to validated configuration |
| Leaderboard and titles | MVP per GDD | Tu Vi, Chiến Lực, Bế Quan and Cúng Phụng views; define session reset and privacy behavior |

### 3.3 LIVE and operations

| Feature | Status | MVP requirement |
|---|---|---|
| Adapter-based event input | APPROVED direction — D-007 | Separate game logic from the event provider |
| Local Simulation | REQUIRED — D-007 | Must support development, demos and testing without TikTok |
| Real TikTok connector | PENDING | No connector or real-account test until capability, platform policy and PO approval are verified |
| Operator controls | MVP | Pause/resume, moderation, reset/recovery and event monitoring |
| Persistence and recovery | MVP | Prevent duplicate event credit and recover saved player/session state |
| Text/TTS announcements | MVP direction | Prioritize critical events; local TTS quality and voice rights need validation |

## 4. Core player journey

1. **Discover:** viewer sees a clear on-screen invitation explaining how to join and what cultivation does.
2. **Join:** supported event adapter or Local Simulation emits a join event.
3. **Resolve identity:** map to a permitted stable identifier where available. If unavailable, use an explicitly temporary profile; never merge players based only on display name.
4. **Create/resume profile:** load persistent progression or create a new cultivator profile.
5. **Assign character:** assign one random chibi identity and keep it fixed for that player.
6. **Measure Linh Căn:** roll once for the current LIVE session; store session-specific result separately from persistent progression.
7. **Enter the hall:** place the cultivator in a readable position; show name, realm and concise status.
8. **Cultivate:** accrue progress only from eligible, deduplicated presence/events. Explain the basis of progress honestly.
9. **Interact:** eligible likes, gifts, community events and commands are processed through validated rules and anti-abuse controls.
10. **Milestone:** notify realm progress, breakthrough availability/result, item/position changes and other high-priority events.
11. **Compete/cooperate:** eligible players may challenge or assist under the published rules.
12. **Leave/reconnect:** persist state, close or suspend the session according to the validated reconnect policy, and avoid duplicate rewards on reconnect.

## 5. Engagement loops

### 5.1 Individual progression loop

Presence → cultivation → progress feedback → realm milestone → visual upgrade/title → next cultivation goal.

Requirements:
- Show current realm and progress toward the next milestone.
- Use short, readable feedback; do not flood the scene with repeated low-value messages.
- Failure to break through must not destroy accumulated Tu Vi (D-011).
- Do not present proposed progression rates or probabilities as final until approved.

### 5.2 Community loop

Shared activity → visible community meter/event → collective effect → announcement → renewed participation.

MVP candidates already in GDD:
- **Linh Khí Triều:** community milestone driven by eligible interaction totals.
- **Tâm Ma:** community assistance following a failed breakthrough, without removing Tu Vi.

Trigger thresholds, durations and bonuses remain proposed until simulation and PO approval.

### 5.3 Competition and social recognition loop

Cultivation/gear → Chiến Lực → challenge → 30-second assistance window (proposed in GDD) → deterministic result → office/title/leaderboard recognition.

Apply D-012, D-015, D-016 and D-018. Clearly disclose the effects of gifts and the accepted pay-to-win trade-off. Do not introduce paid random rewards.

## 6. Anti-spam, fairness and integrity requirements

These are product requirements, not final numeric tuning.

1. **Deduplication:** every incoming event must have an idempotency strategy. Replayed/retried events must not grant progress twice.
2. **Rate limits:** apply per-player and session-wide limits to high-volume likes, commands, gifts and announcements. Numeric limits are pending simulation.
3. **Batching:** aggregate high-frequency events where individual processing adds no gameplay value.
4. **Identity safety:** do not merge accounts based only on display names; handle missing/unstable identifiers explicitly.
5. **Presence integrity:** use only presence signals actually provided by the approved source. Do not fabricate watch duration.
6. **Command validation:** validate command syntax, eligibility, cooldown and target before state mutation; return concise feedback.
7. **Moderation:** operator can mute/block a participant's interaction according to documented controls without corrupting their saved progression.
8. **Event ordering:** define deterministic ordering for simultaneous events affecting the same player, seat or resource.
9. **Reward ledger:** record source event, normalized event ID, player, reward, processing result and timestamp needed for audit; minimize stored personal data.
10. **Recovery:** retries after crash/reconnect must not duplicate rewards or leave a challenge/event permanently half-completed.
11. **Announcement throttling:** prioritize critical events, combine repetitive low-priority events and prevent TTS queues from growing without bound.
12. **Abuse response:** suspicious bursts may be throttled or held for operator review; do not silently confiscate legitimate persistent progress.

## 7. Gift and non-paid participation rules

### 7.1 Gifts

- Gifts are intended as the primary revenue source (D-018).
- Gift-to-reward mapping must be fixed, known in advance and publicly disclosed.
- Gifts may contribute to Tu Vi/items/Chiến Lực as recorded in D-010/D-018.
- Do not implement paid mystery boxes, paid draws, randomized paid rewards or undisclosed reward multipliers.
- The game must display the selected side/target and the effect of a gift before the action is resolved where applicable.
- Gift processing must be idempotent and auditable.
- Real gift mapping remains blocked until D-007, permitted event access and current TikTok rules are verified. Local Simulation values are test fixtures, not evidence of real TikTok capability.

### 7.2 Non-paid participation

- Keep the core cultivation loop available through eligible presence and supported free interactions.
- Likes/community participation may contribute under anti-spam limits and actual provider capabilities.
- Do not require gifts to create a profile, receive a character, cultivate, or access the basic realm journey.
- Because D-010/D-018 intentionally permit substantial paid advantage, monitor whether non-paying players still have meaningful goals and visible progression. This is a balance risk to measure, not a reason to silently reverse the approved decision.

## 8. Vertical UI flow and screen states

The primary output is a continuous 9:16 grand-hall scene, not a collection of desktop-style pages.

### 8.1 Main scene layout

- **Top:** sect identity, LIVE/session state and compact event/announcement strip.
- **Upper focal area:** host/leadership seats and current high-priority event effects.
- **Center:** grand hall and cultivator crowd; names and realms must remain legible.
- **Lower information band:** selected player summary, current realm/progress and community event meter.
- **Bottom safe area:** short join instructions and supported interaction hints; keep essential text clear of platform overlays.

Exact coordinates, font sizes, visible character count and device safe areas require visual prototype validation.

### 8.2 Required UI states

1. Waiting / session not started.
2. Local Simulation or approved event adapter connected.
3. New cultivator joining and profile resolution.
4. Cultivation in progress.
5. Linh Căn result.
6. Breakthrough available / in progress / success / failure.
7. Challenge invitation / challenge active / assistance window / result.
8. Community event inactive / active / completed.
9. Operator paused / moderation action / recovery.
10. Reconnecting / source unavailable / local simulation fallback.

### 8.3 Interaction feedback

- Every accepted command gets concise acknowledgement.
- Invalid, duplicate, rate-limited or unavailable actions get clear feedback without exposing internal errors.
- High-priority events may use visual effects and TTS; low-priority events should be text-only or batched.
- VFX must not obscure names, realm labels, challenge state or essential progress.

## 9. Phase 2 boundary

Phase 2 begins only after MVP stability and Product Owner review. Candidate features from current GDD:
- Yêu Thú Công Sơn.
- Bí Cảnh.
- Sư Đồ.
- Expanded Điểm Danh/Bế Quan.
- Tông Môn Đại Bỉ.
- Phi Thăng/Tiên Giới or seasonal endgame after Chân Tiên.

Potential additions must be assessed against the same principles: free-first access, clear rewards, anti-abuse, operational simplicity and vertical readability. Do not pull these into MVP merely because they are attractive.

## 10. Explicit exclusions for this task

- Open-world exploration, multiple competing sects, full PvP combat beyond the approved challenge loop, trading/marketplace and expansive 3D worlds.
- Real TikTok account connection, unofficial connectors, credentials, cookies, session tokens or scraping.
- Any paid API, subscription, hosting, asset or service; project spend remains 0 VND (D-008).
- Engine/stack lock, final economy values, final probabilities, exact rate limits, seat counts, cooldowns or final art production pipeline.
- Production deployment, real monetization activation or release.

## 11. Risk register

| Risk | Impact | Mitigation / gate |
|---|---|---|
| TikTok event access unavailable or restricted | Core LIVE interactions cannot be proven | Keep adapter boundary and Local Simulation; verify permitted access before connector work |
| Unstable identity/presence signals | Duplicate or incorrect player progress | Use permitted stable IDs only; temporary profile policy; dedup and honest presence terminology |
| Spam/event bursts | Performance degradation and unfair rewards | Batch, idempotency, rate limits, queue controls and operator monitoring |
| Pay-to-win backlash | Player trust/retention risk | Disclose fixed rewards; preserve meaningful free progression; monitor outcomes; PO owns any balance change |
| Overloaded vertical scene | Names/progress unreadable | Prioritize hierarchy, limit simultaneous effects, validate on actual 9:16 output |
| TTS/announcement flood | Important events missed | Priority queue, batching, cooldown and text fallback |
| Data loss or duplicate rewards after reconnect | Persistent progression corruption | Durable event ledger, idempotent processing, backups/recovery tests |
| Policy/privacy violation | Account/platform/legal risk | No real connector until policy/access review; minimize stored identifiers; no credential collection |
| Scope expansion | MVP delayed | Enforce MVP/Phase 2 boundary and PO change control |
| Unapproved cost | Project budget breach | 0 VND additional spend; no paid services/assets without explicit approval |

## 12. Open decisions and validation gates

1. **D-005:** engine/stack remains preferred, not locked, until authorized PoC comparison.
2. **D-007:** specific permitted TikTok event access/connector remains pending; Local Simulation is mandatory.
3. **D-017:** progression rates, gift/like conversion, realm thresholds and chance tables remain provisional pending simulation and PO approval.
4. Exact event deduplication identifiers, presence semantics and reconnect grace behavior depend on actual adapter capabilities.
5. Exact number of visible cultivators, UI coordinates, safe areas and performance target require prototype testing.
6. TTS voice, quality and asset rights require validation.
7. Challenge/office seat counts, thresholds and cooldowns remain configurable proposals unless separately approved.

## 13. Acceptance checklist for G-003

- [ ] MVP and Phase 2 are explicitly separated.
- [ ] Main player journey is documented end to end.
- [ ] Individual, community and competition engagement loops are described.
- [ ] Anti-spam and integrity requirements are testable without invented numeric limits.
- [ ] Gift rules match D-010/D-018 and disclose pay-to-win risk.
- [ ] Free participation remains meaningful and basic progression does not require gifts.
- [ ] Vertical UI states and information hierarchy are documented.
- [ ] Platform, privacy, security, monetization and operations risks have mitigations.
- [ ] All unresolved values/decisions remain labeled pending/proposed.
- [ ] No approved decision D-009..D-020 is silently changed.

## 14. Next handoff

1. GitHub Copilot reviews this document in Agent mode, read-only, against source documents and the acceptance checklist.
2. Copilot records findings in `00_PROJECT/AGENCY/handoffs/G-003-COPILOT-REVIEW.md` without editing this specification.
3. ChatGPT reconciles review findings and prepares a PR.
4. Product Owner reviews and accepts or requests changes. No merge/deploy occurs without approval.
