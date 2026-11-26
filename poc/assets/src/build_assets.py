#!/usr/bin/env python3
"""Generate the shared PoC assets (original artwork for TuTienGioi PoC).

Every asset is drawn here as SVG by Claude for the project and rendered to PNG
with rsvg-convert. No third-party artwork is used.

Character rig convention (shared by Phaser and Godot):
  * Every character layer is a full-canvas PNG of CHAR_W x CHAR_H at SCALE.
  * All layers share the same coordinate frame, so drawing every layer at the
    same position reproduces the character.
  * rig.json gives each layer a pivot (in base 200x260 units). Engines set the
    sprite origin to the pivot so rotation/scale happens around that joint.
  * The character root (feet centre) is at ROOT = (100, 250).

Usage: python3 build_assets.py  (writes ../out/*.png and ../out/rig.json)
"""
import json
import os
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "out"))
os.makedirs(OUT, exist_ok=True)

CHAR_W, CHAR_H = 200, 260
SCALE = 1.5  # PNG pixels per base unit
ROOT = (100, 250)

SKIN = "#FCE3D0"
SKIN_SHADE = "#F3C9AE"
INK = "#2B2140"

# Robe palettes per cultivation tier (Luyện Khí / Trúc Cơ / Kim Đan) and NPCs
ROBES = {
    "t1": {"main": "#EEF3FA", "shade": "#C9D6EA", "trim": "#7FA7D9", "sash": "#4F7CC0"},
    "t2": {"main": "#E3F5EC", "shade": "#B5DEC8", "trim": "#3FA37A", "sash": "#23805A"},
    "t3": {"main": "#F1E8FB", "shade": "#D4C0EE", "trim": "#B88A2E", "sash": "#7B4FC2"},
    "elder": {"main": "#E8E6EF", "shade": "#C5C1D3", "trim": "#5E5A7A", "sash": "#3E3A5C"},
    "master": {"main": "#FFFDF6", "shade": "#EADFC2", "trim": "#C9A24A", "sash": "#9C7A2A"},
}
HAIR = {
    "dark": {"main": "#2E2540", "hi": "#4B3E66"},
    "grey": {"main": "#A9A6B8", "hi": "#CFCDDA"},
    "white": {"main": "#F2F1F7", "hi": "#FFFFFF"},
}


def svg_doc(w, h, body, defs=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
        f'viewBox="0 0 {w} {h}"><defs>{defs}</defs>{body}</svg>'
    )


def render(name, svg, w, h, scale=1.0):
    path = os.path.join(OUT, name)
    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as f:
        f.write(svg)
        tmp = f.name
    subprocess.run(
        ["rsvg-convert", "-w", str(int(w * scale)), "-h", str(int(h * scale)),
         "-o", path, tmp], check=True)
    os.unlink(tmp)
    return path


def char_layer(name, body, defs=""):
    render(name, svg_doc(CHAR_W, CHAR_H, body, defs), CHAR_W, CHAR_H, SCALE)


# ---------------------------------------------------------------- character
def shadow():
    return '<ellipse cx="100" cy="250" rx="46" ry="9" fill="#000" opacity="0.28"/>'


def cape(p):
    # flowing back robe / cape, pivot at the neck
    return (
        f'<path d="M72 150 Q60 200 46 246 Q100 258 154 246 Q140 200 128 150 Z" '
        f'fill="{p["shade"]}" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/>'
    )


def body(p):
    return (
        f'<path d="M74 148 Q100 140 126 148 L144 244 Q100 254 56 244 Z" fill="{p["main"]}" '
        f'stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/>'
        # collar (cross-collar hanfu)
        f'<path d="M86 146 L100 176 L114 146" fill="none" stroke="{p["trim"]}" stroke-width="5" '
        f'stroke-linecap="round" stroke-linejoin="round"/>'
        # hem trim
        f'<path d="M58 236 Q100 246 142 236" fill="none" stroke="{p["trim"]}" stroke-width="5"/>'
        # sash + knot tails
        f'<path d="M66 186 Q100 194 134 186 L136 198 Q100 206 64 198 Z" fill="{p["sash"]}" '
        f'stroke="{INK}" stroke-width="2"/>'
        f'<path d="M104 200 Q110 222 102 236 M110 200 Q120 220 116 232" fill="none" '
        f'stroke="{p["sash"]}" stroke-width="5" stroke-linecap="round"/>'
        # feet
        f'<ellipse cx="86" cy="249" rx="11" ry="5" fill="{INK}"/>'
        f'<ellipse cx="114" cy="249" rx="11" ry="5" fill="{INK}"/>'
    )


