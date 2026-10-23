/* =====================================================================
   SNDR STUDIO — sound gate + UI sound effects (Web Audio, no files)

   GATE: browsers only allow sound after a click, so the visit opens with
   a small choice: "Enter with sound" / "Enter without sound" (remembered;
   "without" is not asked again). The hero intro waits for the answer
   (window.sndrSound.ready), so the first letters are heard.
   With sound on, the lo-fi music starts at 30% (lofi.js, "sndr:sound").

   EFFECTS (window.sndrSfx): soft, lulling and musical — every sound lands
   on the music's beat grid and takes its notes from the chord playing
   right now (window.sndrBeat from lofi.js; a calm pentatonic without it):
     pops(times)  — logo letters: a soft, muted pluck each (16th notes)
     spring(p)    — hero title stretching on scroll: a gentle spring
                    "boing" on every 8th note, higher the further it is pulled
     fwips(times) — subtitle words: airy high plucks
     tick()       — marquee lens: a dry, damped "trh", one per 16th
     suck()       — airy intake as the lens enters the marquee
     chime()      — About lead: each word lighting up rings a kalimba
                    note, walking up the chord like a lullaby
   Everything goes through a soft echo (dotted 8th) and a warm low-pass.
   LOUDNESS: follows the music dial (same curve as the track, "sndr:volume");
   hover sounds (marquee lens) play 4x quieter; everything is 4x quieter
   while a portfolio video window is open ("sndr:video").
   Styles: neon.css → SOUND GATE.
   ===================================================================== */
