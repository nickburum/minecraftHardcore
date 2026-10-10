#!/usr/bin/env python3
"""Build the server-list icons (64x64 server-icon.png) and preview images.

Uses textures and the font from a Minecraft client jar:

    python3 tools/make_server_icons.py path/to/client.jar

Writes server/<name>/server-icon.png, preview.png and motd.properties for the
hardcore and creative servers. The MOTD text is read from server/<name>/motd.txt.
"""
import io
import json
import math
import sys
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SERVERS = {"hardcore": "Hardcore", "creative": "Creative"}

COLORS = {  # Minecraft § color codes
    "0": (0, 0, 0), "1": (0, 0, 170), "2": (0, 170, 0), "3": (0, 170, 170),
    "4": (170, 0, 0), "5": (170, 0, 170), "6": (255, 170, 0), "7": (170, 170, 170),
    "8": (85, 85, 85), "9": (85, 85, 255), "a": (85, 255, 85), "b": (85, 255, 255),
    "c": (255, 85, 85), "d": (255, 85, 255), "e": (255, 255, 85), "f": (255, 255, 255),
}


class Jar:
    def __init__(self, path):
        self.zip = zipfile.ZipFile(path)

    def image(self, name):
        return Image.open(io.BytesIO(self.zip.read("assets/minecraft/textures/" + name))).convert("RGBA")

    def json(self, name):
        return json.loads(self.zip.read("assets/minecraft/" + name))


def nearest(img, scale):
    return img.resize((img.width * scale, img.height * scale), Image.NEAREST)


