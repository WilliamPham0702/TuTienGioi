# TuTienGioi — Project Brief

## 1. Product vision
Build an interactive TikTok LIVE cultivation game (Tu Tiên / Tiên Hiệp). Viewers are persistent in-game cultivators, not passive spectators. Their time in the LIVE and permitted LIVE interactions contribute to their cultivation journey.

## 2. Core experience
- The primary scene is a grand hall of a cultivation sect.
- The hall contains the Sect Master (Tông chủ), Elders (Trưởng lão), and other sect roles.
- Each participating viewer is represented by an individual disciple/cultivator character.
- Cultivators accumulate cultivation progress (tu vi) over time while watching.
- LIVE interactions such as likes may contribute spiritual energy under rate limits and anti-abuse rules.
- Gifts may map to optional in-game items such as pills (đan dược), subject to platform rules and balanced game economy.
- Cultivation realms, breakthroughs, tribulations, visual effects, and outfits create visible progression.

## 3. Product principles
1. Visible progression: progress must be represented by character appearance, outfit, aura, rank, and milestone effects—not only numbers.
2. Spectator-to-player conversion: viewers should understand how to join and what their character is doing.
3. Retention through meaningful goals: time-based cultivation, milestones, sect identity, and social recognition.
4. Fair progression: free participation remains viable; paid interactions must not make the game feel compulsory or irreversibly pay-to-win.
5. Reliable automation: the game should continue operating with minimal manual moderation and recover safely from disconnects or event bursts.
6. Live readability: the vertical broadcast scene must remain legible when many player characters and comments are present.

## 4. Initial MVP boundary
Proposed first playable milestone:
- One sect and one grand-hall scene.
- A small set of character archetypes and realm-based outfit tiers.
- Viewer identity mapping to an in-game character.
- Presence/session tracking and time-based cultivation.
- A controlled likes-to-spiritual-energy mechanic.
- A basic realm progression and breakthrough sequence.
- A LIVE event adapter tested with a compliant, supported integration method.
- Operator controls for pause, moderation, reset/recovery, and event monitoring.

Not in MVP unless explicitly approved:
- Open world exploration.
- Multiple competing sects.
- Full PvP combat.
- Player-to-player trading or a complex marketplace.
- Unbounded gift-to-power conversion.

## 5. Roles and collaboration
- Product Owner: WilliamPham0702 — final product decisions and acceptance.
- ChatGPT: product/design support, visual direction, specifications, documentation, and review.
- Claude: implementation and technical investigation, with code changes reviewed before release.

## 6. Decisions still open
- Game engine and rendering approach.
- Whether the first build is 2.5D or 3D.
- Target streaming setup and operating system.
- Exact TikTok LIVE event integration method and platform-policy review.
- Realm names, sub-stages, progression curve, and balancing.
- Gift mapping, monetization boundaries, and anti-abuse limits.
- Character capacity and performance target.

## 7. Definition of a successful MVP
A real viewer can join a LIVE session, appear as a distinct cultivator, accumulate progress while present, trigger an allowed interaction, and visibly experience a breakthrough with the correct character/outfit/effect. The operator can observe and control the system, and the game can recover from dropped connections without corrupting progression.
