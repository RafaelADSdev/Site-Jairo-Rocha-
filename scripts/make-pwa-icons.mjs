// Rasteriza os ícones do PWA a partir da marca (anel + ponto sobre o vermelho Jairo Rocha).
// Encoder PNG próprio para não depender de binários de navegador. Uso: node scripts/make-pwa-icons.mjs
import {mkdir, writeFile} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';

const OUT = 'public/icons';
const RED = [228, 20, 26];
const WHITE = [255, 255, 255];
const SS = 4; // amostras por eixo (antialiasing)

const crcTable = Array.from({length: 256}, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
};
const png = (size, rgba) => {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filtro none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// Cobertura por supersampling: para cada pixel testa SS x SS pontos.
const render = (size, {radius, scale}) => {
  const out = Buffer.alloc(size * size * 4);
  const u = size / 100; // unidades do viewBox 0..100
  const rr = radius * u;
  const ringOuter = (100 * scale / 2) * u;
  const ringInner = ringOuter - ringOuter * 0.29;
  const dot = ringOuter * 0.43;
  const cx = size / 2;
  const cy = size / 2;

  const insideRounded = (x, y) => {
    if (x < 0 || y < 0 || x > size || y > size) return false;
    const qx = Math.min(x, size - x);
    const qy = Math.min(y, size - y);
    if (qx >= rr || qy >= rr) return true;
    return (rr - qx) ** 2 + (rr - qy) ** 2 <= rr * rr;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bg = 0;
      let fg = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          if (!insideRounded(px, py)) continue;
          bg++;
          const d = Math.hypot(px - cx, py - cy);
          if (d <= dot || (d <= ringOuter && d >= ringInner)) fg++;
        }
      }
      const total = SS * SS;
      const i = (y * size + x) * 4;
      if (!bg) continue;
      const alpha = bg / total;
      const mix = fg / bg;
      for (let c = 0; c < 3; c++) out[i + c] = Math.round(RED[c] * (1 - mix) + WHITE[c] * mix);
      out[i + 3] = Math.round(alpha * 255);
    }
  }
  return png(size, out);
};

const svg = (radius, scale) => {
  const r = 100 * scale / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="${radius}" fill="#e4141a"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="#fff" stroke-width="${(r * 0.29).toFixed(2)}"/><circle cx="50" cy="50" r="${(r * 0.43).toFixed(2)}" fill="#fff"/></svg>\n`;
};

// Maskable é full-bleed e usa marca menor para caber na safe zone circular (80%).
const targets = [
  {file: 'icon-192.png', size: 192, radius: 22, scale: 0.68},
  {file: 'icon-512.png', size: 512, radius: 22, scale: 0.68},
  {file: 'icon-maskable-192.png', size: 192, radius: 0, scale: 0.56},
  {file: 'icon-maskable-512.png', size: 512, radius: 0, scale: 0.56},
  {file: 'apple-touch-icon.png', size: 180, radius: 0, scale: 0.66},
];

await mkdir(OUT, {recursive: true});
for (const t of targets) {
  await writeFile(`${OUT}/${t.file}`, render(t.size, t));
  console.log('ok', t.file);
}
await writeFile(`${OUT}/icon.svg`, svg(22, 0.68));
console.log('ok icon.svg');
