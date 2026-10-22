import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadPoppins("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

export type Infographic =
  | { type: "bars"; values: number[]; label: string }
  | { type: "ring"; percent: number; label: string }
  | { type: "counter"; to: number; suffix: string; label: string };

export type AdSpotProps = {
  kicker: string;
  words: [string, string, string];
  info: Infographic;
  cta: string;
  footnote?: string;
  colors: { bg1: string; bg2: string; accent: string; accent2: string; text: string };
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- parallax background: 3 depth layers drifting at different speeds ---------- */
const ParallaxBg: React.FC<{ colors: AdSpotProps["colors"] }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  // slow camera push-in over the whole spot
  const camera = interpolate(p, [0, 1], [1, 1.12]);

  const far = Array.from({ length: 14 }, (_, i) => i);
  const mid = Array.from({ length: 6 }, (_, i) => i);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 70% at 20% 10%, ${colors.bg2} 0%, ${colors.bg1} 70%)`,
        transform: `scale(${camera})`,
      }}
    >
      {/* far layer: grid + small dots, barely moves */}
      <AbsoluteFill
        style={{
          transform: `translateY(${-p * 60}px)`,
          backgroundImage: `linear-gradient(${colors.text}10 2px, transparent 2px), linear-gradient(90deg, ${colors.text}10 2px, transparent 2px)`,
          backgroundSize: "90px 90px",
          opacity: 0.5,
        }}
      />
      {far.map((i) => (
        <div
          key={`f${i}`}
          style={{
            position: "absolute",
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            width: 10 + (i % 3) * 6,
            height: 10 + (i % 3) * 6,
            borderRadius: "50%",
            background: colors.text,
            opacity: 0.25,
            transform: `translateY(${-p * 120}px)`,
          }}
        />
      ))}
      {/* mid layer: big soft blobs */}
      {mid.map((i) => (
        <div
          key={`m${i}`}
          style={{
            position: "absolute",
            left: `${(i * 29 + 5) % 90}%`,
            top: `${(i * 41 + 10) % 95}%`,
            width: 320 + (i % 3) * 120,
            height: 320 + (i % 3) * 120,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${i % 2 ? colors.accent : colors.accent2}, transparent 70%)`,
            filter: "blur(30px)",
            opacity: 0.55,
            transform: `translate(${Math.sin(frame / 40 + i) * 40}px, ${-p * 320}px)`,
          }}
        />
      ))}
      {/* near layer: rings sweeping past the camera */}
      {[0, 1, 2].map((i) => (
        <div
          key={`n${i}`}
          style={{
            position: "absolute",
            left: `${[70, -15, 55][i]}%`,
            top: `${[8, 55, 80][i]}%`,
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: `14px solid ${i === 1 ? colors.accent2 : colors.accent}`,
            opacity: 0.35,
            transform: `translateY(${-p * 700}px) rotate(${frame * (i % 2 ? -0.6 : 0.6)}deg) scale(${1 + p * 0.4})`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ---------- kinetic headline: each word zooms in from the camera, then swaps ---------- */
const KineticWords: React.FC<{ words: AdSpotProps["words"]; colors: AdSpotProps["colors"] }> = ({
  words,
  colors,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const landscape = width > height; // 16:9 portfolio cut: words sit in the left half
  const slot = 36; // frames per word
  return (
    <>
      {words.map((word, i) => {
        const start = 12 + i * slot;
        const local = frame - start;
        const isLast = i === words.length - 1;
        const zoom = interpolate(local, [0, 14], [2.6, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const blur = interpolate(local, [0, 12], [18, 0], clamp);
        const inO = interpolate(local, [0, 8], [0, 1], clamp);
        // non-final words fly past the camera when the next one arrives
        const outZoom = isLast ? 1 : interpolate(local, [slot - 8, slot], [1, 0.4], clamp);
        const outO = isLast ? 1 : interpolate(local, [slot - 8, slot], [1, 0], clamp);
        if (local < 0 || (!isLast && local > slot)) return null;
        return (
          <div
            key={word}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: landscape ? "46%" : 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // long words shrink so they stay inside the side margins
              fontSize: landscape
                ? Math.min(170, Math.floor(1250 / word.length))
                : Math.min(190, Math.floor(1500 / word.length)),
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: colors.text,
              textShadow: `0 10px 40px ${colors.accent}aa`,
              transform: `translateY(${landscape ? -40 : -260}px) scale(${zoom * outZoom})`,
              filter: `blur(${blur}px)`,
              opacity: inO * outO,
            }}
          >
            {word}
          </div>
        );
      })}
    </>
  );
};

/* ---------- infographic ---------- */
const InfoBlock: React.FC<{ info: Infographic; colors: AdSpotProps["colors"] }> = ({ info, colors }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const landscape = width > height;
  const start = 40;
  const enter = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const grow = interpolate(frame, [start, start + 45], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  let body: React.ReactNode = null;
  if (info.type === "bars") {
    body = (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, height: 300 }}>
        {info.values.map((v, i) => (
          <div
            key={i}
            style={{
              width: 90,
              height: `${v * interpolate(frame, [start + i * 5, start + 35 + i * 5], [0, 1], clamp)}%`,
              borderRadius: 18,
              background: `linear-gradient(180deg, ${colors.accent}, ${colors.accent2})`,
              boxShadow: `0 0 40px ${colors.accent}66`,
            }}
          />
        ))}
      </div>
    );
  } else if (info.type === "ring") {
    const r = 140;
    const c = 2 * Math.PI * r;
    body = (
      <div style={{ position: "relative", width: 340, height: 340 }}>
        <svg width={340} height={340} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={170} cy={170} r={r} stroke={`${colors.text}22`} strokeWidth={30} fill="none" />
          <circle
            cx={170}
            cy={170}
            r={r}
            stroke={colors.accent}
            strokeWidth={30}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - (info.percent / 100) * grow)}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 96,
            fontWeight: 800,
            color: colors.text,
          }}
        >
          {Math.round(info.percent * grow)}%
        </div>
      </div>
    );
  } else {
    body = (
      <div style={{ fontSize: 210, fontWeight: 800, color: colors.text, lineHeight: 1, letterSpacing: "-0.04em" }}>
        {Math.round(info.to * grow).toLocaleString("en-US")}
        <span style={{ color: colors.accent }}>{info.suffix}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: landscape ? "55%" : 80,
        right: landscape ? 100 : 80,
        top: landscape ? 230 : 980,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 30,
        padding: "50px 40px",
        borderRadius: 48,
        background: `${colors.bg1}aa`,
        border: `3px solid ${colors.text}22`,
        transform: `translateY(${(1 - enter) * 160}px) scale(${0.85 + enter * 0.15})`,
        opacity: enter,
      }}
    >
      {body}
      <div style={{ fontSize: 46, fontWeight: 500, color: `${colors.text}cc`, textAlign: "center" }}>{info.label}</div>
    </div>
  );
};

