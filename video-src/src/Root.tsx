import React from "react";
import { Composition } from "remotion";
import { AdSpot, AdSpotProps } from "./AdSpot";

// 5-second vertical template spots for the Content Stream phones on the site.
// Colors must be 6-digit hex: the component appends alpha (e.g. `${text}22`).
export const spots: { id: string; props: AdSpotProps }[] = [
  {
    id: "ad-01-mobile-app",
    props: {
      kicker: "NEW MOBILE APP",
      words: ["Tap.", "Swipe.", "Grow."],
      info: { type: "bars", values: [35, 55, 72, 100], label: "+320% installs in 30 days" },
      cta: "Download free",
      colors: { bg1: "#120a2e", bg2: "#3b1d8f", accent: "#5ccfe6", accent2: "#9d8cff", text: "#ffffff" },
    },
  },
  {
    id: "ad-02-gambling",
    props: {
      kicker: "MEGA JACKPOT",
      words: ["Spin.", "Win.", "Repeat."],
      info: { type: "counter", to: 500, suffix: "x", label: "Welcome bonus multiplier" },
      cta: "Claim bonus",
      footnote: "18+ · PLAY RESPONSIBLY · TEMPLATE",
      colors: { bg1: "#1a0505", bg2: "#6b0f1a", accent: "#ffd34d", accent2: "#ff5a36", text: "#fff6e0" },
    },
  },
  {
    id: "ad-03-delivery",
    props: {
      kicker: "FOOD DELIVERY",
      words: ["Order.", "Track.", "Enjoy."],
      info: { type: "counter", to: 30, suffix: " min", label: "Average delivery time" },
      cta: "Order now",
      colors: { bg1: "#071a12", bg2: "#0f5c3a", accent: "#ff9a3d", accent2: "#ffd36b", text: "#ffffff" },
    },
  },
  {
    id: "ad-04-cosmetics",
    props: {
      kicker: "GLOW SERUM",
      words: ["Hydrate.", "Restore.", "Glow."],
      info: { type: "ring", percent: 98, label: "saw visible results in 14 days" },
      cta: "Shop the glow",
      colors: { bg1: "#2a0e1f", bg2: "#a3446e", accent: "#ffb3c7", accent2: "#ffd9b8", text: "#fff5f8" },
    },
  },
  {
    id: "ad-05-geo-search",
    props: {
      kicker: "FAMILY LOCATOR",
      words: ["Locate.", "Share.", "Relax."],
      info: { type: "counter", to: 1000000, suffix: "+", label: "families stay connected" },
      cta: "Try it free",
      colors: { bg1: "#04121f", bg2: "#0b4a6e", accent: "#4de0c8", accent2: "#5ccfe6", text: "#ffffff" },
    },
  },
  {
    id: "ad-06-youtube",
    props: {
      kicker: "NEW EPISODE EVERY WEEK",
      words: ["Watch.", "Like.", "Subscribe."],
      info: { type: "bars", values: [20, 45, 70, 100], label: "1M views this month" },
      cta: "Subscribe",
      colors: { bg1: "#140404", bg2: "#5c0b0b", accent: "#ff3b3b", accent2: "#ff8a8a", text: "#ffffff" },
    },
  },
  {
    id: "ad-07-ai-news",
    props: {
      kicker: "AI WORLD NEWS",
      words: ["Models.", "Agents.", "Breakthroughs."],
      info: { type: "ring", percent: 87, label: "of teams now ship with AI" },
      cta: "Read the digest",
      colors: { bg1: "#020a14", bg2: "#0a2a5c", accent: "#39ff9c", accent2: "#5ccfe6", text: "#e9f6ff" },
    },
  },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {spots.map((s) => (
        <Composition
          key={s.id}
          id={s.id}
          component={AdSpot}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={s.props}
        />
      ))}
      {/* 16:9 cuts of the same spots for the portfolio slider */}
      {spots.map((s) => (
        <Composition
          key={`${s.id}-wide`}
          id={`${s.id}-wide`}
          component={AdSpot}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={s.props}
        />
      ))}
    </>
  );
};
