import pymupdf
from pathlib import Path
from PIL import Image

src = Path(r'C:\Users\auzen\OneDrive\Documentos\Projeto Jairo Rocha\Jair260513(bookdigital_sopro).pdf')
out = Path(r'C:\Users\auzen\OneDrive\Documentos\Projeto Jairo Rocha\public\images\sopro')
out.mkdir(parents=True, exist_ok=True)

FRAME = (0.096, 0.099, 0.904, 0.90)
CROPS = {
    13: ('entrada', *FRAME),
    14: ('recepcao', *FRAME),
    15: ('hero', *FRAME),
    19: ('card', *FRAME),
    21: ('praia', *FRAME),
    23: ('home', 0.0, 0.105, 1.0, 0.90),
    24: ('restaurante', *FRAME),
    27: ('redario', *FRAME),
    34: ('quarto', *FRAME),
}

ZOOM = 2.4
MAX_WIDTH = 1920

doc = pymupdf.open(src)
matrix = pymupdf.Matrix(ZOOM, ZOOM)

for number, (name, x0, y0, x1, y1) in CROPS.items():
    page = doc[number - 1]
    rect = page.rect
    clip = pymupdf.Rect(rect.width * x0, rect.height * y0, rect.width * x1, rect.height * y1)
    pix = page.get_pixmap(matrix=matrix, clip=clip, alpha=False)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    if img.width > MAX_WIDTH:
        height = round(img.height * MAX_WIDTH / img.width)
        img = img.resize((MAX_WIDTH, height), Image.Resampling.LANCZOS)
    dest = out / f'{name}.webp'
    img.save(dest, 'WEBP', quality=82, method=6)
    print(f'p{number:02d} {name} {img.size[0]}x{img.size[1]} -> {dest.name}')