export const AdSpot: React.FC<AdSpotProps> = ({ kicker, words, info, cta, footnote, colors }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const landscape = width > height;

  const kickerO = interpolate(frame, [0, 10], [0, 1], clamp);
  const kickerX = interpolate(frame, [0, 14], [-80, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const ctaIn = spring({ frame: frame - 100, fps, config: { damping: 10, stiffness: 120 } });
  const pulse = 1 + Math.sin((frame - 100) / 4) * 0.03 * (frame > 110 ? 1 : 0);
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0.85], clamp);

  return (
    <AbsoluteFill style={{ fontFamily, overflow: "hidden", opacity: fadeOut }}>
      <ParallaxBg colors={colors} />

      <div
        style={{
          position: "absolute",
          top: landscape ? 80 : 150,
          left: 80,
          right: 80,
          fontSize: 50,
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: colors.accent,
          opacity: kickerO,
          transform: `translateX(${kickerX}px)`,
          textAlign: "center",
        }}
      >
        {kicker}
      </div>

      <KineticWords words={words} colors={colors} />
      <InfoBlock info={info} colors={colors} />

      <div
        style={{
          position: "absolute",
          bottom: landscape ? 150 : 230,
          left: 0,
          right: landscape ? "46%" : 0,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${ctaIn * pulse})`,
        }}
      >
        <div
          style={{
            padding: "34px 80px",
            borderRadius: 999,
            fontSize: 64,
            fontWeight: 800,
            color: colors.bg1,
            background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent2})`,
            boxShadow: `0 20px 60px ${colors.accent}88`,
          }}
        >
          {cta}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: landscape ? 50 : 110,
          left: 80,
          right: 80,
          textAlign: "center",
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: "0.12em",
          color: `${colors.text}99`,
        }}
      >
        {footnote ?? "SNDR STUDIO · TEMPLATE"}
      </div>
    </AbsoluteFill>
  );
};
