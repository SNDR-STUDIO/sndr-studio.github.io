/* =====================================================================
   ALEX SAVO — profile page effects (alex-profile.html)
   Ported from the parallax portfolio template; one requestAnimationFrame
   loop writes CSS variables, the visuals live in assets/css/profile.css.
     hero        layered parallax (data-speed), the title fades out
     about       words light up one by one while the section is pinned
     showreel    the gates open (--d), then the reel grows to full screen (--p);
                 the video plays only while the section is on screen
     help        stacking cards shrink and dim as the next one slides over
     process     the timeline line draws itself
     stack       3D tool sphere: auto spin, follows the cursor, drag, filter
     footer      landscape rises; the email button is drawn to the cursor
     CV          the request goes through the human check (contact.js → sndrSend)
   ===================================================================== */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const T = (s) => (window.sndrT ? window.sndrT(s) : s);

  // progress 0..1 while a tall section with a sticky child scrolls past
  const pinProgress = (section, finishAt = 0.85) => {
    const r = section.getBoundingClientRect();
    const travel = r.height - window.innerHeight;
    return travel > 0 ? clamp01(-r.top / (travel * finishAt)) : 0;
  };
  // 0 when the element's top reaches the bottom of the viewport, 1 when it is `span` px further
  const enterProgress = (el, span = window.innerHeight * 0.35) =>
    clamp01((window.innerHeight - el.getBoundingClientRect().top) / span);

  const progressBar = document.querySelector('.progress');
  const layers = $('[data-speed]');
  const fades = $('[data-fade]');
  const reveals = $('.reveal-up');
  const inners = $('[data-inner]');
  const gates = $('.gates');
  const timelines = $('.timeline');
  const stackCards = $('.stack__card');
  stackCards.forEach((c, i) => c.style.setProperty('--i', i));

  /* ---------------- about: one span per word (per character in Chinese) ---------------- */
  const wordBlocks = $('.words').map((el) => ({ el, section: el.closest('section'), spans: [] }));
  const splitWords = () => wordBlocks.forEach((b) => {
    const text = b.el.textContent.trim();
    const cjk = /[぀-ヿ㐀-鿿]/.test(text);
    const parts = cjk ? Array.from(text) : text.split(/\s+/);
    b.el.setAttribute('aria-label', text);
    b.el.innerHTML = parts.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(cjk ? '' : ' ');
    b.spans = $('.w', b.el);
  });
  splitWords();
  // i18n.js swaps whole text nodes; after a language switch the words are re-split
  window.addEventListener('sndr:lang', () => {
    wordBlocks.forEach((b) => { b.el.textContent = T(b.el.getAttribute('aria-label') || ''); });
    splitWords();
  });

  /* ---------------- showreel video: plays only on screen; sound toggle ---------------- */
  gates.forEach((g) => {
    const video = g.querySelector('video');
    const sound = g.querySelector('.gates__sound');
    if (!video) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      }, { threshold: 0.15 }).observe(g);
    }
    if (sound) {
      sound.addEventListener('click', () => {
        video.muted = !video.muted;
        if (!video.muted) video.play().catch(() => {});
        sound.setAttribute('aria-pressed', String(!video.muted));
        sound.querySelector('i').className = `bi ${video.muted ? 'bi-volume-mute' : 'bi-volume-up'}`;
      });
    }
  });

  /* ---------------- pointer: cursor ring + magnetic button ---------------- */
  const cursor = document.querySelector('.cursor');
  const pointer = { x: -100, y: -100, cx: -100, cy: -100, hover: 0, scale: 1 };
  const magnets = $('.magnetic').map((el) => ({ el, x: 0, y: 0, tx: 0, ty: 0 }));
  if (finePointer && !reduced) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.hover = e.target.closest('a, button, label') ? 1 : 0;
      magnets.forEach((m) => {
        const r = m.el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * 0.9;
        m.tx = near ? dx * 0.35 : 0;
        m.ty = near ? dy * 0.35 : 0;
      });
    }, { passive: true });
  }

  /* ---------------- stack: 3D tool sphere ---------------- */
  const sphere = (() => {
    const root = document.querySelector('[data-sphere]');
    if (!root) return null;
    const items = $('.sphere__item', root);
    const n = items.length;
    // even spread over the sphere (Fibonacci spiral)
    const pts = items.map((el, i) => {
      const y = 1 - ((i + 0.5) / n) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * Math.PI * (3 - Math.sqrt(5));
      return { el, x: Math.cos(phi) * r, y, z: Math.sin(phi) * r, boost: 1 };
    });
    // accumulated rotation (row-major 3x3), pre-multiplied each frame by a small Ry*Rx
    let m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const rotate = (ax, ay) => {
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      const r = [cy, sy * sx, sy * cx, 0, cx, -sx, -sy, cy * sx, cy * cx];
      const o = new Array(9);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          o[row * 3 + col] = r[row * 3] * m[col] + r[row * 3 + 1] * m[3 + col] + r[row * 3 + 2] * m[6 + col];
        }
      }
      m = o;
    };
    const AUTO = { x: -0.0016, y: 0.0042 };
    const v = { ...AUTO };
    const target = { ...AUTO };
    let drag = null;
    let hovering = null;

    root.addEventListener('pointermove', (e) => {
      const r = root.getBoundingClientRect();
      if (drag) {
        v.y = (e.clientX - drag.x) * 0.006;
        v.x = -(e.clientY - drag.y) * 0.006;
        drag = { x: e.clientX, y: e.clientY };
        return;
      }
      target.y = ((e.clientX - r.left) / r.width - 0.5) * 2 * 0.022;
      target.x = -((e.clientY - r.top) / r.height - 0.5) * 2 * 0.022;
    });
    root.addEventListener('pointerleave', () => Object.assign(target, AUTO));
    root.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY };
      root.classList.add('is-dragging');
      root.setPointerCapture(e.pointerId);
    });
    const endDrag = () => { drag = null; root.classList.remove('is-dragging'); };
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);
    items.forEach((el, i) => {
      el.addEventListener('pointerenter', () => { hovering = pts[i]; el.classList.add('is-hover'); });
      el.addEventListener('pointerleave', () => { if (hovering === pts[i]) hovering = null; el.classList.remove('is-hover'); });
    });

    // category filter
    const buttons = $('[data-filter]');
    $('[data-n]').forEach((s) => {
      const cat = s.dataset.n;
      s.textContent = cat === 'all' ? n : items.filter((el) => el.dataset.cat === cat).length;
    });
    buttons.forEach((b) => b.addEventListener('click', () => {
      const filter = b.dataset.filter;
      buttons.forEach((x) => {
        x.classList.toggle('is-active', x === b);
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      items.forEach((el) => el.style.setProperty('--dim', filter === 'all' || el.dataset.cat === filter ? 1 : 0.15));
    }));

    const draw = () => {
      const R = root.clientWidth * 0.4;
      pts.forEach((p) => {
        const x = m[0] * p.x + m[1] * p.y + m[2] * p.z;
        const y = m[3] * p.x + m[4] * p.y + m[5] * p.z;
        const z = m[6] * p.x + m[7] * p.y + m[8] * p.z;
        const d = (z + 1) / 2; // 0 back, 1 front
        p.boost = lerp(p.boost, p === hovering ? 1.3 : 1, 0.2);
        const s = p.el.style;
        s.setProperty('--x', `${x * R}px`);
        s.setProperty('--y', `${y * R}px`);
        s.setProperty('--k', (0.5 + d * 0.65) * p.boost);
        s.setProperty('--d', d);
        s.setProperty('--z', Math.round(d * 100) + (p === hovering ? 200 : 0));
      });
    };
    const update = (scrollVelocity) => {
      const r = root.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return; // off screen
      if (!drag) {
        const slow = hovering ? 0.15 : 1; // nearly stops under the cursor so the label can be read
        v.x = lerp(v.x, target.x * slow, 0.05);
        v.y = lerp(v.y, target.y * slow, 0.05);
      }
      rotate(v.x + scrollVelocity * 0.0005, v.y);
      draw();
    };
    draw();
    return { update };
  })();

  /* ---------------- CV request ---------------- */
  const cvForm = document.querySelector('#cvForm');
  if (cvForm) {
    const status = cvForm.querySelector('.cv__status');
    cvForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = cvForm.elements.name;
      const email = cvForm.elements.email;
      const badName = !name.value.trim();
      const badEmail = !email.value.trim() || !email.checkValidity();
      name.setAttribute('aria-invalid', String(badName));
      email.setAttribute('aria-invalid', String(badEmail));
      if (badName || badEmail) {
        status.textContent = T('Please fill in your name and a valid email.');
        return;
      }
      status.textContent = T('Sending…');
      let result;
      try {
        result = window.sndrSend
          ? await window.sndrSend({
            name: name.value.trim(),
            email: email.value.trim(),
            website: cvForm.elements.website.value,
            service: 'CV request',
            message: `CV request for Alex Savo from ${name.value.trim()} <${email.value.trim()}>`,
          })
          : 'offline';
      } catch (err) {
        result = 'failed';
      }
      const msgs = {
        sent: 'Thanks! The CV is on its way to your inbox.',
        fake: 'Thanks! The CV is on its way to your inbox.',
        cancelled: 'The check was closed — the request was not sent.',
        offline: 'Requests are not set up yet — please write to hello@example.com.',
        failed: 'Could not send right now — please try again or email us.',
      };
      status.textContent = T(msgs[result]);
      if (result === 'sent' || result === 'fake') cvForm.reset();
    });
  }

  /* ---------------- main loop ---------------- */
  let lastScroll = window.scrollY;
  let velocity = 0;

  const frame = () => {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    velocity = lerp(velocity, scrollY - lastScroll, 0.2);
    lastScroll = scrollY;

    const max = document.documentElement.scrollHeight - vh;
    progressBar.style.setProperty('--p', max > 0 ? scrollY / max : 0);

    // layered parallax, relative to the section the layer lives in
    layers.forEach((el) => {
      const host = el.closest('section, footer');
      el.style.setProperty('--y', `${-host.getBoundingClientRect().top * parseFloat(el.dataset.speed)}px`);
    });
    fades.forEach((el) => {
      el.style.setProperty('--fade', 1 - clamp01(-el.closest('section').getBoundingClientRect().top / (vh * 0.6)));
    });
    reveals.forEach((el) => el.style.setProperty('--in', enterProgress(el)));
    inners.forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      img.style.setProperty('--iy', `${-(r.top + r.height / 2 - vh / 2) * parseFloat(img.dataset.inner)}px`);
    });

    // about: words light up while pinned
    wordBlocks.forEach((b) => {
      const p = pinProgress(b.section, 0.9);
      const n = b.spans.length;
      b.spans.forEach((s, i) => s.style.setProperty('--w', clamp01(p * (n + 3) - i - 1)));
    });

    // showreel: the gates open in the first 45%, then the reel grows to full screen
    gates.forEach((g) => {
      const raw = pinProgress(g, 0.85);
      g.style.setProperty('--d', easeInOut(clamp01(raw / 0.45)));
      g.style.setProperty('--p', easeInOut(clamp01((raw - 0.4) / 0.6)));
    });

    // stacking cards: each shrinks and darkens as the next one slides over it
    stackCards.forEach((card, i) => {
      const next = stackCards[i + 1];
      if (!next) return;
      const dist = next.getBoundingClientRect().top - (vh * 0.14 + (i + 1) * 22);
      card.style.setProperty('--s', clamp01(1 - dist / (vh * 0.6)));
    });

    timelines.forEach((t) => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--p', clamp01((vh * 0.65 - r.top) / r.height));
    });

    if (sphere) sphere.update(velocity);

    if (finePointer) {
      pointer.cx = lerp(pointer.cx, pointer.x, 0.22);
      pointer.cy = lerp(pointer.cy, pointer.y, 0.22);
      pointer.scale = lerp(pointer.scale, pointer.hover ? 1.9 : 1, 0.18);
      cursor.style.setProperty('--cx', `${pointer.cx}px`);
      cursor.style.setProperty('--cy', `${pointer.cy}px`);
      cursor.style.setProperty('--cs', pointer.scale);
      magnets.forEach((m) => {
        m.x = lerp(m.x, m.tx, 0.18);
        m.y = lerp(m.y, m.ty, 0.18);
        m.el.style.setProperty('--mx', `${m.x}px`);
        m.el.style.setProperty('--my', `${m.y}px`);
      });
    }

    requestAnimationFrame(frame);
  };

  if (reduced) {
    // no motion: final states
    gates.forEach((g) => { g.style.setProperty('--d', 1); g.style.setProperty('--p', 1); });
    timelines.forEach((t) => t.style.setProperty('--p', 1));
    reveals.forEach((el) => el.style.setProperty('--in', 1));
    wordBlocks.forEach((b) => b.spans.forEach((s) => s.style.setProperty('--w', 1)));
    return;
  }
  requestAnimationFrame(frame);
})();