def arm(p, side):
    # wide sleeve hanging from the shoulder; pivot at the shoulder
    if side == "l":
        d = "M76 152 Q56 170 52 204 Q66 214 80 206 Q84 180 84 158 Z"
        hand = (58, 208)
    else:
        d = "M124 152 Q144 170 148 204 Q134 214 120 206 Q116 180 116 158 Z"
        hand = (142, 208)
    return (
        f'<circle cx="{hand[0]}" cy="{hand[1]}" r="8" fill="{SKIN}" stroke="{INK}" stroke-width="2"/>'
        f'<path d="{d}" fill="{p["main"]}" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/>'
        f'<path d="{d}" fill="none" stroke="{p["trim"]}" stroke-width="3" '
        f'stroke-dasharray="0 60 40 200" />'
    )


def hair_back(h):
    return (
        f'<path d="M44 92 Q40 40 100 30 Q160 40 156 92 Q160 150 146 196 Q124 182 118 150 '
        f'L82 150 Q76 182 54 196 Q40 150 44 92 Z" fill="{h["main"]}" stroke="{INK}" '
        f'stroke-width="2.5" stroke-linejoin="round"/>'
    )


def head():
    return (
        f'<ellipse cx="100" cy="96" rx="54" ry="52" fill="{SKIN}" stroke="{INK}" stroke-width="2.5"/>'
        f'<ellipse cx="100" cy="142" rx="12" ry="6" fill="{SKIN_SHADE}"/>'
    )


def face():
    eye = (
        '<ellipse cx="{x}" cy="106" rx="9" ry="12" fill="{ink}"/>'
        '<ellipse cx="{x}" cy="110" rx="6" ry="7" fill="#6A4FB0"/>'
        '<circle cx="{hx}" cy="101" r="3.6" fill="#fff"/>'
        '<circle cx="{lx}" cy="113" r="1.6" fill="#fff"/>'
    )
    return (
        eye.format(x=80, hx=77, lx=83, ink=INK) + eye.format(x=120, hx=117, lx=123, ink=INK)
        + '<ellipse cx="70" cy="124" rx="9" ry="5" fill="#FF9BB0" opacity="0.55"/>'
        + '<ellipse cx="130" cy="124" rx="9" ry="5" fill="#FF9BB0" opacity="0.55"/>'
        + f'<path d="M94 126 Q100 131 106 126" fill="none" stroke="{INK}" stroke-width="2.5" '
        'stroke-linecap="round"/>'
        + f'<path d="M70 88 Q80 84 90 88 M110 88 Q120 84 130 88" fill="none" stroke="{INK}" '
        'stroke-width="2.5" stroke-linecap="round"/>'
    )


def hair_front(h):
    return (
        # bangs
        f'<path d="M46 98 Q44 46 100 40 Q156 46 154 98 Q146 72 128 66 Q122 84 104 74 '
        f'Q92 86 78 70 Q62 78 46 98 Z" fill="{h["main"]}" stroke="{INK}" stroke-width="2.5" '
        f'stroke-linejoin="round"/>'
        f'<path d="M70 56 Q90 48 112 52" fill="none" stroke="{h["hi"]}" stroke-width="4" '
        f'stroke-linecap="round" opacity="0.8"/>'
        # top knot
        f'<ellipse cx="100" cy="30" rx="18" ry="14" fill="{h["main"]}" stroke="{INK}" '
        f'stroke-width="2.5"/>'
    )


def hairpin():
    return (
        '<path d="M74 30 L128 26" stroke="#C9A24A" stroke-width="4" stroke-linecap="round"/>'
        '<circle cx="128" cy="26" r="5" fill="#E85D75" stroke="#7A2E3C" stroke-width="1.5"/>'
        '<path d="M128 31 L126 44 M131 31 L133 42" stroke="#E85D75" stroke-width="2" '
        'stroke-linecap="round"/>'
    )


def beard(h):
    return (
        f'<path d="M84 132 Q100 146 116 132 Q118 168 100 186 Q82 168 84 132 Z" '
        f'fill="{h["main"]}" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/>'
    )


