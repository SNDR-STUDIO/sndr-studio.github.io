/* =====================================================================
   SNDR STUDIO — contact form + protected social links

   HUMAN CHECK (no third-party captcha, no cookies):
     1) honeypot field and a minimum time on the page (bots submit at once);
     2) a drag puzzle: pull the drop into the ring at a random spot; the
        pointer path must look human (duration, number of samples, uneven
        speed, a little vertical wobble). Keyboard: arrows move the drop;
     3) proof-of-work: the browser searches a SHA-256 hash with POW_BITS
        leading zero bits (~1 s for a person, expensive for a spam farm).
        The Cloudflare Worker (tools/contact-worker) verifies it again.

   The same check guards the Telegram / Instagram links: their URLs are
   not in the HTML (scrapers find nothing), they open only after the check.

   Delivery: the form posts to CONTACT.endpoint (the Worker), which sends
   the message to Telegram. While the endpoint is empty the form says so.
   Styles: neon.css → HUMAN CHECK.
   ===================================================================== */
(function () {
  'use strict';

  const CONTACT = {
    // Cloudflare Worker URL, e.g. 'https://sndr-contact.<you>.workers.dev'
    endpoint: '',
    // social links, stored reversed + base64 so they are not plain text:
    // in the browser console run  btoa('https://t.me/yourname'.split('').reverse().join(''))
    links: {
      telegram: '',
      instagram: '',
    },
  };
  const POW_BITS = 15;
  const T = (s) => (window.sndrT ? window.sndrT(s) : s); // i18n.js
  const MIN_FILL_MS = 4000;

  const decode = (s) => {
    try { return atob(s).split('').reverse().join(''); } catch (e) { return ''; }
  };

  /* ---------------- proof-of-work ---------------- */
  const sha256 = async (text) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  const leadingZeroBits = (bytes) => {
    let bits = 0;
    for (const b of bytes) {
      if (b === 0) { bits += 8; continue; }
      bits += Math.clz32(b) - 24;
      break;
    }
    return bits;
  };
  const solvePow = async (onProgress) => {
    const rnd = crypto.getRandomValues(new Uint32Array(2));
    const challenge = `${Date.now()}:${rnd[0].toString(36)}${rnd[1].toString(36)}`;
    for (let nonce = 0; ; nonce++) {
      if (leadingZeroBits(await sha256(`${challenge}:${nonce}`)) >= POW_BITS) return { challenge, nonce, bits: POW_BITS };
      if (nonce % 2000 === 0) onProgress(nonce);
    }
  };

  /* ---------------- the check dialog ---------------- */
  const dialog = document.createElement('div');
  dialog.className = 'human-check';
  dialog.hidden = true;
  dialog.innerHTML = `
    <div class="human-check__panel" role="dialog" aria-modal="true" aria-labelledby="hc-title">
      <button type="button" class="human-check__close" aria-label="Close"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
      <p class="human-check__kicker">Quick check</p>
      <h3 id="hc-title">Drag the drop into the ring</h3>
      <div class="human-check__track">
        <span class="human-check__ring" aria-hidden="true"></span>
        <button type="button" class="human-check__drop" role="slider" aria-label="Drop position"
                aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></button>
      </div>
      <p class="human-check__hint">Use the mouse or finger — or the arrow keys.</p>
      <div class="human-check__bar" aria-hidden="true"><span></span></div>
      <p class="human-check__status" role="status" aria-live="polite"></p>
    </div>`;
  document.body.appendChild(dialog);

  const track = dialog.querySelector('.human-check__track');
  const drop = dialog.querySelector('.human-check__drop');
  const ring = dialog.querySelector('.human-check__ring');
  const bar = dialog.querySelector('.human-check__bar span');
  const statusEl = dialog.querySelector('.human-check__status');
  const closeBtn = dialog.querySelector('.human-check__close');

  let pending = null;   // { resolve, reject }
  let target = 0;       // ring centre, px from the track start
  let x = 0;            // drop position
  let samples = [];
  let keySteps = [];
  let busy = false;
  let lastFocus = null;

  const maxX = () => track.clientWidth - drop.offsetWidth;
  const setX = (v) => {
    x = Math.min(Math.max(v, 0), maxX());
    drop.style.transform = `translateX(${x}px)`;
    drop.setAttribute('aria-valuenow', String(Math.round((x / maxX()) * 100)));
  };

  const reset = (msg) => {
    samples = [];
    keySteps = [];
    busy = false;
    bar.style.width = '0';
    dialog.classList.remove('is-solving', 'is-done');
    target = maxX() * (0.45 + Math.random() * 0.5);
    ring.style.transform = `translateX(${target}px)`;
    setX(0);
    statusEl.textContent = msg ? T(msg) : '';
  };

  // does the drag look like a hand? (bots move in straight, even jumps)
  const humanPath = () => {
    if (keySteps.length >= 8) {
      const span = keySteps[keySteps.length - 1] - keySteps[0];
      return span > 600;
    }
    if (samples.length < 12) return false;
    const dur = samples[samples.length - 1].t - samples[0].t;
    if (dur < 350) return false;
    const speeds = [];
    let wobble = 0;
    for (let i = 1; i < samples.length; i++) {
      const dt = samples[i].t - samples[i - 1].t || 1;
      speeds.push(Math.abs(samples[i].x - samples[i - 1].x) / dt);
      wobble += Math.abs(samples[i].y - samples[i - 1].y);
    }
    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const sd = Math.sqrt(speeds.reduce((a, b) => a + (b - mean) ** 2, 0) / speeds.length);
    return sd / (mean || 1) > 0.25 && wobble > 0;
  };

  const finish = async () => {
    if (busy) return;
    const hit = Math.abs(x - target) <= 7;
    if (!hit || !humanPath()) {
      reset(hit ? 'That looked a bit robotic — try again, slowly.' : 'Almost — drop it right inside the ring.');
      return;
    }
    busy = true;
    dialog.classList.add('is-solving');
    statusEl.textContent = T('Verifying…');
    const expected = Math.pow(2, POW_BITS);
    const proof = await solvePow((n) => { bar.style.width = `${Math.min(95, (n / expected) * 100)}%`; });
    bar.style.width = '100%';
    dialog.classList.add('is-done');
    statusEl.textContent = T('Thanks — you are human.');
    setTimeout(() => close(proof), 450);
  };

  const localize = () => {
    dialog.querySelector('.human-check__kicker').textContent = T('Quick check');
    dialog.querySelector('#hc-title').textContent = T('Drag the drop into the ring');
    dialog.querySelector('.human-check__hint').textContent = T('Use the mouse or finger — or the arrow keys.');
    closeBtn.setAttribute('aria-label', T('Close'));
  };

  const open = () => new Promise((resolve, reject) => {
    pending = { resolve, reject };
    localize();
    lastFocus = document.activeElement;
    dialog.hidden = false;
    requestAnimationFrame(() => { reset(); drop.focus(); });
  });

  function close(result) {
    dialog.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    const p = pending;
    pending = null;
    if (!p) return;
    if (result) p.resolve(result);
    else p.reject(new Error('cancelled'));
  }

  // pointer drag
  drop.addEventListener('pointerdown', (e) => {
    if (busy) return;
    drop.setPointerCapture(e.pointerId);
    const startX = e.clientX - x;
    samples = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    const move = (ev) => {
      samples.push({ x: ev.clientX, y: ev.clientY, t: performance.now() });
      setX(ev.clientX - startX);
    };
    const up = () => {
      drop.removeEventListener('pointermove', move);
      drop.removeEventListener('pointerup', up);
      drop.removeEventListener('pointercancel', up);
      finish();
    };
    drop.addEventListener('pointermove', move);
    drop.addEventListener('pointerup', up);
    drop.addEventListener('pointercancel', up);
  });

  // keyboard: arrows move, Enter / Space drops
  drop.addEventListener('keydown', (e) => {
    if (busy) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      keySteps.push(performance.now());
      setX(x + (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 12 : 3));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      finish();
    }
  });

  closeBtn.addEventListener('click', () => close(null));
  dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(null); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(null); });

  // one solved check is enough for the whole visit
  let passed = null;
  const ensureHuman = async () => {
    if (passed) return passed;
    passed = await open();
    return passed;
  };

  /* ---------------- protected social links ---------------- */
  const links = Array.from(document.querySelectorAll('[data-protected-link]'));
  // after one passed check every protected link becomes a normal link
  const unlock = () => links.forEach((a) => {
    const url = decode(CONTACT.links[a.dataset.protectedLink] || '');
    if (!url) return;
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.dataset.unlocked = 'true';
  });
  links.forEach((a) => {
    const url = decode(CONTACT.links[a.dataset.protectedLink] || '');
    if (!url) a.setAttribute('aria-disabled', 'true');
    a.addEventListener('click', async (e) => {
      if (a.dataset.unlocked) return; // already a real link
      e.preventDefault();
      if (!url) return;
      try {
        await ensureHuman();
      } catch (err) {
        return;
      }
      unlock();
      // still inside the click's activation window -> new tab; else this tab
      const win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
    });
  });

  /* ---------------- sending (contact form, order brief, CV request) ---------------- */
  // counted from page load: people scroll down and type, bots post at once
  // (not from the first focus — autofill + one click is a real person too)
  const openedAt = Date.now();

  // one way out for every form: honeypot + time, the human check, then the Worker.
  // Resolves to a status key: 'sent', 'fake' (bot: pretend), 'cancelled', 'offline' (no endpoint)
  window.sndrSend = async (data) => {
    if (data.website || Date.now() - openedAt < MIN_FILL_MS) return 'fake';
    let proof;
    try {
      proof = await ensureHuman();
    } catch (err) {
      return 'cancelled';
    }
    if (!CONTACT.endpoint) return 'offline';
    const res = await fetch(CONTACT.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, proof, elapsed: Date.now() - openedAt, page: location.href }),
    });
    if (!res.ok) throw new Error(String(res.status));
    passed = null; // next message needs a fresh proof
    return 'sent';
  };
  // the brief's file upload asks for the check before it takes files (order.js)
  window.sndrEnsureHuman = ensureHuman;
  window.sndrSendStatus = {
    fake: 'Thanks! Your message is on its way.',
    cancelled: 'The check was closed — the message was not sent.',
    offline: 'Sending is not set up yet — please email us directly.',
    sent: 'Thanks! We will get back to you within one business day.',
    failed: 'Could not send right now — please try again or email us.',
  };

  /* ---------------- contact form ---------------- */
  const form = document.querySelector('#contactForm');
  if (!form) return;
  const status = form.querySelector('.contact-form__status');
  const submit = form.querySelector('.contact-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      status.textContent = T('Please fill in your name, a valid email and a message.');
      return;
    }
    submit.disabled = true;
    status.textContent = T('Sending…');
    let result;
    try {
      result = await window.sndrSend(Object.fromEntries(new FormData(form)));
    } catch (err) {
      result = 'failed';
    }
    submit.disabled = false;
    status.textContent = T(window.sndrSendStatus[result]);
    if (result === 'sent' || result === 'fake') {
      form.reset();
      form.classList.remove('was-validated');
    }
  });
})();