def tint(img, rgb):
    r, g, b = rgb
    px = img.load()
    out = img.copy()
    o = out.load()
    for y in range(img.height):
        for x in range(img.width):
            pr, pg, pb, pa = px[x, y]
            o[x, y] = (pr * r // 255, pg * g // 255, pb * b // 255, pa)
    return out


def shade(img, f):
    return tint(img, (int(255 * f),) * 3)


# ---------------------------------------------------------------- icons

def radial(size, inner, outer, center=None, radius=None):
    cx, cy = center or (size / 2, size / 2)
    radius = radius or size * 0.72
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = min(1.0, math.hypot(x + 0.5 - cx, y + 0.5 - cy) / radius)
            px[x, y] = tuple(int(inner[i] + (outer[i] - inner[i]) * t) for i in range(3)) + (255,)
    return img


def tiled(tex, size):
    img = Image.new("RGBA", (size, size))
    for y in range(0, size, tex.height):
        for x in range(0, size, tex.width):
            img.paste(tex, (x, y))
    return img


def outline(sprite, color, width=1):
    """Pixel outline around the opaque part of a sprite."""
    a = sprite.getchannel("A").point(lambda v: 255 if v > 0 else 0)
    grown = a.filter(ImageFilter.MaxFilter(width * 2 + 1))
    out = Image.new("RGBA", sprite.size, color + (0,))
    out.putalpha(grown)
    out.alpha_composite(sprite)
    return out


def hardcore_icon(jar):
    size = 64
    # Dark netherrack floor fading into a blood-red glow behind the heart.
    floor = shade(tiled(jar.image("block/netherrack.png"), size), 0.28)
    glow = radial(size, (150, 10, 10), (20, 0, 0), center=(32, 30), radius=34)
    glow.putalpha(200)
    icon = floor
    icon.alpha_composite(glow)

    heart = jar.image("gui/sprites/hud/heart/container_hardcore.png")
    heart.alpha_composite(jar.image("gui/sprites/hud/heart/hardcore_full.png"))
    heart = outline(nearest(heart, 5), (10, 0, 0))
    icon.alpha_composite(heart, ((size - heart.width) // 2, 4))

    # The Elixir of Life, glowing, in the corner.
    bottle = jar.image("item/honey_bottle.png")
    halo = Image.new("RGBA", (24, 24))
    ImageDraw.Draw(halo).ellipse((2, 2, 21, 21), fill=(255, 200, 60, 150))
    halo = halo.filter(ImageFilter.GaussianBlur(3))
    icon.alpha_composite(halo, (40, 40))
    icon.alpha_composite(outline(nearest(bottle, 1), (30, 15, 0)), (44, 44))
    return icon


def iso_cube(top, left, right, w):
    """Draw an isometric cube from three 16x16 face textures. Returns RGBA w x ~w."""
    h = int(w * 0.58)
    img = Image.new("RGBA", (w + 1, w // 2 + h + 1))
    px = img.load()
    cx = w / 2
    faces = [
        # origin, edge u, edge v, texture
        ((cx, 0), (w / 2, w / 4), (-w / 2, w / 4), top),
        ((0, w / 4), (w / 2, w / 4), (0, h), left),
        ((cx, w / 2), (w / 2, -w / 4), (0, h), right),
    ]
    for (ox, oy), (ux, uy), (vx, vy), tex in faces:
        tp = tex.load()
        det = ux * vy - uy * vx
        for y in range(img.height):
            for x in range(img.width):
                dx, dy = x + 0.5 - ox, y + 0.5 - oy
                u = (dx * vy - dy * vx) / det
                v = (ux * dy - uy * dx) / det
                if 0 <= u < 1 and 0 <= v < 1:
                    c = tp[int(u * tex.width), int(v * tex.height)]
                    if c[3]:
                        px[x, y] = c
    return img


def creative_icon(jar):
    size = 64
    sky = Image.new("RGBA", (size, size))
    d = ImageDraw.Draw(sky)
    for y in range(size):
        t = y / size
        d.line((0, y, size, y), fill=(int(70 + 80 * t), int(140 + 70 * t), int(230 + 20 * t), 255))
    icon = sky

    grass = (124, 189, 107)
    top = tint(jar.image("block/grass_block_top.png"), grass)
    side = jar.image("block/grass_block_side.png")
    side.alpha_composite(tint(jar.image("block/grass_block_side_overlay.png"), grass))
    cube = iso_cube(shade(top, 1.0), shade(side, 0.82), shade(side, 0.62), 44)
    shadow = Image.new("RGBA", (size, size))
    ImageDraw.Draw(shadow).ellipse((12, 50, 52, 60), fill=(20, 40, 90, 110))
    icon.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(2)))
    icon.alpha_composite(cube, ((size - cube.width) // 2, 8))

    # Sparkles: build anything.
    def star(x, y, r, color):
        dd = ImageDraw.Draw(icon)
        dd.line((x - r, y, x + r, y), fill=color)
        dd.line((x, y - r, x, y + r), fill=color)
        dd.point((x, y), fill=(255, 255, 255, 255))
    star(8, 9, 3, (255, 255, 200, 255))
    star(55, 14, 2, (255, 255, 255, 255))
    star(54, 44, 3, (255, 240, 150, 255))
    star(9, 40, 2, (255, 255, 255, 255))
    return icon


# ---------------------------------------------------------------- preview

class Font:
    """Minecraft's bitmap font (ascii.png plus nonlatin_european.png)."""

    def __init__(self, jar):
        self.glyphs = {}
        for p in jar.json("font/include/default.json")["providers"]:
            if p["type"] != "bitmap":
                continue
            sheet = jar.image(p["file"].split(":", 1)[1])
            rows = p["chars"]
            cw, ch = sheet.width // len(rows[0]), sheet.height // len(rows)
            for r, row in enumerate(rows):
                for c, char in enumerate(row):
                    if char == "\0" or char in self.glyphs:
                        continue
                    g = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
                    box = g.getchannel("A").getbbox()
                    width = box[2] if box else 3
                    self.glyphs[char] = (g, width, p.get("ascent", 7), p.get("height", 8))

    def draw(self, img, x, y, text, scale):
        """Draws a string with § color codes and Minecraft's drop shadow."""
        color, bold = COLORS["f"], False
        it = iter(text)
        for ch in it:
            if ch == "§":
                code = next(it, "r").lower()
                if code in COLORS:
                    color, bold = COLORS[code], False
                elif code == "l":
                    bold = True
                elif code == "r":
                    color, bold = COLORS["7"], False
                continue
            if ch == " ":
                x += 4 * scale
                continue
            g, w, ascent, height = self.glyphs.get(ch, self.glyphs["?"])
            gy = y + (7 - ascent) * scale
            for dx, col in ((scale, tuple(v // 4 for v in color)), (0, color)):
                glyph = nearest(tint(g, col), scale)
                img.alpha_composite(glyph, (x + dx, gy + dx))
                if bold:
                    img.alpha_composite(glyph, (x + dx + scale, gy + dx))
            x += (w + 1 + (1 if bold else 0)) * scale
        return x

    def width(self, text):
        w, bold, it = 0, False, iter(text)
        for ch in it:
            if ch == "§":
                code = next(it, "r").lower()
                bold = code == "l" or (bold and code not in COLORS and code != "r")
                continue
            w += 4 if ch == " " else self.glyphs.get(ch, self.glyphs["?"])[1] + 1 + (1 if bold else 0)
        return w


def preview(jar, font, icon, name, motd_lines, players):
    """One row of the multiplayer server list, laid out like the game does it:
    32px icon, text starting 35px in, 305px row, MOTD wrapped at 271px."""
    s, pad = 3, 6  # GUI scale, border around the row
    w, h = (305 + pad * 2) * s, (32 + pad * 2) * s
    img = Image.new("RGBA", (w, h), (24, 24, 28, 255))
    d = ImageDraw.Draw(img)
    d.rectangle((s, s, w - s - 1, h - s - 1), outline=(128, 128, 128, 255), width=s)
    x0, y0 = pad * s, pad * s
    img.alpha_composite(icon.resize((32 * s, 32 * s), Image.NEAREST), (x0, y0))
    font.draw(img, x0 + 35 * s, y0 + 1 * s, "§f" + name, s)
    for i, line in enumerate(motd_lines[:2]):
        font.draw(img, x0 + 35 * s, y0 + (12 + 9 * i) * s, "§7" + line, s)
    count = f"§7{players}"
    ping = nearest(jar.image("gui/sprites/server_list/ping_5.png"), s)
    right = x0 + 305 * s
    img.alpha_composite(ping, (right - 15 * s, y0))
    font.draw(img, right - 17 * s - font.width(count) * s, y0 + 1 * s, count, s)
    return img


def motd_lines(name):
    lines = (ROOT / "server" / name / "motd.txt").read_text(encoding="utf-8").splitlines()
    return [l for l in lines if l and not l.startswith("#")]


def properties_line(lines):
    """The motd= line for server.properties, with non-ASCII escaped as \\uXXXX
    so it shows correctly however the server reads the file."""
    text = "\n".join(lines[:2])
    out = "".join(c if 32 <= ord(c) < 127 else ("\\n" if c == "\n" else f"\\u{ord(c):04X}") for c in text)
    return "motd=" + out


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    jar = Jar(sys.argv[1])
    font = Font(jar)
    for name, title in SERVERS.items():
        out = ROOT / "server" / name
        icon = hardcore_icon(jar) if name == "hardcore" else creative_icon(jar)
        icon.save(out / "server-icon.png")
        lines = motd_lines(name)
        for line in lines:
            if font.width(line) > 271:
                print(f"warning: {name} MOTD line is {font.width(line)}px wide, over the 271px that fits: {line}")
        preview(jar, font, icon, f"{title} Server", lines, "3/20").save(out / "preview.png")
        (out / "motd.properties").write_text(
            "# Replace the motd= line in server.properties with this one.\n" + properties_line(lines) + "\n")
        print(f"wrote server/{name}/server-icon.png, preview.png and motd.properties")


if __name__ == "__main__":
    main()