def crown():
    return (
        '<path d="M80 30 L86 8 L94 22 L100 2 L106 22 L114 8 L120 30 Z" fill="#E8C35A" '
        'stroke="#7A5A14" stroke-width="2" stroke-linejoin="round"/>'
        '<circle cx="100" cy="20" r="4" fill="#5BC0EB"/>'
    )


RIG = {
    "base": {"w": CHAR_W, "h": CHAR_H, "scale": SCALE, "root": ROOT},
    # draw order back -> front; pivot in base units
    "layers": [
        {"name": "shadow", "pivot": [100, 250]},
        {"name": "hair_back", "pivot": [100, 60]},
        {"name": "cape", "pivot": [100, 150]},
        {"name": "body", "pivot": [100, 246]},
        {"name": "arm_l", "pivot": [80, 156]},
        {"name": "arm_r", "pivot": [120, 156]},
        {"name": "beard", "pivot": [100, 134], "optional": True},
        {"name": "head", "pivot": [100, 146]},
        {"name": "face", "pivot": [100, 146]},
        {"name": "hair_front", "pivot": [100, 146]},
        {"name": "hat", "pivot": [100, 146], "optional": True},
    ],
    # which PNG each layer uses for each character kind / tier
    "kinds": {},
}


def build_character_set():
    char_layer("ch_shadow.png", shadow())
    char_layer("ch_head.png", head())
    char_layer("ch_face.png", face())
    for hk, h in HAIR.items():
        char_layer(f"ch_hair_back_{hk}.png", hair_back(h))
        char_layer(f"ch_hair_front_{hk}.png", hair_front(h))
        char_layer(f"ch_beard_{hk}.png", beard(h))
    char_layer("ch_hat_hairpin.png", hairpin())
    char_layer("ch_hat_crown.png", crown())
    for rk, p in ROBES.items():
        char_layer(f"ch_cape_{rk}.png", cape(p))
        char_layer(f"ch_body_{rk}.png", body(p))
        char_layer(f"ch_arm_l_{rk}.png", arm(p, "l"))
        char_layer(f"ch_arm_r_{rk}.png", arm(p, "r"))

    def kind(robe, hair, beard_on, hat):
        k = {
            "shadow": "ch_shadow.png",
            "hair_back": f"ch_hair_back_{hair}.png",
            "cape": f"ch_cape_{robe}.png",
            "arm_l": f"ch_arm_l_{robe}.png",
            "arm_r": f"ch_arm_r_{robe}.png",
            "body": f"ch_body_{robe}.png",
            "head": "ch_head.png",
            "face": "ch_face.png",
            "hair_front": f"ch_hair_front_{hair}.png",
        }
        if beard_on:
            k["beard"] = f"ch_beard_{hair}.png"
        if hat:
            k["hat"] = f"ch_hat_{hat}.png"
        return k

    RIG["kinds"] = {
        "disciple_t1": kind("t1", "dark", False, "hairpin"),
        "disciple_t2": kind("t2", "dark", False, "hairpin"),
        "disciple_t3": kind("t3", "dark", False, "hairpin"),
        "elder": kind("elder", "grey", True, None),
        "master": kind("master", "white", True, "crown"),
    }
    # tiers in order, used by breakthrough
    RIG["tiers"] = ["disciple_t1", "disciple_t2", "disciple_t3"]
    RIG["tier_names"] = ["Luyện Khí", "Trúc Cơ", "Kim Đan"]


# --------------------------------------------------------------- background
W, H = 1080, 1920


def bg_sky():
    defs = (
        '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#141B3D"/><stop offset="0.45" stop-color="#3B3F7A"/>'
        '<stop offset="0.75" stop-color="#C97A9A"/><stop offset="1" stop-color="#F6C9A0"/>'
        '</linearGradient>'
        '<radialGradient id="moon"><stop offset="0" stop-color="#FFF6E0"/>'
        '<stop offset="0.6" stop-color="#FFE7B8" stop-opacity="0.6"/>'
        '<stop offset="1" stop-color="#FFE7B8" stop-opacity="0"/></radialGradient>'
    )
    import random
    rnd = random.Random(7)
    stars = "".join(
        f'<circle cx="{rnd.randint(0, W)}" cy="{rnd.randint(0, 700)}" r="{rnd.choice([1, 1.5, 2, 2.5])}" '
        f'fill="#fff" opacity="{rnd.uniform(0.3, 0.9):.2f}"/>' for _ in range(140))
    body = (
        f'<rect width="{W}" height="{H}" fill="url(#sky)"/>{stars}'
        '<circle cx="780" cy="300" r="170" fill="url(#moon)"/>'
        '<circle cx="780" cy="300" r="70" fill="#FFF8EA"/>'
    )
    render("bg_sky.png", svg_doc(W, H, body, defs), W, H)


