from pathlib import Path
from random import Random

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT = 1200, 630
NAVY = (10, 10, 20)
CARD_TOP = (30, 45, 77)
CARD_BOTTOM = (22, 33, 62)
GOLD = (226, 176, 74)
WHITE = (255, 255, 255)


def font(path, size):
    return ImageFont.truetype(str(path), size)


def centered_text(draw, y, text, text_font, fill, spacing=0):
    if not spacing:
        box = draw.textbbox((0, 0), text, font=text_font)
        x = (WIDTH - (box[2] - box[0])) / 2
        draw.text((x, y), text, font=text_font, fill=fill)
        return

    widths = [draw.textlength(char, font=text_font) for char in text]
    total = sum(widths) + spacing * max(0, len(text) - 1)
    x = (WIDTH - total) / 2
    for char, char_width in zip(text, widths):
        draw.text((x, y), char, font=text_font, fill=fill)
        x += char_width + spacing


def main():
    image = Image.new("RGB", (WIDTH, HEIGHT), NAVY)
    pixels = image.load()
    for y in range(HEIGHT):
        for x in range(WIDTH):
            distance = ((x - WIDTH / 2) ** 2 / (WIDTH / 1.35) ** 2 + (y - HEIGHT / 2) ** 2 / (HEIGHT / 1.1) ** 2)
            glow = max(0, 1 - distance) * 12
            pixels[x, y] = (int(8 + glow * 0.35), int(9 + glow * 0.55), int(18 + glow))

    draw = ImageDraw.Draw(image, "RGBA")
    random = Random(20260705)
    for _ in range(34):
        x = random.randint(30, WIDTH - 30)
        y = random.randint(20, HEIGHT - 20)
        radius = random.choice((1, 1, 2))
        alpha = random.randint(35, 95)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*GOLD, alpha))

    card_box = (340, 110, 860, 520)
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((325, 105, 875, 545), radius=18, fill=(0, 0, 0, 185))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    image = Image.alpha_composite(image.convert("RGBA"), shadow)

    card = Image.new("RGBA", image.size, (0, 0, 0, 0))
    card_pixels = card.load()
    for y in range(card_box[1], card_box[3] + 1):
        ratio = (y - card_box[1]) / (card_box[3] - card_box[1])
        color = tuple(int(a + (b - a) * ratio) for a, b in zip(CARD_TOP, CARD_BOTTOM))
        for x in range(card_box[0], card_box[2] + 1):
            card_pixels[x, y] = (*color, 255)
    mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(card_box, radius=14, fill=255)
    card.putalpha(mask)
    image = Image.alpha_composite(image, card)
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rounded_rectangle(card_box, radius=14, outline=(*GOLD, 150), width=2)
    draw.rounded_rectangle((352, 122, 848, 508), radius=10, outline=(*GOLD, 55), width=1)

    seal_center = (600, 205)
    draw.ellipse((553, 158, 647, 252), fill=(*GOLD, 255), outline=(245, 210, 125, 255), width=2)
    draw.ellipse((562, 167, 638, 243), fill=(196, 145, 48, 80))
    draw.polygon([(570, 198), (600, 183), (630, 198), (600, 213)], fill=(18, 28, 48, 255))
    draw.polygon([(580, 202), (600, 213), (620, 202), (617, 220), (600, 229), (583, 220)], fill=(18, 28, 48, 255))
    draw.line((630, 198, 630, 222), fill=(18, 28, 48, 255), width=3)
    draw.ellipse((626, 219, 634, 227), fill=(18, 28, 48, 255))

    segoe = Path(r"C:\Windows\Fonts\segoeui.ttf")
    segoe_bold = Path(r"C:\Windows\Fonts\segoeuib.ttf")
    name_font = font(segoe_bold, 36)
    event_font = font(segoe_bold, 17)
    detail_font = font(segoe, 18)

    centered_text(draw, 282, "QUÁCH NGỌC QUANG", name_font, WHITE, spacing=2)
    centered_text(draw, 342, "LỄ TỐT NGHIỆP", event_font, GOLD, spacing=5)
    draw.line((520, 387, 680, 387), fill=(*GOLD, 105), width=1)
    centered_text(draw, 405, "05  ·  07  ·  2026", detail_font, (255, 255, 255, 190), spacing=2)
    centered_text(draw, 448, "Hội trường Nguyễn Văn Đạo", detail_font, (255, 255, 255, 175), spacing=1)

    image.convert("RGB").save(ROOT / "preview.png", "PNG", optimize=True)


if __name__ == "__main__":
    main()
