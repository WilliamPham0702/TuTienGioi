#!/usr/bin/env python3
"""Generate deterministic visual scenarios shared by the Phaser and Godot PoCs.

Events reference a slot index; engines apply `slot % N` so the same file
works for 40/60/80 characters. Output: scenario_normal.json, scenario_storm.json
"""
import json, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
FIRST = ["Minh", "Lan", "Tuấn", "Hương", "Khoa", "Ngọc", "Phúc", "Thảo", "Dũng", "Vy",
         "Quân", "Trâm", "Hải", "My", "Long", "Yến", "Bảo", "Châu", "Đức", "Nhi"]
PREFIX = ["Đạo hữu", "Tiểu", "Sư đệ", "Sư muội", "Lão", "Tiên tử", "Huynh", ""]


def names(rnd, n):
    out = []
    for i in range(n):
        p = rnd.choice(PREFIX)
        out.append((p + " " if p else "") + rnd.choice(FIRST) + (f" {rnd.randint(1, 99)}" if rnd.random() < 0.3 else ""))
    return out


def normal(seed=11, length=120.0):
    rnd = random.Random(seed)
    ev = []
    t = 1.0
    while t < length:
        ev.append({"t": round(t, 2), "type": "celebrate", "slot": rnd.randint(0, 79)}); t += rnd.uniform(2.5, 4.5)
    for t in range(3, int(length), 6):
        ev.append({"t": t + 0.5, "type": "join", "slot": rnd.randint(0, 79), "name": names(rnd, 1)[0]})
    for t in range(2, int(length), 5):
        ev.append({"t": float(t), "type": "cultivate", "slot": rnd.randint(0, 79), "duration": rnd.choice([6, 8, 10])})
    for t in range(8, int(length), 15):
        ev.append({"t": float(t), "type": "breakthrough", "slot": rnd.randint(0, 79)})
    for t in range(5, int(length), 10):
        ev.append({"t": t + 0.25, "type": "swap", "slot": rnd.randint(0, 79), "slot2": rnd.randint(0, 79)})
    ev.sort(key=lambda e: e["t"])
    return {"name": "normal", "length": length, "loop": True, "events": ev}


def storm(seed=12, length=30.0):
    rnd = random.Random(seed)
    ev = [{"t": 1.0 + i * 3.0, "type": "breakthrough", "slot": rnd.randint(0, 59)} for i in range(10)]
    ev += [{"t": float(t), "type": "cultivate", "slot": rnd.randint(0, 59), "duration": 8} for t in range(0, 30, 2)]
    ev.sort(key=lambda e: e["t"])
    return {"name": "storm", "length": length, "loop": True, "events": ev}


if __name__ == "__main__":
    rnd = random.Random(5)
    json.dump({"names": names(rnd, 80)}, open(os.path.join(HERE, "names.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for sc in (normal(), storm()):
        json.dump(sc, open(os.path.join(HERE, f"scenario_{sc['name']}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("ok")