def bg_mountains():
    defs = (
        '<linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A5C9E"/>'
        '<stop offset="1" stop-color="#8E7FB8" stop-opacity="0.2"/></linearGradient>'
        '<linearGradient id="m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F3468"/>'
        '<stop offset="1" stop-color="#6E6AA6" stop-opacity="0.4"/></linearGradient>'
    )
    body = (
        '<path d="M0 760 L120 560 L210 660 L330 470 L440 620 L560 420 L690 600 L800 500 '
        'L930 640 L1080 520 L1080 1100 L0 1100 Z" fill="url(#m1)"/>'
        '<path d="M0 900 L150 700 L260 820 L420 640 L560 800 L700 690 L860 860 L980 720 '
        'L1080 800 L1080 1200 L0 1200 Z" fill="url(#m2)"/>'
        # floating islands with waterfalls
        '<path d="M120 520 Q200 500 270 520 Q240 580 200 600 Q160 580 120 520 Z" fill="#3A3D74"/>'
        '<path d="M195 600 L200 700" stroke="#BFD8FF" stroke-width="4" opacity="0.6"/>'
        '<path d="M820 640 Q900 615 990 640 Q950 700 905 720 Q860 700 820 640 Z" fill="#3A3D74"/>'
        '<path d="M150 512 L170 470 L190 512 Z M880 632 L905 580 L930 632 Z" fill="#26294F"/>'
    )
    render("bg_mountains.png", svg_doc(W, H, body, defs), W, H)


def bg_hall():
    defs = (
        '<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B4A6E"/>'
        '<stop offset="1" stop-color="#2C2238"/></linearGradient>'
        '<linearGradient id="pillar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A1F2E"/>'
        '<stop offset="0.5" stop-color="#C0394D"/><stop offset="1" stop-color="#6A1826"/></linearGradient>'
        '<linearGradient id="roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2B4A"/>'
        '<stop offset="1" stop-color="#34466E"/></linearGradient>'
        '<linearGradient id="dais" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDE3CF"/>'
        '<stop offset="1" stop-color="#B9A98C"/></linearGradient>'
    )
    tiles = []
    # perspective floor lines converging to (540, 760)
    for i in range(-10, 11):
        x = 540 + i * 140
        tiles.append(f'<path d="M540 900 L{x} 1920" stroke="#7E6A92" stroke-width="2" opacity="0.35"/>')
    for k in range(10):
        y = 900 + (k * k) * 11
        tiles.append(f'<path d="M0 {y} L1080 {y}" stroke="#7E6A92" stroke-width="2" opacity="0.3"/>')
    body = (
        f'<path d="M0 900 L1080 900 L1080 1920 L0 1920 Z" fill="url(#floor)"/>' + "".join(tiles)
        # dais with steps
        + '<path d="M300 900 L780 900 L820 960 L260 960 Z" fill="url(#dais)" stroke="#6B5B44" stroke-width="3"/>'
        + '<path d="M260 960 L820 960 L850 1000 L230 1000 Z" fill="#D6C7A9" stroke="#6B5B44" stroke-width="3"/>'
        + '<path d="M230 1000 L850 1000 L870 1030 L210 1030 Z" fill="#C4B393" stroke="#6B5B44" stroke-width="3"/>'
        # pillars
        + '<rect x="40" y="300" width="90" height="1300" fill="url(#pillar)" stroke="#3A0E16" stroke-width="4"/>'
        + '<rect x="950" y="300" width="90" height="1300" fill="url(#pillar)" stroke="#3A0E16" stroke-width="4"/>'
        + '<rect x="210" y="420" width="60" height="520" fill="url(#pillar)" stroke="#3A0E16" stroke-width="3"/>'
        + '<rect x="810" y="420" width="60" height="520" fill="url(#pillar)" stroke="#3A0E16" stroke-width="3"/>'
        + '<path d="M36 300 h98 v26 h-98 Z M946 300 h98 v26 h-98 Z" fill="#E8C35A"/>'
        # roof eaves (curved, upturned ends)
        + '<path d="M-40 250 Q540 330 1120 250 L1120 360 Q540 420 -40 360 Z" fill="url(#roof)" '
          'stroke="#0F1528" stroke-width="5"/>'
        + '<path d="M-40 360 Q540 420 1120 360" fill="none" stroke="#E8C35A" stroke-width="8"/>'
        + '<path d="M150 400 Q540 470 930 400 L930 440 Q540 505 150 440 Z" fill="#26365E" '
          'stroke="#0F1528" stroke-width="4"/>'
        # plaque
        + '<rect x="400" y="455" width="280" height="90" rx="10" fill="#2A1A10" stroke="#E8C35A" stroke-width="6"/>'
        + '<text x="540" y="516" font-family="Noto Serif, serif" font-size="34" fill="#E8C35A" '
          'text-anchor="middle" font-weight="700">THIÊN VÂN TÔNG</text>'
        # lanterns
        + '<g fill="#F2A43A" stroke="#7A3E0E" stroke-width="3">'
          '<ellipse cx="300" cy="580" rx="26" ry="34"/><ellipse cx="780" cy="580" rx="26" ry="34"/></g>'
        + '<path d="M300 512 L300 546 M780 512 L780 546" stroke="#2A1A10" stroke-width="3"/>'
    )
    render("bg_hall.png", svg_doc(W, H, body, defs), W, H)


