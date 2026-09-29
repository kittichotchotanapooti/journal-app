// App icon generator: warm radial glow behind a crescent + spark mark,
// matching the app's dusk-paper palette. No dependencies — hand-writes a
// PNG (IHDR/IDAT/IEND) so this runs on plain Node, no canvas lib needed.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const GLOW = [0xE3, 0xA9, 0x4E];  // warm gold, center glow
const EDGE = [0x22, 0x1A, 0x2C];  // deep dusk plum, corners
const MARK = [0xF6, 0xEE, 0xE1];  // warm cream, crescent + spark

function crc32(buf) {
  let c, table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function lerp(a, b, t) { return a + (b - a) * t; }
function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]; }
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

function makeIcon(size) {
  // crescent: big disc minus an offset disc, opening toward upper-right
  const cx1 = size * 0.44, cy1 = size * 0.52, r1 = size * 0.27;
  const cx2 = size * 0.565, cy2 = size * 0.425, r2 = size * 0.245;
  // small four-point spark above the crescent's tip
  const sx = size * 0.72, sy = size * 0.26;
  const sparkR = size * 0.10, sparkArm = size * 0.028;
  // glow center sits slightly above true center, echoing the spark
  const gx = size * 0.5, gy = size * 0.44;
  const glowRadius = size * 0.62;

  const raw = Buffer.alloc((size * 3 + 1) * size);
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const dGlow = Math.hypot(x - gx, y - gy) / glowRadius;
      let color = mix(GLOW, EDGE, clamp01(dGlow));

      const d1 = Math.hypot(x - cx1, y - cy1);
      const d2 = Math.hypot(x - cx2, y - cy2);
      const inCrescent = d1 <= r1 && d2 > r2;

      const dxs = Math.abs(x - sx), dys = Math.abs(y - sy);
      const inSparkArm = (dxs < sparkArm && dys < sparkR) || (dys < sparkArm && dxs < sparkR);
      const inSparkCore = Math.hypot(x - sx, y - sy) < sparkArm * 1.6;

      if (inCrescent || inSparkArm || inSparkCore) color = MARK;

      raw[p++] = Math.round(color[0]);
      raw[p++] = Math.round(color[1]);
      raw[p++] = Math.round(color[2]);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, 'icons');
fs.mkdirSync(outDir, { recursive: true });
for (const size of [180, 192, 512]) {
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), makeIcon(size));
  console.log('wrote icon-' + size + '.png');
}
