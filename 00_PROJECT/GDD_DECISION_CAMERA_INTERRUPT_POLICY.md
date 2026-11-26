# TuTienGioi — GDD Decision: Camera Interrupt Policy

Date: 2026-11-26
Status: CONFIRMED

## Decision
When a higher-priority event appears while the camera is already focused on an event, the camera completes the current focus first. It then processes queued events according to priority.

## Rules
- Do not interrupt an active camera focus.
- Newly appearing events enter the queue.
- After the current focus ends, sort queued events by the established priority order and select the next event.
- Do not discard queued events.