def fg_mist():
    defs = (
        '<radialGradient id="mist" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" '
        'stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
    )
    blobs = "".join(
        f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="url(#mist)"/>'
        for x, y, rx, ry in [(120, 1840, 300, 90), (520, 1880, 380, 100), (940, 1830, 320, 90),
                             (300, 1760, 260, 60), (800, 1750, 260, 60)])
    render("fg_mist.png", svg_doc(W, H, blobs, defs), W, H)


# ---------------------------------------------------------------------- vfx
def vfx():
    render("fx_glow.png", svg_doc(64, 64,
           '<circle cx="32" cy="32" r="32" fill="url(#g)"/>',
           '<radialGradient id="g"><stop offset="0" stop-color="#fff"/>'
           '<stop offset="0.25" stop-color="#E6F4FF" stop-opacity="0.9"/>'
           '<stop offset="1" stop-color="#9FD3FF" stop-opacity="0"/></radialGradient>'), 64, 64)
    ticks = "".join(
        f'<rect x="254" y="14" width="4" height="26" fill="#FFE7A3" transform="rotate({a} 256 256)"/>'
        for a in range(0, 360, 15))
    runes = "".join(
        f'<circle cx="256" cy="70" r="9" fill="none" stroke="#FFE7A3" stroke-width="3" '
        f'transform="rotate({a} 256 256)"/>' for a in range(0, 360, 45))
    render("fx_seal.png", svg_doc(512, 512,
           '<circle cx="256" cy="256" r="232" fill="none" stroke="#FFE7A3" stroke-width="6"/>'
           '<circle cx="256" cy="256" r="186" fill="none" stroke="#FFE7A3" stroke-width="3" '
           'stroke-dasharray="14 10"/>'
           '<path d="M256 96 L395 336 L117 336 Z M256 416 L117 176 L395 176 Z" fill="none" '
           'stroke="#FFE7A3" stroke-width="3"/>' + ticks + runes), 512, 512)
    render("fx_pillar.png", svg_doc(256, 1024,
           '<rect width="256" height="1024" fill="url(#p)"/>',
           '<linearGradient id="p" x1="0" y1="0" x2="1" y2="0">'
           '<stop offset="0" stop-color="#FFF3C4" stop-opacity="0"/>'
           '<stop offset="0.5" stop-color="#FFF8E0" stop-opacity="0.9"/>'
           '<stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></linearGradient>'), 256, 1024)


if __name__ == "__main__":
    build_character_set()
    bg_sky()
    bg_mountains()
    bg_hall()
    fg_mist()
    vfx()
    with open(os.path.join(OUT, "rig.json"), "w", encoding="utf-8") as f:
        json.dump(RIG, f, ensure_ascii=False, indent=2)
    print("assets written to", OUT)
