"""Draw the soft pink page background (public/backdrop/) and the neo-brutalist stickers (public/stickers/) as SVG.

fond.svg (landscape) and fond-mobile.svg (portrait) only carry faint tone-step motifs; the stickers are
separate files placed on buttons and headings.
Same approach as epitadoomscrolling tools/gen_neo_stickers.py.

Run: python3 tools/gen_backdrop.py
"""
import math
import xml.dom.minidom
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'public' / 'backdrop'
PINK, PINK_DEEP, YELLOW, INK, WHITE = '#ff4fa0', '#f0278a', '#ffe500', '#111111', '#ffffff'
FONT = "font-family=\"Anton, Impact, 'Arial Black', sans-serif\" font-weight=\"900\""
SH = 10  # hard offset shadow, no blur


def shadowed(shape, fill, sw=5):
    """Draw `shape` (SVG elements without fill/stroke) once as a black offset block, once in colour."""
    return (f'<g transform="translate({SH} {SH})" fill="{INK}" stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round">{shape}</g>'
            f'<g fill="{fill}" stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round">{shape}</g>')


def label(x, y, txt, size, fill, rotate=0):
    return (f'<text x="{x}" y="{y}" text-anchor="middle" dominant-baseline="central" font-size="{size}" {FONT} '
            f'fill="{fill}" transform="rotate({rotate} {x} {y})">{txt}</text>')


def pts(points):
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in points)


def burst(cx, cy, r_out, r_in, n, phase=0.0):
    return [(cx + (r_out if i % 2 == 0 else r_in) * math.cos(phase + i * math.pi / n),
             cy + (r_out if i % 2 == 0 else r_in) * math.sin(phase + i * math.pi / n)) for i in range(2 * n)]


def star4(cx, cy, r):
    return (f'<path d="M{cx} {cy - r} Q{cx} {cy} {cx + r} {cy} Q{cx} {cy} {cx} {cy + r} '
            f'Q{cx} {cy} {cx - r} {cy} Q{cx} {cy} {cx} {cy - r} Z"/>')


SWEATER = ('<path d="M70 40 L100 28 Q120 48 140 28 L170 40 L220 96 L192 124 L170 104 V230 H70 V104 '
           'L48 124 L20 96 Z"/>')


def hanger_sweater():
    hook = (f'<path d="M120 30 V14 Q120 0 134 0 Q148 0 148 14" fill="none" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>'
            f'<path d="M120 30 L40 70 H200 Z" fill="none" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>')
    knit = ''.join(f'<path d="M78 {150 + k * 22} l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l12 9" '
                   f'fill="none" stroke="{INK}" stroke-width="4"/>' for k in range(3))
    return f'<g transform="translate(0 40)">{shadowed(SWEATER, PINK_DEEP)}{knit}</g>{hook}'


def yellow_sweater():
    zig = ''.join(f'<path d="M74 {120 + k * 34} l16 -14 l16 14 l16 -14 l16 14 l16 -14 l16 14 l16 -14 l6 5" '
                  f'fill="none" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>' for k in range(3))
    return shadowed(SWEATER, YELLOW) + zig


def price_tag():
    shape = '<path d="M60 20 H220 V140 H60 L14 80 Z"/>'
    string = f'<path d="M40 80 Q10 20 -30 34" fill="none" stroke="{INK}" stroke-width="5"/>'
    hole = f'<circle cx="44" cy="80" r="9" fill="{PINK}" stroke="{INK}" stroke-width="5"/>'
    return string + shadowed(shape, WHITE) + hole + label(140, 82, '5 €', 64, INK, -4)


def snap_it():
    return shadowed(f'<polygon points="{pts(burst(110, 110, 104, 74, 13))}"/>', YELLOW) + label(110, 112, 'SNAP IT', 32, INK, -8)


def thrift_find():
    edge = [(10 + i * 20, 14 if i % 2 else 4) for i in range(17)] + [(330, 96)] + [(330 - i * 20, 100 if i % 2 else 92) for i in range(17)]
    return shadowed(f'<polygon points="{pts(edge)}"/>', WHITE) + label(170, 52, 'THRIFT FIND', 44, INK)


def lightning():
    bolt = '<polygon points="90,0 20,120 78,120 46,230 160,90 98,90 140,0"/>'
    spark = f'<g fill="{PINK}" stroke="{INK}" stroke-width="4">{star4(170, 170, 22)}</g>'
    return shadowed(bolt, YELLOW) + spark


