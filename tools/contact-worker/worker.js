/* =====================================================================
   SNDR STUDIO — contact form → Telegram (Cloudflare Worker, free plan)

   The site posts JSON here (assets/js/contact.js). The Worker checks it
   again (origin, honeypot, fill time, proof-of-work, sizes, rate limit)
   and sends it to your Telegram chat through your bot. The bot token
   never reaches the browser.

   Secrets (set once, see README.md):
     TG_BOT_TOKEN   — from @BotFather
     TG_CHAT_ID     — your chat id (or a group / channel id)
   Variables (wrangler.toml):
     ALLOWED_ORIGIN — e.g. https://sndr-studio.github.io
     POW_BITS       — must match POW_BITS in contact.js
   ===================================================================== */

const MAX = { name: 120, email: 160, service: 60, message: 4000 };
const PROOF_TTL_MS = 10 * 60 * 1000;
const seen = new Map(); // proofs already used / requests per IP (per isolate)

const json = (body, status, origin) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  },
});

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const leadingZeroBits = (bytes) => {
  let bits = 0;
  for (const b of bytes) {
    if (b === 0) { bits += 8; continue; }
    bits += Math.clz32(b) - 24;
    break;
  }
  return bits;
};

async function validProof(proof, needBits) {
  if (!proof || typeof proof.challenge !== 'string' || !Number.isInteger(proof.nonce)) return false;
  const stamp = Number(proof.challenge.split(':')[0]);
  if (!stamp || Math.abs(Date.now() - stamp) > PROOF_TTL_MS) return false;
  if (seen.has(proof.challenge)) return false;
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${proof.challenge}:${proof.nonce}`)));
  return leadingZeroBits(hash) >= needBits;
}

function rateLimited(ip) {
  const now = Date.now();
  const key = `ip:${ip}`;
  const hits = (seen.get(key) || []).filter((t) => now - t < 10 * 60 * 1000);
  hits.push(now);
  seen.set(key, hits);
  return hits.length > 5; // max 5 messages per 10 minutes per IP
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || '*';
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return json({}, 204, allowed);
    if (request.method !== 'POST') return json({ ok: false }, 405, allowed);
    if (allowed !== '*' && origin !== allowed) return json({ ok: false, error: 'origin' }, 403, allowed);

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return json({ ok: false, error: 'json' }, 400, allowed);
    }

    // bots: honeypot filled or filled in no time -> pretend success, send nothing
    if (data.website || !(Number(data.elapsed) >= 4000)) return json({ ok: true }, 200, allowed);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (rateLimited(ip)) return json({ ok: false, error: 'rate' }, 429, allowed);
    if (!(await validProof(data.proof, Number(env.POW_BITS || 15)))) return json({ ok: false, error: 'proof' }, 400, allowed);
    seen.set(data.proof.challenge, Date.now());

    for (const [field, max] of Object.entries(MAX)) {
      if (typeof data[field] !== 'string' && field !== 'service') return json({ ok: false, error: field }, 400, allowed);
      if (String(data[field] || '').length > max) return json({ ok: false, error: field }, 400, allowed);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return json({ ok: false, error: 'email' }, 400, allowed);

    const text = [
      '<b>New message — SNDR STUDIO</b>',
      `<b>Name:</b> ${escapeHtml(data.name)}`,
      `<b>Email:</b> ${escapeHtml(data.email)}`,
      `<b>Service:</b> ${escapeHtml(data.service || '—')}`,
      '',
      escapeHtml(data.message),
    ].join('\n');

    const tg = await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!tg.ok) return json({ ok: false, error: 'telegram' }, 502, allowed);
    return json({ ok: true }, 200, allowed);
  },
};
