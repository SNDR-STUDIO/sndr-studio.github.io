/* =====================================================================
   SNDR STUDIO — generative lo-fi beat (Web Audio, no audio file)
   78 bpm boom-bap: dusty kick, snare with a rim layer, swung hats, a bed
   of vinyl crackles (no hiss); ii–V–I–vi jazz chords on wobbly tape keys
   that dip under every kick, soft bass and a sparse bell melody.
   Starts at 30% volume. window.sndrBeat shares the beat grid and the
   current chord with sfx.js, so the UI sounds land in time and in key.

   Control: one round button under the menu toggle, split into three
   sectors — top: play / pause, bottom-left: volume −, bottom-right: +.
   Dips a little while a Content Stream spot plays (event "sndr:spot" from
   main.js); the spot itself plays at 10% of the music volume. 4x quieter
   while a portfolio video window is open ("sndr:video").
   Starts with the sound gate's "Enter with sound" (sfx.js) or on a click
   here (browsers block autoplay with sound).
   ===================================================================== */
(function () {
  'use strict';

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  const BPM = 78;
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
  let volume = Math.min(Math.max(parseFloat(store.get('sndr-lofi-volume', '0.3')) || 0.3, 0), 1);
  let step = 0;
  let nextTime = 0;
  let timer = 0;
  let origin = 0; // ctx time of step 0 of the running grid

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
    // tape wobble: a slowly modulated short delay bends the keys a little
    const tape = ctx.createDelay(0.05);
    tape.delayTime.value = 0.008;
    const wow = ctx.createOscillator();
    const wowDepth = ctx.createGain();
    wow.frequency.value = 0.55;
    wowDepth.gain.value = 0.0016;
    wow.connect(wowDepth).connect(tape.delayTime);
    wow.start();
    // sidechain feel: the keys dip under each kick (pump gain, driven per kick)
    const pump = ctx.createGain();
    keys.connect(tape).connect(pump);
    pump.connect(bus);
    pump.connect(reverb);

    // drums: own bus, a little darker and drier than the keys
    const drums = ctx.createGain();
    drums.gain.value = 0.55;
    const drumTone = ctx.createBiquadFilter();
    drumTone.type = 'lowpass';
    drumTone.frequency.value = 5200;
    drums.connect(drumTone).connect(bus);
    const drumVerb = ctx.createGain();
    drumVerb.gain.value = 0.12;
    drums.connect(drumVerb).connect(reverb);

    // vinyl: only the record's sparse crackles, no hiss underneath
    const crackle = ctx.createBufferSource();
    crackle.buffer = noiseBuffer(4, () => (Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.9 : 0));
    crackle.loop = true;
    const crackleTone = ctx.createBiquadFilter();
    crackleTone.type = 'bandpass';
    crackleTone.frequency.value = 2400;
    crackleTone.Q.value = 0.5;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.22;
    crackle.connect(crackleTone).connect(crackleGain).connect(bus);
    crackle.start();

    // one shared noise buffer for snare and hats
    const noise = noiseBuffer(1, () => Math.random() * 2 - 1);


    nodes = { master, duck, bus, reverb, keys, pump, drums, noise };
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

  const kick = (t, vel) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(118, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.13);
    o.connect(g).connect(nodes.drums);
    env(g, t, 0.95 * vel, 0.004, 0.42);
    o.start(t);
    o.stop(t + 0.5);
    // the keys duck under it and swell back
    nodes.pump.gain.cancelScheduledValues(t);
    nodes.pump.gain.setValueAtTime(0.55, t);
    nodes.pump.gain.setTargetAtTime(1, t + 0.04, 0.12);
  };

  const noiseHit = (t, vel, type, freq, q, decay, level) => {
    const src = ctx.createBufferSource();
    src.buffer = nodes.noise;
    const flt = ctx.createBiquadFilter();
    flt.type = type;
    flt.frequency.value = freq;
    flt.Q.value = q;
    const g = ctx.createGain();
    src.connect(flt).connect(g).connect(nodes.drums);
    env(g, t, level * vel, 0.002, decay);
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.05);
  };

  const snare = (t, vel) => {
    noiseHit(t, vel, 'bandpass', 1900, 0.7, 0.2, 0.38);
    // body / rim
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(210, t);
    o.frequency.exponentialRampToValueAtTime(160, t + 0.06);
    o.connect(g).connect(nodes.drums);
    env(g, t, 0.16 * vel, 0.002, 0.09);
    o.start(t);
    o.stop(t + 0.15);
  };

  const hat = (t, vel, open) => noiseHit(t, vel, 'highpass', 7600, 0.6, open ? 0.22 : 0.045, open ? 0.07 : 0.09);

  /* ---------------- sequencer ---------------- */
  const scheduleStep = (s, t) => {
    const bar = Math.floor(s / 16) % CHORDS.length;
    const i = s % 16;
    const chord = CHORDS[bar];
    const swing = i % 2 === 1 ? STEP * 0.24 : 0; // lazy swung 16ths
    const at = t + swing;
    const human = () => 0.85 + Math.random() * 0.15;

    // keys: chord on the one, soft re-strike on the "and" of three
    if (i === 0) chord.keys.forEach((n, k) => keyNote(n, at + k * 0.012, STEP * 14, human()));
    if (i === 10) chord.keys.forEach((n) => keyNote(n, at, STEP * 5, 0.5 * human()));

    // bass
    if (i === 0) bassNote(chord.bass, at, STEP * 6, 1);
    if (i === 8) bassNote(chord.bass + 7, at, STEP * 4, 0.8);
    if (i === 14) bassNote(chord.bass + (Math.random() < 0.5 ? 12 : 10), at, STEP * 2, 0.6);

    // drums: boom-bap kick, snare on 2 and 4, swung hats with ghost notes
    if (i === 0 || i === 10 || (i === 7 && Math.random() < 0.35)) kick(at, i === 0 ? 1 : 0.8);
    if (i === 4 || i === 12) snare(at + 0.012, human()); // a hair late
    if (i === 15 && Math.random() < 0.25) snare(at, 0.3); // ghost
    if (i % 2 === 0) hat(at, (i % 4 === 0 ? 0.9 : 0.55) * human(), false);
    else if (Math.random() < 0.18) hat(at, 0.35, false);
    if (i === 14 && Math.floor(s / 16) % 2 === 1) hat(at, 0.7, true);

    // bell melody from the chord's scale (sparser over the beat)
    if ((i % 4 === 2 && Math.random() < 0.3) || (i === 7 && Math.random() < 0.15)) {
      bellNote(chord.scale[Math.floor(Math.random() * chord.scale.length)], at, human());
    }
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
      origin = nextTime - step * STEP;
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
    window.dispatchEvent(new CustomEvent('sndr:volume', { detail: { volume } })); // sfx.js follows it
  };

  // the sound gate (sfx.js) was answered "with sound": the music starts at 30%
  window.addEventListener('sndr:sound', (e) => {
    if (!e.detail || !e.detail.on || playing) return;
    setVolume(0.3);
    play();
  });

  // beat clock for sfx.js: seconds until the next grid line, current chord
  window.sndrBeat = {
    step: STEP,
    get playing() { return playing && !!ctx; },
    get volume() { return volume; },
    until(div = 1) {
      if (!playing || !ctx) return 0;
      const g = STEP * div;
      const t = ctx.currentTime - origin;
      return (g - (((t % g) + g) % g)) % g;
    },
    scale() {
      const s = ctx && playing ? Math.floor((ctx.currentTime - origin) / STEP) : 0;
      return CHORDS[Math.floor(Math.max(s, 0) / 16) % CHORDS.length].scale;
    },
  };

  // quieter while a Content Stream spot plays
  // a light dip while a phone spot plays, 4x quieter while a portfolio video is open
  let spotOn = false;
  let videoOn = false;
  const duckTo = () => {
    if (ctx) nodes.duck.gain.setTargetAtTime((spotOn ? 0.8 : 1) * (videoOn ? 0.25 : 1), ctx.currentTime, 0.25);
  };
  window.addEventListener('sndr:spot', (e) => { spotOn = !!(e.detail && e.detail.playing); duckTo(); });
  window.addEventListener('sndr:video', (e) => { videoOn = !!(e.detail && e.detail.open); duckTo(); });

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