def phone_flash():
    body = '<rect x="40" y="30" width="130" height="230" rx="22"/>'
    lens = (f'<circle cx="84" cy="80" r="24" fill="{INK}" stroke="{INK}" stroke-width="5"/>'
            f'<circle cx="84" cy="80" r="11" fill="{PINK}"/>')
    flash = shadowed(f'<polygon points="{pts(burst(170, 30, 46, 22, 8))}"/>', YELLOW, 4)
    return shadowed(body, WHITE) + lens + flash


def ready_badge():
    check = f'<path d="M66 104 l26 26 l52 -58" fill="none" stroke="{INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>'
    return (shadowed('<circle cx="105" cy="105" r="98"/>', YELLOW) + label(105, 48, 'READY', 34, INK)
            + check + label(105, 168, 'TO POST', 30, INK))


def worn_10():
    return shadowed('<rect x="0" y="0" width="380" height="100"/>', PINK_DEEP) + label(190, 52, 'WORN IN 10 SEC', 36, WHITE)


def sparkles(*stars):
    return f'<g fill="{WHITE}" stroke="{INK}" stroke-width="4">{"".join(star4(x, y, r) for x, y, r in stars)}</g>'


def place(draw, x, y, scale=1.0, rot=0):
    return f'<g transform="translate({x} {y}) rotate({rot}) scale({scale})">{draw()}</g>'


def canvas(w, h, parts):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{"".join(parts)}</svg>\n'


# Stickers: one file each, hung on buttons and headings by src/components/Sticker.tsx (animations in globals.css).
# (draw, width, height, offset) so the hard shadow and strokes stay inside the viewBox.
STICKERS = {
    'snap-it': (snap_it, 240, 240, (8, 8)), 'ready-to-post': (ready_badge, 232, 232, (8, 8)),
    'price-tag': (price_tag, 290, 175, (44, 10)), 'hanger-sweater': (hanger_sweater, 250, 300, (6, 6)),
    'yellow-sweater': (yellow_sweater, 250, 260, (6, 8)), 'thrift-find': (thrift_find, 360, 130, (6, 8)),
    'lightning': (lightning, 210, 250, (6, 6)), 'phone-flash': (phone_flash, 240, 290, (6, 14)),
    'worn-in-10-sec': (worn_10, 410, 130, (8, 8)),
}


def sticker(name):
    draw, w, h, (dx, dy) = STICKERS[name]
    return canvas(w, h, [f'<g transform="translate({dx} {dy})">{draw()}</g>'])


# Soft ground: flat pink with low-contrast tone-step motifs (no ink, no stickers) so the page stays calm.
LIGHT, DARK = '#ff62ab', '#f5449a'


def soft_motifs(w, h, seed):
    import random
    rnd = random.Random(seed)
    parts = [f'<rect width="{w}" height="{h}" fill="{PINK}"/>']
    for _ in range(w * h // 52000):
        x, y, kind = rnd.uniform(0, w), rnd.uniform(0, h), rnd.random()
        colour = LIGHT if rnd.random() < .6 else DARK
        if kind < .45:
            parts.append(f'<g fill="{colour}">{star4(round(x), round(y), rnd.randint(10, 22))}</g>')
        elif kind < .75:
            dots = ''.join(f'<circle cx="{x + i * 18:.0f}" cy="{y + j * 18:.0f}" r="3.5"/>' for i in range(4) for j in range(3))
            parts.append(f'<g fill="{colour}">{dots}</g>')
        else:
            zig = ' '.join(f'{x + i * 16:.0f},{y + (0 if i % 2 else 12):.0f}' for i in range(9))
            parts.append(f'<polyline points="{zig}" fill="none" stroke="{colour}" stroke-width="5" stroke-linejoin="round"/>')
    return canvas(w, h, parts)


if __name__ == '__main__':
    STICKER_OUT = OUT.parent / 'stickers'
    for folder in (OUT, STICKER_OUT):
        folder.mkdir(parents=True, exist_ok=True)
        for old in folder.glob('*.svg'):
            old.unlink()  # drop files that no longer exist
    files = {OUT / 'fond.svg': soft_motifs(1920, 1080, 7), OUT / 'fond-mobile.svg': soft_motifs(1080, 1920, 11)}
    files.update({STICKER_OUT / f'{name}.svg': sticker(name) for name in STICKERS})
    for path, data in files.items():
        xml.dom.minidom.parseString(data)  # self-check: every file is well-formed XML
        path.write_text(data)
        print(path.relative_to(OUT.parent.parent), len(data))
