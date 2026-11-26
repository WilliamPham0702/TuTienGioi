# TuTienGioi — GDD Decision: Camera Event Priority Queue

Date: 2026-11-26
Status: CONFIRMED

## Decision
When multiple camera-worthy events occur simultaneously, queue them and process one at a time. Do not discard events.

## Priority
- Sort pending events by importance.
- Focus on the highest-priority event first.
- After it finishes, process the next event in the queue.
- Preserve events until each has received camera focus; no event is silently skipped.

## Integration note
Detailed priority tiers and tie-breaking rules remain to be defined.
