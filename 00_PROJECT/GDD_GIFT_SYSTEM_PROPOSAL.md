# Gift System — Detailed Design Proposal
Status: proposal. Exact TikTok gift coin-value thresholds and gift catalog must be sourced from the actual platform catalog, not guessed.

## Design principles
- Gifts create game-world effects, not just cultivation points.
- Gift effects should be visible and readable on LIVE, while avoiding excessive screen obstruction.
- The giver's existing character receives personal rewards when present.
- If the giver is not LIVE, reward goes into the approved shared-world pool; do not create a character automatically.
- Gifts cannot introduce equipment or pháp bảo.
- Special gifts may trigger world events; repeated gifts are aggregated for UI and camera.

## Gift tiers (names are provisional)
1. Common: small personal progression/resource reward.
2. Uncommon: personal reward plus a small chance of a minor world event.
3. Rare: meaningful personal reward and/or shared event.
4. Epic: major world event or shared encounter modifier.
5. Legendary: high spectacle world event with broad community participation.
6. Mythic: rare server-wide event with a unique visual/camera moment.

Tier boundaries are based on actual gift coin value/catalog metadata and are to be configured after reviewing the real TikTok gift catalog. Do not invent coin cutoffs.

## Personal reward routing
- LIVE sender with a character: reward routed to that character, with event triggers optionally affecting the shared world.
- LIVE sender without a character: reward routing follows the normal character-creation/join flow; never silently create duplicates.
- Sender not LIVE: shared-world pool; no automatic character creation.

## Shared-world reward distribution
- Divide shared pool rewards evenly among eligible online players.
- Assign any remainder randomly to one eligible recipient.
- Eligibility snapshot and reward receipt must be recorded to prevent duplicate claims.

## World event trigger examples (subject to catalog/tuning)
- Common: cultivation pulse, small resource shower.
- Uncommon: localized gathering/resource event.
- Rare: short monster incursion or mini-boss opportunity.
- Epic: world boss modifier or special event instance.
- Legendary: world-wide boss/event with broadcast.
- Mythic: large world event with a distinct environment/camera treatment.
Gift triggers must not create a permanent advantage that cannot be counterbalanced by normal gameplay.

## Anti-abuse and safeguards
- Deduplicate gift webhook/event identifiers.
- Validate sender, gift identifier, count, and event authenticity.
- Batch repeated gift events; avoid camera/notification spam.
- Never allow event retries to duplicate rewards.
- Use rate-limits and server-side ledger accounting.
- Store a durable audit entry for gift, reward, recipient, and event outcome.

## Pending tuning
- Actual gift catalog and coin values.
- Tier thresholds and exact reward tables.
- Event durations, cooldowns, concurrent-event rules and reward caps.
- Moderation/eligibility edge cases.
