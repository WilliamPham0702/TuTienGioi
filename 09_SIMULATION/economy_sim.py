"""C-002 — Mô phỏng kinh tế TuTienGioi (công cụ thiết kế, không phải code game).

Chạy:  python3 09_SIMULATION/economy_sim.py [--players 1000] [--days 30] [--seed 1]
Mọi giả định hành vi người xem (thời gian xem, tim, tỉ lệ tặng quà) là GIẢ ĐỊNH,
chưa có dữ liệu thật. Mục đích: so sánh tương đối, phát hiện con số lệch.
"""
import argparse, random, statistics, json

# ---- Con số dùng tạm từ GAME_FLOW_v0.1 (D-017) ----
LINH_CAN = [  # (tên, hệ số, tỉ lệ)
    ("Tạp", 1.0, .40), ("Tứ", 1.2, .25), ("Tam", 1.4, .18), ("Song", 1.7, .10),
    ("Nhất phẩm", 2.0, .05), ("Thiên", 2.5, .018), ("Dị", 3.0, .002)]
REALMS = ["Luyện Khí", "Trúc Cơ", "Kim Đan", "Nguyên Anh", "Hóa Thần",
          "Luyện Hư", "Hợp Thể", "Đại Thừa", "Độ Kiếp", "Chân Tiên"]
COST_PER_SUBSTAGE = [600, 3000, 12000, 40000, 120000, 300000, 700000, 1500000, 3000000]
BASE_TV_PER_SEC = 1
TV_PER_HA_PHAM = 10          # 1 tim = 1 hạ phẩm linh thạch = 10 Tu Vi
HEART_CAP_PER_MIN = 60       # trần linh thạch từ tim / người / phút
# Tỉ lệ đột phá đại cảnh (đề xuất mới, D-011: thất bại không phạt, chờ 60s)
BREAK_SUCCESS = [0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.40, 0.35, 0.30]
RETRY_SEC = 60
# Quà: giả định quy đổi 1 xu TikTok (coin) = GIFT_TV_PER_COIN Tu Vi
GIFT_TV_PER_COIN = 200

# ---- Giả định hành vi (chưa có dữ liệu thật) ----
P_RETURN_NEXT_DAY = 0.35         # xác suất quay lại mỗi ngày (người chơi thường)
WATCH_MIN_MEDIAN = 8             # phút/phiên, phân phối lognormal
P_LIKER = 0.40                   # % người có thả tim
HEARTS_PER_MIN_LIKER = 20        # tim/phút trung bình khi thả
GIFTER_SHARE = 0.05              # % người có tặng quà
WHALE_SHARE = 0.005              # % "đại gia"
COINS_PER_SESSION_GIFTER = 30    # xu/phiên trung bình
COINS_PER_SESSION_WHALE = 1500

def roll_linh_can(rng):
    r, acc = rng.random(), 0
    for name, mult, p in LINH_CAN:
        acc += p
        if r < acc: return name, mult
    return LINH_CAN[-1][:2]


class Player:
    def __init__(self, rng, kind):
        self.kind = kind; self.tv = 0.0; self.realm = 0; self.sub = 0
        self.tv_watch = self.tv_heart = self.tv_gift = 0.0
        self.liker = rng.random() < P_LIKER or kind != "free"
        self.engagement = rng.lognormvariate(0, 0.6)  # độ "nghiện" cá nhân
        self.active = True

    def add(self, amt, src):
        self.tv += amt; setattr(self, "tv_" + src, getattr(self, "tv_" + src) + amt)

def advance(p, rng, wait_budget_sec):
    """Lên cấp theo Tu Vi hiện có; đột phá đại cảnh có thể thất bại (không phạt)."""
    while p.realm < 9:
        cost = COST_PER_SUBSTAGE[p.realm]
        spent = sum(4 * c for c in COST_PER_SUBSTAGE[:p.realm]) + p.sub * cost
        if p.tv - spent < cost: return
        if p.sub < 3:
            p.sub += 1; continue
        # đột phá đại cảnh
        while rng.random() > BREAK_SUCCESS[p.realm]:
            wait_budget_sec -= RETRY_SEC
            if wait_budget_sec <= 0: return
        p.realm += 1; p.sub = 0

def run(n, days, seed):
    rng = random.Random(seed)
    players = []
    for _ in range(n):
        r = rng.random()
        kind = "whale" if r < WHALE_SHARE else "gifter" if r < GIFTER_SHARE else "free"
        players.append(Player(rng, kind))
    snapshots = {}
    for day in range(1, days + 1):
        for p in players:
            if day > 1:
                pr = min(0.9, P_RETURN_NEXT_DAY * p.engagement * (1.6 if p.kind != "free" else 1))
                if rng.random() > pr: continue
            _, mult = roll_linh_can(rng)                       # D-009: đo lại mỗi phiên
            minutes = max(1, rng.lognormvariate(0, 0.9) * WATCH_MIN_MEDIAN * p.engagement)
            p.add(minutes * 60 * BASE_TV_PER_SEC * mult, "watch")
            if p.liker:
                hpm = min(HEART_CAP_PER_MIN, rng.expovariate(1 / HEARTS_PER_MIN_LIKER))
                p.add(hpm * minutes * TV_PER_HA_PHAM, "heart")  # D-014: tự luyện hóa
            if p.kind != "free":
                mean = COINS_PER_SESSION_WHALE if p.kind == "whale" else COINS_PER_SESSION_GIFTER
                p.add(rng.expovariate(1 / mean) * GIFT_TV_PER_COIN, "gift")
            advance(p, rng, minutes * 60)
        if day in (1, 7, 30) or day == days:
            snapshots[day] = summarize(players)
    return snapshots, players

def summarize(players):
    out = {}
    for kind in ("free", "gifter", "whale"):
        grp = [p for p in players if p.kind == kind]
        if not grp: continue
        dist = {}
        for p in grp: dist[REALMS[p.realm]] = dist.get(REALMS[p.realm], 0) + 1
        tot = sum(p.tv for p in grp) or 1
        out[kind] = {
            "n": len(grp),
            "median_tv": round(statistics.median(p.tv for p in grp)),
            "realm_dist": dist,
            "share_watch": round(sum(p.tv_watch for p in grp) / tot, 3),
            "share_heart": round(sum(p.tv_heart for p in grp) / tot, 3),
            "share_gift": round(sum(p.tv_gift for p in grp) / tot, 3),
        }
    return out

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--players", type=int, default=1000)
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--tv-per-ha-pham", type=float)
    ap.add_argument("--heart-cap", type=float)
    a = ap.parse_args()
    if a.tv_per_ha_pham is not None: TV_PER_HA_PHAM = a.tv_per_ha_pham
    if a.heart_cap is not None: HEART_CAP_PER_MIN = a.heart_cap
    snaps, _ = run(a.players, a.days, a.seed)
    print(json.dumps(snaps, ensure_ascii=False, indent=1))