(function () {
  'use strict';

  const AC = window.AudioContext || window.webkitAudioContext;
  const KEY = 'sndr-sound';
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } },
  };
  const CALM = [62, 65, 67, 69, 72, 74]; // D minor pentatonic, used without music
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  let ctx = null;
  let out = null;
  let hoverOut = null; // hover sounds: a quarter of the others
  let echo = null;
  let noise = null;
  let on = false;

  const beat = () => window.sndrBeat;
  // same perceptual curve as the music (lofi.js level()), scaled so the effects
  // sit at the track's loudness; 4x down while a portfolio video is open
  let videoOpen = false;
  const loudness = () => {
    const v = beat() ? beat().volume : 0.3;
    return v * v * 0.9 * 4.5 * (videoOpen ? 0.25 : 1);
  };
  const follow = () => { if (out) out.gain.setTargetAtTime(loudness(), ctx.currentTime, 0.1); };
  window.addEventListener('sndr:volume', follow);
  window.addEventListener('sndr:video', (e) => { videoOpen = !!(e.detail && e.detail.open); follow(); });
  const step = () => (beat() ? beat().step : 60 / 78 / 4);
  // ctx time of the next grid line (div = length in 16ths); "now" without music
  const onGrid = (div = 1) => ctx.currentTime + 0.01 + (beat() && beat().playing ? beat().until(div) : 0);
  const scale = () => (beat() && beat().playing ? beat().scale() : CALM);

  const build = () => {
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = loudness();
    hoverOut = ctx.createGain();
    hoverOut.gain.value = 0.25;
    hoverOut.connect(out);
    const tone = ctx.createBiquadFilter(); // warm and muffled
    tone.type = 'lowpass';
    tone.frequency.value = 3200;
    out.connect(tone).connect(ctx.destination);
    // soft echo on a dotted 8th, darker on every repeat
    echo = ctx.createGain();
    const delay = ctx.createDelay(1);
    delay.delayTime.value = step() * 3;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const dark = ctx.createBiquadFilter();
    dark.type = 'lowpass';
    dark.frequency.value = 1600;
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    echo.connect(delay).connect(dark).connect(fb).connect(delay);
    dark.connect(wet).connect(out);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  };

  /* ---------------- voices ---------------- */
  const env = (g, t, peak, attack, decay) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  };
  const burst = (t, dur, type, freq, q, level, dest = out) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    src.connect(f).connect(g).connect(dest);
    env(g, t, level, 0.002, dur);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
    return f;
  };

  // kalimba / soft pluck: sine + a faint bell partial, low-passed, into the echo
  const pluck = (n, t, level, decay, bright = 1800) => {
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = bright;
    [[1, 1, 'sine'], [4.02, 0.08, 'sine'], [2, 0.18, 'triangle']].forEach(([ratio, lvl, type]) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = type;
      o.frequency.value = midi(n) * ratio;
      og.gain.value = lvl;
      o.connect(og).connect(lp);
      o.start(t);
      o.stop(t + decay + 0.1);
    });
    lp.connect(g);
    g.connect(out);
    g.connect(echo);
    env(g, t, level, 0.006, decay);
  };

  // one sound per grid slot: no pile-ups when events come fast
  const slots = {};
  const takeSlot = (name, t) => {
    if (slots[name] && Math.abs(slots[name] - t) < 0.02) return false;
    slots[name] = t;
    return true;
  };

  // logo letter: a soft, muted pluck from the low end of the chord
  const pop = (t, k) => {
    const sc = scale();
    pluck(sc[k % sc.length] - 12, t, 0.22, 0.35, 900);
    burst(t, 0.02, 'bandpass', 1200, 1.5, 0.025); // the faint felt "ch"
  };

  // spring: a sine "boing" whose wobble dies out, pitched by the stretch
  const spring = (p) => {
    if (!on || p <= 0.002 || p >= 0.998) return;
    const t = onGrid(2);
    if (!takeSlot('spring', t)) return;
    const sc = scale();
    const n = sc[Math.min(Math.floor(p * sc.length), sc.length - 1)] - 12;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = midi(n);
    const wob = ctx.createOscillator();
    const wobAmt = ctx.createGain();
    wob.frequency.value = 16;
    wobAmt.gain.setValueAtTime(midi(n) * 0.18, t);
    wobAmt.gain.exponentialRampToValueAtTime(0.5, t + 0.4);
    wob.connect(wobAmt).connect(o.frequency);
    const g = ctx.createGain();
    o.connect(g);
    g.connect(out);
    g.connect(echo);
    env(g, t, 0.13, 0.01, 0.42);
    o.start(t);
    wob.start(t);
    o.stop(t + 0.5);
    wob.stop(t + 0.5);
  };

  // subtitle word: an airy, high pluck
  const fwip = (t, k) => {
    const sc = scale();
    pluck(sc[(k * 2) % sc.length] + 12, t, 0.08, 0.6, 2600);
    burst(t, 0.12, 'bandpass', 1800, 2, 0.02);
  };

  // marquee letter: dry damped "trh", one per 16th
  const tick = () => {
    if (!on) return;
    const t = onGrid(1);
    if (!takeSlot('tick', t)) return;
    burst(t, 0.022, 'bandpass', 1700 + Math.random() * 300, 2.5, 0.07, hoverOut);
    burst(t + 0.01, 0.035, 'lowpass', 600, 0.7, 0.05, hoverOut);
  };
  // the lens arriving: a breathy intake that peaks on the next beat
  const suck = () => {
    if (!on) return;
    const t = ctx.currentTime;
    const peak = Math.max(onGrid(4) - t, 0.25);
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(260, t);
    f.frequency.exponentialRampToValueAtTime(1300, t + peak);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + peak);
    g.gain.exponentialRampToValueAtTime(0.0001, t + peak + 0.08);
    src.connect(f).connect(g).connect(hoverOut);
    src.start(t);
    src.stop(t + peak + 0.15);
  };

  // About lead: a kalimba note per lit word, walking up the chord (8th notes)
  let walk = 0;
  const chime = () => {
    if (!on) return;
    const t = onGrid(2);
    if (!takeSlot('chime', t)) return;
    const sc = scale();
    pluck(sc[walk % sc.length], t, 0.12, 1.2, 1500);
    walk++;
  };

  window.sndrSfx = {
    // the grid the intro should follow: step length and the first line (s from now)
    grid() {
      if (!on || !beat() || !beat().playing) return null;
      return { step: step(), start: beat().until(1) + 0.01 };
    },
    // offsets in seconds from now
    pops(offsets) {
      if (!on) return;
      offsets.forEach((s, k) => pop(ctx.currentTime + s, k));
    },
    fwips(offsets) {
      if (!on) return;
      offsets.forEach((s, k) => fwip(ctx.currentTime + s, k));
    },
    spring,
    tick,
    suck,
    chime,
  };

  /* ---------------- marquee lens hooks ---------------- */
  const marquee = document.querySelector('.marquee-section');
  if (marquee) {
    let lastCh = null;
    marquee.addEventListener('pointerenter', () => suck());
    marquee.addEventListener('pointerover', (e) => {
      const ch = e.target.closest && e.target.closest('.mq-ch');
      if (ch && ch !== lastCh) {
        lastCh = ch;
        tick();
      }
    });
  }

  /* ---------------- the gate ---------------- */
  let answer;
  const ready = new Promise((resolve) => { answer = resolve; });
  window.sndrSound = { ready, get on() { return on; } };

  const enable = async () => {
    if (!AC) return;
    if (!ctx) build();
    on = true;
    // still inside the click: lofi.js starts its own audio from this event
    window.dispatchEvent(new CustomEvent('sndr:sound', { detail: { on: true } }));
    await ctx.resume();
  };

  if (!AC || store.get() === 'off') {
    answer(false);
    return;
  }

  const T = (s) => (window.sndrT ? window.sndrT(s) : s); // i18n.js
  const gate = document.createElement('div');
  gate.className = 'sound-gate';
  gate.innerHTML = `
    <div class="sound-gate__panel" role="dialog" aria-modal="true" aria-labelledby="sg-title">
      <span class="sound-gate__wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
      <h2 id="sg-title">SNDR STUDIO</h2>
      <p>${T('The site has music and soft sound effects.')}</p>
      <div class="sound-gate__actions">
        <button type="button" class="sound-gate__on">${T('Enter with sound')}</button>
        <button type="button" class="sound-gate__off">${T('Without sound')}</button>
      </div>
    </div>`;
  document.body.appendChild(gate);
  gate.querySelector('.sound-gate__on').focus();

  const choose = (withSound) => {
    store.set(withSound ? 'on' : 'off');
    if (withSound) enable();
    gate.classList.add('is-leaving');
    setTimeout(() => gate.remove(), 700);
    answer(withSound);
  };
  gate.querySelector('.sound-gate__on').addEventListener('click', () => choose(true));
  gate.querySelector('.sound-gate__off').addEventListener('click', () => choose(false));
})();
