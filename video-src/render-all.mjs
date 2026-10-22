// Renders every spot from src/Root.tsx, adds a synthesized per-theme
// soundtrack and writes web-ready 540x960 files to ../assets/video/stream/<id>.mp4
//   node render-all.mjs                    -> all spots (video + sound)
//   node render-all.mjs ad-02              -> only ids containing "ad-02"
//   node render-all.mjs wide               -> only the 16:9 portfolio cuts
//   node render-all.mjs --audio-only [id]  -> keep the rendered picture, replace the sound
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, renameSync } from "node:fs";

const args = process.argv.slice(2);
const audioOnly = args.includes("--audio-only");
const filter = args.find((a) => !a.startsWith("--"));
const outDir = "../assets/video/stream";
mkdirSync("out", { recursive: true });
mkdirSync(outDir, { recursive: true });
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

/* ---------- tiny synth vocabulary for ffmpeg aevalsrc (t = seconds, 5s clip) ---------- */
const on = (o) => `gte(t,${o})`;
const since = (o) => `max(t-${o},0)`;
const kick = (P, o = 0, a = 0.8) => {
  const m = `mod(t-${o},${P})`;
  return `${a}*${on(o)}*sin(2*PI*(45*${m}+110/30*(1-exp(-30*${m}))))*exp(-7*${m})`;
};
const noiseHit = (P, o, k, a) => `${a}*${on(o)}*(random(0)*2-1)*exp(-${k}*mod(t-${o},${P}))`;
const tone = (f, P, o, k, a) => `${a}*${on(o)}*sin(2*PI*${f}*t)*exp(-${k}*mod(t-${o},${P}))`;
// one bell strike at time o (with an inharmonic partial)
const bell = (f, o, k, a) =>
  `${a}*${on(o)}*(sin(2*PI*${f}*${since(o)})+0.4*sin(2*PI*${f * 2.76}*${since(o)}))*exp(-${k}*${since(o)})`;
const between = (a, b, expr) => `between(t,${a},${b})*(${expr})`;
const swoosh = (c, w, a) => `${a}*(random(1)*2-1)*exp(-pow((t-${c})/${w},2))`;
// rising "pop" blip at time o
const pop = (o, f0, f1, a) =>
  `${a}*${on(o)}*sin(2*PI*(${f0}*${since(o)}+${(f1 - f0) / 0.24}*pow(${since(o)},2)))*exp(-14*${since(o)})`;
const hash = (rate) => `mod(abs(sin(floor(t*${rate})*12.9898)*43758.5453),1)`;
// arpeggio: semitone steps over a base note, `rate` notes per second
const arp = (base, steps, rate, k, a) => {
  const K = `mod(floor(t*${rate}),${steps.length})`;
  const semis = steps.map((s, i) => `eq(${K},${i})*${s}`).join("+");
  return `${a}*sin(2*PI*${base}*pow(2,(${semis})/12)*t)*exp(-${k}*mod(t,${1 / rate}))`;
};
const sum = (...parts) => parts.join("+");

