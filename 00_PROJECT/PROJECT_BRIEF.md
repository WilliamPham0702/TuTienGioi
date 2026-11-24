# TuTienGioi — Project Brief

## 1. Product vision
Build an interactive TikTok LIVE cultivation game (Tu Tiên / Tiên Hiệp). Viewers are persistent in-game cultivators, not passive spectators. Their eligible LIVE presence and permitted interactions contribute to their cultivation journey.

## 2. Core experience
- The primary scene is a beautiful, atmospheric grand hall of a cultivation sect.
- The hall contains the Tông chủ, Trưởng lão, Chấp sự, and viewer-controlled đệ tử.
- Each participating viewer is represented by a distinct chibi xianxia character.
- Cultivators accumulate tu vi while eligible and present in the LIVE.
- Likes may contribute linh khí under rate limits and anti-abuse rules.
- Gifts may map to optional đan dược or spectacle effects, subject to platform rules. Free progression must remain viable.
- Cảnh giới, đột phá, độ kiếp, outfits, auras, and VFX provide visible progression.

## 3. Approved visual direction
- Chibi tiên hiệp characters: appealing, expressive, readable at small livestream sizes.
- Beautiful, detailed fantasy environments with strong composition, atmosphere, lighting, and depth.
- Eye-catching but controlled effects for cultivation, breakthroughs, and tribulations.
- Visual quality and fast production are more important than using full 3D technology.
- Prefer a 2D/2.5D approach as the initial production hypothesis; validate before selecting tools or engine.
- Avoid committing to a full 3D pipeline unless a prototype demonstrates clear value and remains feasible within the zero-additional-spend constraint.

## 4. Product principles
1. Visible progression: show progress through character appearance, outfit, aura, rank, and milestone effects.
2. Spectator-to-player conversion: explain how viewers join and what their character is doing.
3. Retention through meaningful goals: time-based cultivation, milestones, sect identity, and social recognition.
4. Fair progression: free participation remains viable; paid interactions must not make gifts compulsory.
5. Reliable automation: tolerate disconnects and event bursts; provide operator controls.
6. LIVE readability: names, realms, effects, and crowds must remain legible on a vertical phone screen.
7. Fast time-to-live: build the smallest attractive, stable experience that can be operated in a real LIVE session.

## 5. Initial MVP boundary
- One sect and one grand-hall scene.
- A small reusable chibi character roster and limited realm-based outfit tiers.
- Viewer identity mapping to an in-game character.
- Presence/session tracking and time-based cultivation.
- Controlled likes-to-linh-khi mechanic, if event access supports it.
- Basic realm progression and breakthrough sequence.
- LIVE event adapter with compliant supported access, plus local simulation mode.
- Operator controls for pause, moderation, reset/recovery, and event monitoring.
- OBS-compatible vertical output.

Not in MVP unless explicitly approved:
- Open-world exploration.
- Multiple competing sects.
- Full PvP combat.
- Player trading or complex marketplace.
- Unbounded gift-to-power conversion.
- Full 3D character rigs or expansive 3D worlds before a 2D/2.5D prototype is evaluated.

## 6. Roles and collaboration
- Product Owner: WilliamPham0702 — final product decisions and acceptance.
- ChatGPT: product/design support, visual direction, specifications, documentation, and review.
- Claude: implementation and technical investigation, with code changes reviewed before release.

## 7. Decisions still open
- Exact 2D versus 2.5D implementation and rendering engine.
- Target streaming setup and operating system.
- Exact TikTok LIVE event integration method and platform-policy review.
- Realm names, sub-stages, progression curve, and balancing.
- Gift mapping, monetization boundaries, and anti-abuse limits.
- Maximum simultaneous visible characters and performance target.

## 8. Definition of a successful MVP
A real viewer can join a LIVE session, appear as a distinct chibi cultivator, accumulate eligible progress, trigger an allowed interaction, and visibly experience a breakthrough with an updated outfit/effect. The operator can control the session, and the game recovers from dropped connections without corrupting progression.
