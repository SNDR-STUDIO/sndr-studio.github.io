/* =====================================================================
   SNDR STUDIO — generative lo-fi lounge (Web Audio, no audio file)
   72 bpm, ii–V–I–vi jazz chords on warm keys, soft bass and a bell
   melody — no drums, no noise — with deep whale calls drifting through
   a long reverb.

   Control: one round button under the menu toggle, split into three
   sectors — top: play / pause, bottom-left: volume −, bottom-right: +.
   Ducks while a Content Stream spot plays (event "sndr:spot" from main.js).
   Starts only on a click (browsers block autoplay with sound).
   ===================================================================== */
(function () {
  'use strict';

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  const BPM = 72;
  const STEP = 60 / BPM / 4; // a 16th note
  const LOOKAHEAD = 0.15;    // seconds scheduled ahead
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  // Dm9 – G13 – Cmaj9 – Am9 (keys voicing + bass root)
  const CHORDS = [
    { keys: [53, 57, 60, 64], bass: 38, scale: [62, 65, 69, 72, 74] },
    { keys: [53, 59, 64, 67], bass: 43, scale: [62, 67, 71, 74, 76] },
    { keys: [52, 55, 59, 62], bass: 36, scale: [64, 67, 71, 72, 76] },
    { keys: [55, 59, 60, 64], bass: 45, scale: [64, 67, 69, 72, 76] },
  ];

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };

  let ctx = null;
  let nodes = null;
  let playing = false;
  let volume = Math.min(Math.max(parseFloat(store.get('sndr-lofi-volume', '0.5')) || 0.5, 0), 1);
  let step = 0;
  let nextTime = 0;
  let timer = 0;

  /* ---------------- audio graph ---------------- */
  const noiseBuffer = (seconds, fill) => {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = fill(i, len);
    }
    return buf;
  };

  const build = () => {
    ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    const duck = ctx.createGain();
    const warmth = ctx.createBiquadFilter(); // the "lo" in lo-fi
    warmth.type = 'lowpass';
    warmth.frequency.value = 4200;
    warmth.Q.value = 0.4;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;

    const bus = ctx.createGain();
    bus.connect(warmth).connect(duck).connect(master).connect(comp).connect(ctx.destination);

    // small room reverb from a decaying noise impulse
    const reverb = ctx.createConvolver();
    reverb.buffer = noiseBuffer(3.2, (i, len) => (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3));
    const wet = ctx.createGain();
    wet.gain.value = 0.38;
    reverb.connect(wet).connect(warmth);

    // keys bus with a slow tremolo
    const keys = ctx.createGain();
    keys.gain.value = 0.85;
    const trem = ctx.createOscillator();
    const tremDepth = ctx.createGain();
    trem.frequency.value = 4.2;
    tremDepth.gain.value = 0.12;
    trem.connect(tremDepth).connect(keys.gain);
    trem.start();
    keys.connect(bus);
    keys.connect(reverb);


    // whales get their own big, dark reverb
    const ocean = ctx.createConvolver();
    ocean.buffer = noiseBuffer(6, (i, len) => (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2));
    const oceanWet = ctx.createGain();
    oceanWet.gain.value = 0.6;
    const oceanTone = ctx.createBiquadFilter();
    oceanTone.type = 'lowpass';
    oceanTone.frequency.value = 900;
    ocean.connect(oceanTone).connect(oceanWet).connect(bus);

    nodes = { master, duck, bus, reverb, keys, ocean };
  };

  /* ---------------- instruments ---------------- */
  const env = (g, t, peak, attack, decay) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  };

  const keyNote = (n, t, dur, vel) => {
    const f = midi(n);
    const out = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1500;
    [[0, 'sine', 1], [5, 'triangle', 0.35], [-5, 'sine', 0.5]].forEach(([detune, type, level]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = detune;
      g.gain.value = level;
      o.connect(g).connect(lp);
      o.start(t);
      o.stop(t + dur + 0.2);
    });
    lp.connect(out).connect(nodes.keys);
    env(out, t, 0.07 * vel, 0.015, dur);
  };

  const bassNote = (n, t, dur, vel) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    o.type = 'triangle';
    o.frequency.value = midi(n);
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    o.connect(lp).connect(g).connect(nodes.bus);
    env(g, t, 0.32 * vel, 0.02, dur);
    o.start(t);
    o.stop(t + dur + 0.1);
  };

  const bellNote = (n, t, vel) => {
    const f = midi(n);
    [[1, 0.06], [3.01, 0.015]].forEach(([ratio, level]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f * ratio;
      o.connect(g);
      g.connect(nodes.bus);
      g.connect(nodes.reverb);
      env(g, t, level * vel, 0.005, 1.4);
      o.start(t);
      o.stop(t + 1.6);
    });
  };

  // whale call: a slow moaning glide with vibrato, low-passed and drowned in reverb
  const whale = (t) => {
    const dur = 3 + Math.random() * 2.5;
    const f0 = 140 + Math.random() * 90;
    const peak = f0 * (1.6 + Math.random() * 0.9);
    const out = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    lp.Q.value = 3; // a little vocal resonance
    const vib = ctx.createOscillator();
    const vibDepth = ctx.createGain();
    vib.frequency.value = 4 + Math.random() * 2;
    vibDepth.gain.value = 5;
    vib.start(t);
    vib.stop(t + dur + 0.5);
    [[1, 1], [2, 0.35], [0.5, 0.5]].forEach(([ratio, level]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f0 * ratio, t);
      o.frequency.exponentialRampToValueAtTime(peak * ratio, t + dur * 0.45);
      o.frequency.exponentialRampToValueAtTime(f0 * 0.8 * ratio, t + dur);
      vib.connect(vibDepth).connect(o.frequency);
      g.gain.value = level;
      o.connect(g).connect(lp);
      o.start(t);
      o.stop(t + dur + 0.3);
    });
    lp.connect(out);
    out.connect(nodes.ocean);
    out.connect(nodes.bus);
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(0.05, t + dur * 0.3);
    out.gain.linearRampToValueAtTime(0.035, t + dur * 0.7);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  };

  /* ---------------- sequencer ---------------- */
  const scheduleStep = (s, t) => {
    const bar = Math.floor(s / 16) % CHORDS.length;
    const i = s % 16;
    const chord = CHORDS[bar];
    const swing = i % 4 === 2 ? STEP * 0.22 : 0; // relaxed off-beat feel
    const at = t + swing;
    const human = () => 0.85 + Math.random() * 0.15;

    // keys: chord on the one, soft re-strike on the "and" of three
    if (i === 0) chord.keys.forEach((n, k) => keyNote(n, at + k * 0.012, STEP * 14, human()));
    if (i === 10) chord.keys.forEach((n) => keyNote(n, at, STEP * 5, 0.5 * human()));

    // bass
    if (i === 0) bassNote(chord.bass, at, STEP * 6, 1);
    if (i === 8) bassNote(chord.bass + 7, at, STEP * 4, 0.8);
    if (i === 14) bassNote(chord.bass + (Math.random() < 0.5 ? 12 : 10), at, STEP * 2, 0.6);

    // bell melody from the chord's scale
    if ((i % 4 === 2 && Math.random() < 0.55) || (i === 7 && Math.random() < 0.3)) {
      bellNote(chord.scale[Math.floor(Math.random() * chord.scale.length)], at, human());
    }

    // a whale calls from the deep every few bars
    if (i === 0 && Math.floor(s / 16) % 3 === 1 && Math.random() < 0.8) whale(at + Math.random() * STEP * 4);
  };

  const tick = () => {
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      scheduleStep(step, nextTime);
      step++;
      nextTime += STEP;
    }
  };

  /* ---------------- transport ---------------- */
  const level = () => volume * volume * 0.9; // perceptual curve

  const play = async () => {
    if (!ctx) build();
    await ctx.resume();
    if (!timer) {
      nextTime = ctx.currentTime + 0.05;
      timer = setInterval(tick, 25);
    }
    nodes.master.gain.cancelScheduledValues(ctx.currentTime);
    nodes.master.gain.setTargetAtTime(level(), ctx.currentTime, 0.4);
    playing = true;
    render();
  };

  const pause = () => {
    if (!ctx) return;
    playing = false;
    nodes.master.gain.cancelScheduledValues(ctx.currentTime);
    nodes.master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setTimeout(() => {
      if (playing) return;
      clearInterval(timer);
      timer = 0;
      ctx.suspend();
    }, 700);
    render();
  };

  const setVolume = (v) => {
    volume = Math.round(Math.min(Math.max(v, 0), 1) * 10) / 10;
    store.set('sndr-lofi-volume', String(volume));
    if (ctx && playing) nodes.master.gain.setTargetAtTime(level(), ctx.currentTime, 0.1);
    render();
  };

  // quieter while a Content Stream spot plays
  window.addEventListener('sndr:spot', (e) => {
    if (!ctx) return;
    nodes.duck.gain.setTargetAtTime(e.detail && e.detail.playing ? 0.12 : 1, ctx.currentTime, 0.25);
  });

  /* ---------------- UI: one circle, three sectors ---------------- */
  const dial = document.createElement('div');
  dial.className = 'music-dial';
  dial.setAttribute('role', 'group');
  dial.setAttribute('aria-label', 'Background music');
  dial.innerHTML = `
    <button type="button" class="music-dial__sector music-dial__play" aria-label="Play lo-fi music" aria-pressed="false">
      <i class="bi bi-play-fill" aria-hidden="true"></i>
    </button>
    <button type="button" class="music-dial__sector music-dial__down" aria-label="Music volume down">
      <i class="bi bi-dash" aria-hidden="true"></i>
    </button>
    <button type="button" class="music-dial__sector music-dial__up" aria-label="Music volume up">
      <i class="bi bi-plus" aria-hidden="true"></i>
    </button>
    <span class="music-dial__level" aria-hidden="true"></span>`;
  document.body.appendChild(dial);

  const playBtn = dial.querySelector('.music-dial__play');
  const downBtn = dial.querySelector('.music-dial__down');
  const upBtn = dial.querySelector('.music-dial__up');

  function render() {
    dial.style.setProperty('--vol', volume);
    dial.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-pressed', String(playing));
    playBtn.setAttribute('aria-label', playing ? 'Pause lo-fi music' : 'Play lo-fi music');
    playBtn.querySelector('i').className = `bi ${playing ? 'bi-pause-fill' : 'bi-play-fill'}`;
    downBtn.disabled = volume <= 0;
    upBtn.disabled = volume >= 1;
    dial.title = `Lo-fi music · volume ${Math.round(volume * 100)}%`;
  }

  playBtn.addEventListener('click', () => (playing ? pause() : play()));
  downBtn.addEventListener('click', () => setVolume(volume - 0.1));
  upBtn.addEventListener('click', () => setVolume(volume + 0.1));
  render();
})();
