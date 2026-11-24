// C-002 PoC-3 — bounded ingest queue. When full, likes are dropped first; comments/gifts are kept.
import type { LiveEvent } from './types.ts';

export class BoundedQueue {
  items: { ev: LiveEvent; at: number }[] = [];
  head = 0;
  dropped = { like: 0, other: 0 };
  maxLen = 0;
  cap: number;
  constructor(cap: number) {
    this.cap = cap;
  }

  get length() {
    return this.items.length - this.head;
  }

  push(ev: LiveEvent, at: number) {
    if (this.length >= this.cap) {
      if (ev.type === 'like') {
        this.dropped.like++;
        return;
      }
      // make room by dropping the oldest queued like, if any
      const i = this.items.findIndex((x, k) => k >= this.head && x.ev.type === 'like');
      if (i >= 0) {
        this.items.splice(i, 1);
        this.dropped.like++;
      } else {
        this.dropped.other++;
        return;
      }
    }
    this.items.push({ ev, at });
    this.maxLen = Math.max(this.maxLen, this.length);
  }

  shift() {
    if (this.head >= this.items.length) return undefined;
    const x = this.items[this.head++];
    if (this.head > 4096 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return x;
  }
}
