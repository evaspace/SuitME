"""Draw the neo-brutalist pink page background with its stickers as SVG into public/backdrop/.

side-left/side-right.svg fill the gutters beside the content on wide screens; band.svg (desktop) and
band-mobile.svg (phone) sit at the bottom of the viewport, so headings at the top stay readable. Same approach as epitadoomscrolling tools/gen_neo_stickers.py.

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


# Transparent layers over the flat pink body: side strips live in the gutters beside the 72rem content column
# (wide screens only), the bands sit at the bottom of the viewport. See the body rule in app/globals.css.
def side_left():
    return canvas(260, 1080, [place(hanger_sweater, 10, 120, 0.95, -8), place(lightning, 40, 470, 0.9, -12),
                              sparkles((200, 60, 24), (210, 420, 18), (60, 760, 20))])


def side_right():
    return canvas(260, 1080, [place(snap_it, 20, 90, 1.0, 10), place(price_tag, 40, 430, 0.85, 12),
                              sparkles((40, 60, 18), (220, 380, 22), (200, 720, 20))])


def band():
    return canvas(1800, 360, [place(yellow_sweater, 40, 70, 0.95, 12), place(thrift_find, 360, 200, 0.95, -6),
                              place(ready_badge, 820, 110, 1.0, -10), place(phone_flash, 1150, 60, 0.95, 8),
                              place(worn_10, 1380, 210, 1.0, -4),
                              sparkles((330, 90, 26), (760, 60, 20), (1080, 300, 22), (1460, 110, 26), (1760, 60, 18))])


def band_mobile():
    return canvas(1080, 560, [place(yellow_sweater, 10, 220, 1.0, -10), place(ready_badge, 380, 290, 1.05, 8),
                              place(price_tag, 700, 120, 1.05, -12), place(snap_it, 820, 330, 0.95, 12),
                              sparkles((300, 200, 30), (650, 80, 24), (720, 500, 22))])


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for name in OUT.glob('*.svg'):
        name.unlink()  # drop layers that no longer exist
    for name, draw in (('side-left.svg', side_left), ('side-right.svg', side_right), ('band.svg', band), ('band-mobile.svg', band_mobile)):
        data = draw()
        xml.dom.minidom.parseString(data)  # self-check: every file is well-formed XML
        (OUT / name).write_text(data)
        print(name, len(data))
