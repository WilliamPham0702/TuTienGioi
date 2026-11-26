# GDD Decision — Camera Interruption Policy

## Confirmed
When a higher-priority camera event occurs while another event is being focused, the camera completes the current focus first. It then processes queued events according to the established priority order. No event is interrupted or discarded by this rule.

## Priority order
1. Boss currently fighting
2. Độ Kiếp
3. Tiên Cảnh
4. Realm breakthrough
5. Item received
6. Small event

## Queue behavior
Events are queued by importance, focused one at a time, and retained until processed. Higher-priority events that arrive during a current focus wait until that focus finishes, then are processed ahead of lower-priority queued events.
