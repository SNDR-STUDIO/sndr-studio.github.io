/* =====================================================================
   SNDR STUDIO — Pricing, Order brief, FAQ (after the parallax template)
     PRICING  cards tilt toward the cursor with a light glare; "Choose"
              fills the brief (services, budget, length from data-*) and
              scrolls to its first step
     ORDER    the brief is a horizontal track: the section is as tall as
              the track is long, and the vertical scroll slides it sideways;
              the panel nearest the centre is lit. The whole section can also
              be dragged (mouse or finger), sideways and up/down: the drag
              scrolls the page, so the track stays in sync with the scroll.
              Step 2 takes a brand book / photos / PDF, but only after the
              human check. "Send" goes through the same human check +
              Telegram as the contact form (contact.js → window.sndrSend);
              "Copy" puts the brief on the clipboard
     FAQ      accordion; the height animates in CSS (grid rows)
   Styles: assets/css/sales.css. Texts are translated by i18n.js.
   ===================================================================== */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const T = (s) => (window.sndrT ? window.sndrT(s) : s);

  /* ---------------- FAQ ---------------- */
  $('.faq__q').forEach((q, i) => {
    if (i === 0) q.setAttribute('aria-expanded', 'true');
    q.addEventListener('click', () => q.setAttribute('aria-expanded', q.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'));
  });

  /* ---------------- PRICING: tilt + glare ---------------- */
  const plans = $('.plan');
  if (finePointer && !reduced) {
    plans.forEach((plan) => {
      plan.addEventListener('pointermove', (e) => {
        const r = plan.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        plan.style.setProperty('--ry', `${(px - 0.5) * 10}deg`);
        plan.style.setProperty('--rx', `${(0.5 - py) * 10}deg`);
        plan.style.setProperty('--px', `${px * 100}%`);
        plan.style.setProperty('--py', `${py * 100}%`);
        plan.style.setProperty('--glare', 1);
      });
      plan.addEventListener('pointerleave', () => {
        plan.style.setProperty('--rx', '0deg');
        plan.style.setProperty('--ry', '0deg');
        plan.style.setProperty('--glare', 0);
      });
    });
  }

  /* ---------------- ORDER: horizontal brief ---------------- */
  const section = document.querySelector('#order');
  const brief = document.querySelector('#brief');
  if (!section || !brief) return;
  const sticky = section.querySelector('.hscroll__sticky');
  const track = section.querySelector('.hscroll__track');
  const bar = section.querySelector('.hscroll__bar');
  const panels = $('.brief__panel', section);
  let distance = 0;
  let x = 0;

  const measure = () => {
    distance = Math.max(0, track.scrollWidth - window.innerWidth);
    section.style.height = `${window.innerHeight + distance}px`;
  };

  // scroll the page so the track brings `panel` into view
  const scrollToPanel = (panel) => {
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const p = distance ? clamp01((panel.offsetLeft - pad) / distance) : 0;
    const top = section.getBoundingClientRect().top + window.scrollY + p * distance;
    if (window.sndrLenis) window.sndrLenis.scrollTo(top, { duration: 1.2 });
    else window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  };
  track.addEventListener('focusin', (e) => {
    const panel = e.target.closest('.brief__panel');
    if (panel && !reduced) scrollToPanel(panel);
  });

  const frame = () => {
    const r = section.getBoundingClientRect();
    if (r.bottom > -100 && r.top < window.innerHeight + 100) {
      const p = distance ? clamp01(-r.top / distance) : 0;
      x += (-p * distance - x) * 0.14;
      track.style.setProperty('--x', `${x}px`);
      bar.style.setProperty('--p', p);
      panels.forEach((panel) => {
        const pr = panel.getBoundingClientRect();
        const fromCenter = (pr.left + pr.width / 2 - window.innerWidth / 2) / window.innerWidth;
        panel.style.setProperty('--focus', 1 - Math.min(1, Math.abs(fromCenter) * 1.6));
      });
    }
    requestAnimationFrame(frame);
  };

  /* ---------------- ORDER: drag the section (sideways or up/down) ---------------- */
  // A drag scrolls the page: left / up = forward. Form controls keep their own
  // pointer behaviour; a real drag swallows the click that would follow it.
  const scrollBy = (dy) => {
    const y = window.scrollY + dy;
    if (window.sndrLenis) window.sndrLenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  };
  let drag = null;
  let fling = 0;
  sticky.addEventListener('pointerdown', (e) => {
    if (reduced || e.button !== 0) return;
    if (e.target.closest('input, textarea, select, button, a, .file-drop__zone')) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, v: 0, t: performance.now() };
    cancelAnimationFrame(fling);
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.moved < 6) return;
    if (!sticky.classList.contains('is-dragging')) {
      sticky.classList.add('is-dragging');
      try { sticky.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    }
    const now = performance.now();
    // touch: the finger already scrolls up/down natively (touch-action: pan-y), so only sideways counts
    const delta = -(dx + (e.pointerType === 'touch' ? 0 : dy)) * 1.15;
    drag.v = delta / Math.max(now - drag.t, 1);
    drag.t = now;
    drag.x = e.clientX;
    drag.y = e.clientY;
    scrollBy(delta);
  });
  const endDrag = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const wasDrag = drag.moved >= 6;
    let v = drag.v * 16; // px per frame
    drag = null;
    sticky.classList.remove('is-dragging');
    if (!wasDrag) return;
    // swallow the click on whatever was under the finger
    const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    sticky.addEventListener('click', stop, { capture: true, once: true });
    setTimeout(() => sticky.removeEventListener('click', stop, { capture: true }), 0);
    // a little inertia after letting go
    const glide = () => {
      v *= 0.92;
      if (Math.abs(v) < 0.5) return;
      scrollBy(v);
      fling = requestAnimationFrame(glide);
    };
    fling = requestAnimationFrame(glide);
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  if (reduced) {
    // no motion: the track becomes a normal side scroller
    sticky.style.position = 'static';
    sticky.style.height = 'auto';
    sticky.style.overflowX = 'auto';
  } else {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    window.addEventListener('sndr:lang', () => requestAnimationFrame(measure)); // text length changes widths
    if (document.fonts) document.fonts.ready.then(measure);
    requestAnimationFrame(frame);
  }

  /* ---------------- PRICING → brief ---------------- */
  const status = brief.querySelector('.brief__status');
  const pkgInput = brief.elements.package;
  const pkgNote = brief.querySelector('.brief__package');
  const setPackage = (plan) => {
    plans.forEach((p) => p.classList.toggle('is-selected', p === plan));
    if (!plan) {
      pkgInput.value = '';
      pkgNote.hidden = true;
      return;
    }
    const name = plan.querySelector('.plan__name').textContent.trim();
    pkgInput.value = plan.dataset.package;
    pkgNote.hidden = false;
    pkgNote.querySelector('b').textContent = name;
    const wanted = plan.dataset.services.split(',');
    $('[name="service"]', brief).forEach((cb) => { cb.checked = wanted.includes(cb.value); });
    ['budget', 'length'].forEach((field) => {
      const radio = $(`[name="${field}"]`, brief).find((r) => r.value === plan.dataset[field]);
      if (radio) radio.checked = true;
    });
    status.textContent = `${T('Package chosen:')} ${name}`;
  };
  plans.forEach((plan) => plan.querySelector('.plan__btn').addEventListener('click', () => {
    setPackage(plan);
    scrollToPanel(brief.querySelector('fieldset.brief__panel'));
  }));
  brief.querySelector('[data-clear-package]').addEventListener('click', () => setPackage(null));

  /* ---------------- brief: brand book / photos / PDF (after the human check) ---------------- */
  const MAX_FILES = 5;
  const MAX_SIZE = 10 * 1024 * 1024;
  const OK_TYPE = (file) => /^image\/(jpeg|png|webp|gif|svg\+xml|heic)$/.test(file.type) || file.type === 'application/pdf';
  const drop = brief.querySelector('[data-file-drop]');
  const fileInput = drop && drop.querySelector('input[type="file"]');
  const fileList = drop && drop.querySelector('.file-drop__list');
  let files = [];

  const kb = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
  const renderFiles = () => {
    if (!fileList) return;
    fileList.innerHTML = '';
    files.forEach((file, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<i class="bi ${file.type === 'application/pdf' ? 'bi-file-earmark-pdf' : 'bi-file-earmark-image'}" aria-hidden="true"></i><span></span><small>${kb(file.size)}</small><button type="button" aria-label="Remove">×</button>`;
      li.querySelector('span').textContent = file.name;
      li.querySelector('button').addEventListener('click', () => { files.splice(i, 1); renderFiles(); });
      fileList.appendChild(li);
    });
  };

  // takes the files only once the visitor has passed the human check
  const addFiles = async (list) => {
    const picked = Array.from(list || []);
    if (!picked.length) return;
    if (window.sndrEnsureHuman) {
      try {
        await window.sndrEnsureHuman();
      } catch (err) {
        status.textContent = T('The check was closed — the files were not added.');
        return;
      }
    }
    const skipped = [];
    picked.forEach((file) => {
      if (!OK_TYPE(file) || file.size > MAX_SIZE || files.length >= MAX_FILES) skipped.push(file.name);
      else files.push(file);
    });
    renderFiles();
    status.textContent = skipped.length
      ? `${T('Skipped (type, size or more than 5 files):')} ${skipped.join(', ')}`
      : '';
  };

  if (drop && fileInput) {
    const zone = drop.querySelector('.file-drop__zone');
    fileInput.addEventListener('change', () => {
      addFiles(fileInput.files);
      fileInput.value = '';
    });
    ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (e) => {
      e.preventDefault();
      zone.classList.add('is-over');
    }));
    ['dragleave', 'drop'].forEach((type) => zone.addEventListener(type, () => zone.classList.remove('is-over')));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      addFiles(e.dataTransfer && e.dataTransfer.files);
    });
  }

  // files travel to the Worker as base64 inside the JSON
  const readFiles = () => Promise.all(files.map((file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, data: String(reader.result).split(',')[1] });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  })));

  /* ---------------- brief → text → send ---------------- */
  const LABELS = {
    package: 'Package', service: 'Services', about: 'Project', links: 'Links', length: 'Length',
    format: 'Formats', refs: 'References', deadline: 'Deadline', budget: 'Budget',
    name: 'Name', email: 'Email', telegram: 'Telegram',
  };
  const asText = () => {
    const data = new FormData(brief);
    return Object.keys(LABELS)
      .map((k) => [LABELS[k], data.getAll(k).map(String).filter(Boolean).join(', ')])
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  };

  brief.addEventListener('submit', async (e) => {
    e.preventDefault();
    const missing = [];
    if (!brief.querySelector('[name="service"]:checked')) missing.push(T('what needs to be done'));
    ['name', 'email'].forEach((n) => {
      const input = brief.elements[n];
      const bad = !input.value.trim() || (n === 'email' && !input.checkValidity());
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad) missing.push(T(n === 'name' ? 'your name' : 'a valid email'));
    });
    if (missing.length) {
      status.textContent = `${T('Please add:')} ${missing.join(', ')}.`;
      return;
    }
    const data = new FormData(brief);
    status.textContent = T('Sending…');
    let result;
    try {
      result = window.sndrSend
        ? await window.sndrSend({
          name: data.get('name'),
          email: data.get('email'),
          service: data.getAll('service').join(', '),
          message: `Order brief\n${asText()}${files.length ? `\nFiles: ${files.map((x) => x.name).join(', ')}` : ''}`,
          files: await readFiles(),
        })
        : 'offline';
    } catch (err) {
      result = 'failed';
    }
    const msgs = window.sndrSendStatus || {};
    status.textContent = T(msgs[result] || '');
    if (result === 'sent' || result === 'fake') {
      brief.reset();
      files = [];
      renderFiles();
      setPackage(null);
    }
  });

  brief.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(asText() || T('The brief is empty for now.'));
      status.textContent = T('Copied — paste it into an email or a message.');
    } catch (err) {
      status.textContent = T('Could not copy — please select the text by hand.');
    }
  });
})();