const designs = {
  // bright tech-pop: tap, plucky arpeggio, success chime under the CTA
  "ad-01-mobile-app": sum(
    bell(1800, 0.05, 30, 0.18),
    kick(0.5, 0, 0.7),
    noiseHit(0.5, 0.25, 40, 0.12),
    arp(523, [0, 4, 7, 11, 12, 11, 7, 4], 8, 16, 0.12),
    bell(1046, 3.33, 4, 0.14), bell(1318, 3.39, 4, 0.12), bell(1568, 3.45, 4, 0.12),
  ),
  // slot reel ticks + coin chimes, then a jackpot fanfare and a coin shower
  "ad-02-gambling": sum(
    between(0, 2.7, noiseHit(0.07, 0, 120, 0.1)),
    between(0.2, 2.7, tone(2093, 0.3, 0.2, 10, 0.1)),
    kick(0.5, 0, 0.55),
    `0.12*${on(3.33)}*(sin(2*PI*523*t)+sin(2*PI*659*t)+sin(2*PI*784*t))*exp(-1.4*${since(3.33)})`,
    between(3.33, 4.7, tone(2637, 0.09, 3.33, 25, 0.08)),
  ),
  // upbeat 128 bpm with a bike bell, whoosh and pop
  "ad-03-delivery": sum(
    kick(0.469, 0, 0.75),
    noiseHit(0.469, 0.234, 60, 0.09),
    bell(2400, 0.15, 6, 0.2), bell(2400, 0.42, 6, 0.2),
    swoosh(3.15, 0.12, 0.25),
    pop(3.33, 400, 1600, 0.35),
  ),
  // airy pad with shimmer sparkles and a rising glissando, soft pulse
  "ad-04-cosmetics": sum(
    `0.045*(sin(2*PI*392*t)+sin(2*PI*494*t)+sin(2*PI*587*t)+sin(2*PI*740*t))*(1-exp(-1.5*t))*(0.8+0.2*sin(2*PI*0.7*t))`,
    `0.06*sin(2*PI*(1800+1400*${hash(5)})*t)*exp(-8*mod(t,0.2))`,
    kick(1, 0, 0.35),
    `0.14*${on(3.33)}*sin(2*PI*(1200*${since(3.33)}+900*pow(${since(3.33)},2)))*exp(-2.2*${since(3.33)})`,
  ),
  // sonar pings with echo over a deep pulse, double ping at the CTA
  "ad-05-geo-search": sum(
    tone(1250, 1.25, 0, 3, 0.22),
    tone(1250, 1.25, 0.3, 4, 0.09),
    `0.45*sin(2*PI*55*t)*exp(-4*mod(t,1.25))`,
    bell(1500, 3.33, 5, 0.2), bell(1500, 3.52, 5, 0.16),
  ),
  // 90 bpm hip-hop: kick, snare, hats, sub; subscribe click + chime
  "ad-06-youtube": sum(
    kick(0.667, 0, 0.85),
    noiseHit(0.667, 0.333, 18, 0.3),
    tone(200, 0.667, 0.333, 20, 0.2),
    noiseHit(0.1667, 0, 80, 0.06),
    `0.25*sin(2*PI*49*t)*exp(-3*mod(t,0.667))`,
    pop(3.3, 600, 1400, 0.3), bell(1568, 3.38, 5, 0.16),
  ),
  // digital glitch bleeps, detuned drone, data stutter; news sting
  "ad-07-ai-news": sum(
    `0.07*sgn(sin(2*PI*(400+1200*${hash(8)})*t))*lt(mod(t,0.125),0.06)`,
    `0.08*(sin(2*PI*110*t)+sin(2*PI*110.6*t))`,
    noiseHit(0.25, 0, 60, 0.08),
    kick(0.5, 0, 0.6),
    bell(880, 3.33, 3, 0.18), bell(1320, 3.48, 3, 0.15),
  ),
};

// "-wide" (16:9, portfolio slider) cuts share the sound of their vertical spot
const designFor = (id) => designs[id.replace(/-wide$/, "")];

const soundtrack = (id) => {
  const mix = designFor(id);
  return `aevalsrc=exprs='${mix}|${mix}':s=44100:d=5`;
};

const muxAudio = (videoIn, id, out) => {
  execFileSync(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      "-i", videoIn,
      "-f", "lavfi", "-i", soundtrack(id),
      "-filter_complex", "[1:a]highpass=f=30,lowpass=f=2600,highshelf=f=1800:g=-6,loudnorm=I=-17:TP=-2:LRA=11,aresample=44100,alimiter=limit=0.9,afade=t=in:d=0.02,afade=t=out:st=4.6:d=0.4[a]",
      "-map", "0:v", "-map", "[a]",
      "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart", "-shortest",
      out,
    ],
    { stdio: "inherit" },
  );
};

const ids = [...Object.keys(designs), ...Object.keys(designs).map((id) => `${id}-wide`)];
for (const id of ids) {
  if (filter && !id.includes(filter)) continue;
  console.log(`=== ${id}`);
  const final = `${outDir}/${id}.mp4`;
  if (audioOnly) {
    const tmp = `out/${id}.resound.mp4`;
    muxAudio(final, id, tmp);
    renameSync(tmp, final);
    continue;
  }
  const silent = `out/${id}.silent.mp4`;
  execFileSync(
    npx,
    ["remotion", "render", id, silent, "--scale=0.5", "--crf=24", "--muted", "--log=error"],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  muxAudio(silent, id, final);
  rmSync(silent);
  // poster frame (end of the spot: CTA on screen) for lazy-loaded <video>
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "4.2", "-i", final, "-frames:v", "1", "-q:v", "5", `${outDir}/${id}.jpg`], { stdio: "inherit" });
}
console.log("Done.");
