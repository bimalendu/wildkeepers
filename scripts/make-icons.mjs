// Generates placeholder PWA icons (a green hex with a leaf on dark forest) without any image dependencies.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const crcTable = Array.from({ length: 256 }, (_, n) => {
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
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x / size, y / size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const inHex = (u, v, r) => {
  const x = Math.abs(u - 0.5), y = Math.abs(v - 0.5);
  return y <= r * 0.866 && x * 0.866 + y * 0.5 <= r * 0.866;
};
const inLeaf = (u, v) => {
  const a = (u - 0.5 + (v - 0.5)) / Math.SQRT2, b = (u - 0.5 - (v - 0.5)) / Math.SQRT2;
  return Math.abs(a) <= 0.28 && Math.abs(b) <= 0.16 * (1 - (a / 0.28) ** 2);
};
const pixel = (u, v) => {
  if (inLeaf(u, v)) return [235, 247, 220];
  if (inHex(u, v, 0.4)) return [64, 160, 96];
  if (inHex(u, v, 0.46)) return [30, 90, 56];
  return [16, 38, 28];
};
mkdirSync('public/icons', { recursive: true });
for (const s of [192, 512]) writeFileSync(`public/icons/icon-${s}.png`, png(s, pixel));
console.log('icons written');
