"""
Generates a VoteSecure favicon set (shield + checkmark, matching the
Navbar logo's brand-blue gradient) as PNGs + a multi-size .ico, plus a
scalable favicon.svg. Run once at build time — output goes to public/.
"""
from PIL import Image, ImageDraw
import math

OUT_DIR = "public"


def rounded_square_gradient(size, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(size * radius_ratio)

    # Diagonal blue gradient background (brand-500 -> brand-700)
    top = (0x2E, 0x63, 0xFF)
    bottom = (0x17, 0x30, 0xAB)
    grad = Image.new("RGB", (size, size), top)
    gpix = grad.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            r = int(top[0] + (bottom[0] - top[0]) * t)
            g = int(top[1] + (bottom[1] - top[1]) * t)
            b = int(top[2] + (bottom[2] - top[2]) * t)
            gpix[x, y] = (r, g, b)

    mask = Image.new("L", (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    img.paste(grad, (0, 0), mask)
    return img, draw


def draw_shield_check(size):
    img, _ = rounded_square_gradient(size)
    draw = ImageDraw.Draw(img)

    cx, cy = size / 2, size / 2
    s = size * 0.52  # shield half-width-ish scale

    # Simple shield outline (pointed bottom), drawn as a polygon
    shield_pts = [
        (cx, cy - s * 0.62),
        (cx + s * 0.5, cy - s * 0.38),
        (cx + s * 0.5, cy + s * 0.05),
        (cx, cy + s * 0.68),
        (cx - s * 0.5, cy + s * 0.05),
        (cx - s * 0.5, cy - s * 0.38),
    ]
    line_w = max(1, round(size * 0.045))
    draw.line(shield_pts + [shield_pts[0]], fill="white", width=line_w, joint="curve")

    # Checkmark
    check_w = max(1, round(size * 0.06))
    p1 = (cx - s * 0.24, cy + s * 0.02)
    p2 = (cx - s * 0.04, cy + s * 0.22)
    p3 = (cx + s * 0.30, cy - s * 0.20)
    draw.line([p1, p2], fill="white", width=check_w, joint="curve")
    draw.line([p2, p3], fill="white", width=check_w, joint="curve")

    return img


def main():
    sizes = [16, 32, 48, 180, 192, 512]
    imgs = {s: draw_shield_check(s) for s in sizes}

    imgs[180].save(f"{OUT_DIR}/apple-touch-icon.png")
    imgs[192].save(f"{OUT_DIR}/logo192.png")
    imgs[512].save(f"{OUT_DIR}/logo512.png")

    # Multi-resolution .ico (16/32/48) for classic browser tab support
    imgs[48].save(
        f"{OUT_DIR}/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    print("Favicon set written to", OUT_DIR)


if __name__ == "__main__":
    main()
