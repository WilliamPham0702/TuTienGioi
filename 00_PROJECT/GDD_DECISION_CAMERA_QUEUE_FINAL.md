# GDD Decision — Camera Queue Final Rules

## Confirmed queue rules
1. Events with the same priority: process by arrival time (FIFO).
2. Repeated events of the same type occurring together/while queued: aggregate into one event presentation and show all relevant players.
3. Queue overload: aggregate small events to shorten presentation time; do not discard events.
4. When queue is empty: return to the overall gameplay camera.

## Event priority (highest to lowest)
1. Boss currently fighting
2. Độ Kiếp
3. Tiên Cảnh
4. Realm breakthrough
5. Item received
6. Small event

## Interruption policy
Complete the current camera focus before processing queued higher-priority events. Do not interrupt the current focus under this policy.

## Focus duration
- Small: 3 seconds
- Medium: 5 seconds
- Large: 8 seconds
- Độ Kiếp: 12 seconds
- Tiên Cảnh: 15 seconds
- Boss: dynamically follows battle developments, no fixed duration

## General queue behavior
- Events are retained until processed.
- Process one focus at a time.
- Re-sort pending events by priority after each current focus completes.
- FIFO applies within equal priority.
- Aggregate repeated events and small events where appropriate to reduce camera congestion, without dropping them.
- When the queue is empty, return to overall gameplay camera.
