from PIL import Image, ImageDraw

PRIMARY = (83, 74, 183)      # #534AB7
PRIMARY_DK = (68, 60, 153)   # darker shade
TEAL = (29, 158, 117)        # #1D9E75
WHITE = (255, 255, 255)

def make_icon(size, maskable=False):
    pad = int(size*0.14) if maskable else 0
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    d = ImageDraw.Draw(img)
    r = int(size*0.22)
    box = [pad, pad, size-pad, size-pad]
    # rounded square gradient-ish bg (flat primary, simple)
    d.rounded_rectangle(box, radius=r, fill=PRIMARY_DK)
    inner = size - 2*pad
    cx, cy = size/2, size/2
    # two diagonal offset bars (mark)
    bar_w = inner*0.14
    bar_len = inner*0.62
    import math
    angle = -45
    def diag_bar(offset_x, offset_y, length, color):
        x0 = cx - length/2 + offset_x
        y0 = cy - length/2 + offset_y
        x1 = cx + length/2 + offset_x
        y1 = cy + length/2 + offset_y
        d.line([x0,y0,x1,y1], fill=color, width=int(bar_w))
    diag_bar(-inner*0.14, -inner*0.14, bar_len*0.85, WHITE)
    diag_bar(inner*0.14, inner*0.16, bar_len*0.6, TEAL)
    # small dot accent
    dot_r = inner*0.05
    d.ellipse([cx+inner*0.22-dot_r, cy-inner*0.30-dot_r, cx+inner*0.22+dot_r, cy-inner*0.30+dot_r], fill=WHITE)
    return img

for size in [192, 512]:
    make_icon(size).save(f"/home/claude/pgnearme/icons/icon-{size}.png")

make_icon(512, maskable=True).save("/home/claude/pgnearme/icons/icon-maskable-512.png")

# favicon
fav = make_icon(64)
fav.save("/home/claude/pgnearme/icons/favicon.png")
fav.resize((32,32)).save("/home/claude/pgnearme/icons/favicon-32.png")
print("done")
