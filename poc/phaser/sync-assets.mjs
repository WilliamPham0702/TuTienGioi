// Copy the shared PoC assets and scenario files into public/ (same files the Godot PoC uses).
import { cpSync, mkdirSync, rmSync } from 'node:fs';
rmSync('public', { recursive: true, force: true });
mkdirSync('public', { recursive: true });
cpSync('../assets/out', 'public/assets', { recursive: true });
cpSync('../shared', 'public/shared', { recursive: true, filter: (p) => !p.endsWith('.py') });
console.log('assets synced');
