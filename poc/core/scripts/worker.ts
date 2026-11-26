// Crash-test worker: resumes from the DB offset and processes a JSON event file. Killed at random by the runner.
import { readFileSync } from 'node:fs';
import { Store } from '../src/store.ts';
import { GameCore } from '../src/core.ts';
import type { LiveEvent } from '../src/types.ts';

const [dbPath, eventsPath] = process.argv.slice(2);
const events: LiveEvent[] = JSON.parse(readFileSync(eventsPath, 'utf8'));
const store = new Store(dbPath);
const core = new GameCore(store);
for (let i = core.offset; i < events.length; i++) core.process(events[i], i);
core.flushUntil(events[events.length - 1].ts, events.length);
store.close();
process.stdout.write('done\n');
