"""Generate the app icons: Serenity's face (mint fur, bunny ears, glitter-blue eyes, the closed Labubu grin
with her green tooth) on a snowy blue background.
Pure Python, no dependencies: python tools/make_icons.py
"""
import math, struct, zlib, os


def png(path, w, h, rows):
    raw = b''.join(b'\x00' + bytes(r) for r in rows)
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(data)


def ell(px, py, cx, cy, rx, ry, rot=0.0):
    """inside a (rotated) ellipse?"""
    dx, dy = px - cx, py - cy
    if rot:
        c, s = math.cos(-rot), math.sin(-rot)
        dx, dy = dx * c - dy * s, dx * s + dy * c
    return (dx / rx) ** 2 + (dy / ry) ** 2 <= 1


def ear(px, py, bx, by, w, h, rot):
    """tall bunny ear with a pointed tip: base at (bx, by), pointing up, tilted by rot"""
    dx, dy = px - bx, py - by
    c, s = math.cos(-rot), math.sin(-rot)
    dx, dy = dx * c - dy * s, dx * s + dy * c
    if dy > 0 or dy < -h:
        return False
    t = -dy / h                       # 0 at base, 1 at tip
    half = w / 2 * math.sin(math.pi * min(1, t * 1.15 + .05)) * (1 - .55 * t * t)
    return abs(dx) <= half


def mouth_bands(x):
    """the crescent smile: top and bottom curves (unit coords, face centred at 0)"""
    t = (x + .30) / .60
    top = .30 + 2 * t * (1 - t) * .07
    bot = .30 + 2 * t * (1 - t) * .23
    return top, bot


def color_at(u, v):
    """u, v in [-1, 1] across the icon; returns (r, g, b) or None for the background"""
    MINT, LIGHT, DARK, FACE, INNER = (143, 220, 182), (201, 244, 222), (95, 185, 148), (220, 249, 234), (255, 194, 214)
    # ears
    for side in (-1, 1):
        if ear(u, v, side * .30, -.30, .40, .78, side * .22):
            inner = ear(u, v, side * .30, -.36, .20, .60, side * .22)
            return INNER if inner else MINT
    # head (fur with soft shading), face patch
    if ell(u, v, 0, .12, .80, .70):
        col = MINT
        if ell(u, v, -.2, -.1, .5, .4):
            col = tuple((a + b) // 2 for a, b in zip(MINT, LIGHT))
        if not ell(u, v, 0, .12, .74, .64):
            col = DARK
        if ell(u, v, 0, .20, .60, .50):
            col = FACE
        # eyes
        for ex in (-.26, .26):
            if ell(u, v, ex, .05, .19, .22):
                col = (255, 255, 255)
                if ell(u, v, ex + .02, .07, .14, .14):
                    col = (110, 190, 240) if v < .07 else (61, 143, 209)
                if ell(u, v, ex + .03, .08, .07, .07):
                    col = (29, 26, 42)
                if ell(u, v, ex - .03, .0, .045, .045):
                    col = (255, 255, 255)
        # nose
        if ell(u, v, 0, .24, .07, .045):
            col = (47, 191, 113)
        # blush
        for bx in (-.50, .50):
            if ell(u, v, bx, .33, .10, .055) and col == FACE:
                col = (255, 186, 205)
        # closed grin with teeth and the green tooth
        if -.30 <= u <= .30:
            top, bot = mouth_bands(u)
            if top - .02 <= v <= bot + .02:
                col = (91, 43, 61)
                if top + .005 <= v <= bot - .005:
                    k = (u + .30) / .06          # zigzag: 10 segments across
                    seg, f = int(k), k - int(k)
                    a = top if seg % 2 == 0 else bot
                    b = bot if seg % 2 == 0 else top
                    zig = a + (b - a) * f
                    col = (255, 250, 242)
                    if abs(v - zig) < .012:
                        col = (91, 43, 61)
                    elif seg in (6, 7) and v < zig:
                        col = (63, 209, 127)  # Serenity's glistening green tooth
        return col
    return None


def render(size, maskable):
    S = 3  # supersampling
    pad = .16 if maskable else .06
    rad = .22
    rows = []
    for y in range(size):
        row = []
        for x in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(S):
                for sx in range(S):
                    fx, fy = (x + (sx + .5) / S) / size, (y + (sy + .5) / S) / size
                    if not maskable:
                        dx = max(rad - fx, fx - (1 - rad), 0); dy = max(rad - fy, fy - (1 - rad), 0)
                        if dx * dx + dy * dy > rad * rad:
                            continue
                    # background: snowy sky, with snow drifting at the bottom
                    col = (int(170 + 60 * fy), int(214 + 30 * fy), int(245 + 8 * fy))
                    if fy > .86 + .03 * math.sin(fx * 9):
                        col = (255, 255, 255)
                    for (cx, cy, r) in ((.12, .18, .018), (.85, .12, .014), (.9, .55, .016), (.08, .62, .013), (.22, .9, .0)):
                        if r and (fx - cx) ** 2 + (fy - cy) ** 2 < r * r:
                            col = (255, 255, 255)
                    u = (fx - .5) / (.5 - pad) * 1.0
                    v = (fy - .52) / (.5 - pad) * 1.0
                    c = color_at(u, v)
                    if c:
                        col = c
                    acc[0] += col[0]; acc[1] += col[1]; acc[2] += col[2]; acc[3] += 255
            n = S * S
            a = acc[3] // n
            if a:
                k = acc[3] / 255
                row += [int(acc[0] / k), int(acc[1] / k), int(acc[2] / k), a]
            else:
                row += [0, 0, 0, 0]
        rows.append(row)
    return rows


out = os.path.join(os.path.dirname(__file__), '..', 'icons')
os.makedirs(out, exist_ok=True)
for size, mask, name in [(192, False, 'icon-192.png'), (512, False, 'icon-512.png'), (512, True, 'icon-maskable-512.png'), (180, True, 'apple-touch-icon.png'), (32, False, 'favicon-32.png')]:
    png(os.path.join(out, name), size, size, render(size, mask))
    print('wrote', name)
