const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(express.json({ limit: "32kb" }));

function normalizeInput(str) {
  return (str || "").trim();
}

function cleanBase32(s) {
  return (s || "").replace(/[\s\-_]+/g, "").toUpperCase();
}

function base32ToBuffer(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const s = cleanBase32(base32).replace(/=+$/g, "");
  if (!s) return Buffer.alloc(0);

  let bits = 0;
  let value = 0;
  const out = [];

  for (let i = 0; i < s.length; i++) {
    const idx = alphabet.indexOf(s[i]);
    if (idx === -1) {
      throw new Error("Secret 不是有效的 Base32（包含非法字符）。");
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(out);
}

function intTo8ByteCounter(counter) {
  const buf = Buffer.alloc(8);
  const hi = Math.floor(counter / 0x100000000);
  const lo = counter >>> 0;
  buf.writeUInt32BE(hi >>> 0, 0);
  buf.writeUInt32BE(lo >>> 0, 4);
  return buf;
}

function dynamicTruncate(hmacBytes) {
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const p =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);
  return p >>> 0;
}

function totp(secretB32, digits, period, timeMs) {
  const keyBytes = base32ToBuffer(secretB32);
  if (keyBytes.length === 0) throw new Error("Secret 为空。");

  const counter = Math.floor(timeMs / 1000 / period);
  const msg = intTo8ByteCounter(counter);

  const mac = crypto.createHmac("sha1", keyBytes).update(msg).digest();
  const bin = dynamicTruncate(mac);
  const mod = 10 ** digits;
  const code = String(bin % mod).padStart(digits, "0");

  return { code, counter };
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/totp", (req, res) => {
  try {
    const secret = normalizeInput(req.body && req.body.secret);

    const digits = 6;
    const period = 30;
    const now = Date.now();

    const step = period * 1000;
    const remain = Math.ceil((step - (now % step)) / 1000);

    const cur = totp(secret, digits, period, now);

    res.json({
      code: cur.code,
      counter: cur.counter,
      remain,
      period
    });
  } catch (err) {
    res.status(400).json({
      error: String(err && err.message ? err.message : err)
    });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
