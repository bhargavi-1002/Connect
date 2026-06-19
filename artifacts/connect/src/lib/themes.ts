// ─── Theme Definitions ────────────────────────────────────────────────────────
// Each theme maps to HSL values for CSS custom properties

export interface ThemeDef {
  id: string;
  name: string;
  emoji: string;
  /** HSL values without hsl() wrapper — directly set as CSS custom properties */
  vars: {
    background: string;
    surface: string;
    card: string;
    "card-border": string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    "muted-foreground": string;
    ring: string;
  };
  /** Tailwind gradient for the preview card */
  previewGradient: string;
}

export const THEMES: ThemeDef[] = [
  {
    id: "midnight",
    name: "Midnight",
    emoji: "🌌",
    vars: {
      background: "232 67% 9%",
      surface: "228 58% 14%",
      card: "230 57% 19%",
      "card-border": "230 57% 25%",
      primary: "256 100% 65%",
      secondary: "263 100% 68%",
      accent: "262 100% 77%",
      muted: "229 53% 82%",
      "muted-foreground": "229 53% 60%",
      ring: "256 100% 65%",
    },
    previewGradient: "from-blue-900 via-indigo-900 to-purple-900",
  },
  {
    id: "galaxy",
    name: "Galaxy",
    emoji: "✨",
    vars: {
      background: "280 80% 6%",
      surface: "278 75% 10%",
      card: "276 70% 13%",
      "card-border": "276 70% 20%",
      primary: "290 100% 62%",
      secondary: "305 100% 65%",
      accent: "315 100% 72%",
      muted: "280 50% 80%",
      "muted-foreground": "280 40% 58%",
      ring: "290 100% 62%",
    },
    previewGradient: "from-purple-950 via-fuchsia-900 to-purple-800",
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    vars: {
      background: "20 70% 7%",
      surface: "22 65% 11%",
      card: "24 60% 15%",
      "card-border": "24 60% 22%",
      primary: "25 100% 55%",
      secondary: "350 100% 58%",
      accent: "38 100% 65%",
      muted: "20 50% 78%",
      "muted-foreground": "20 40% 56%",
      ring: "25 100% 55%",
    },
    previewGradient: "from-orange-950 via-red-900 to-rose-800",
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    vars: {
      background: "200 80% 7%",
      surface: "198 75% 11%",
      card: "196 70% 14%",
      "card-border": "196 70% 22%",
      primary: "194 100% 45%",
      secondary: "185 100% 48%",
      accent: "175 100% 55%",
      muted: "200 50% 78%",
      "muted-foreground": "200 40% 56%",
      ring: "194 100% 45%",
    },
    previewGradient: "from-cyan-950 via-teal-900 to-blue-900",
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌿",
    vars: {
      background: "140 60% 6%",
      surface: "138 55% 10%",
      card: "136 50% 13%",
      "card-border": "136 50% 20%",
      primary: "142 70% 42%",
      secondary: "160 65% 42%",
      accent: "120 60% 55%",
      muted: "140 40% 78%",
      "muted-foreground": "140 35% 55%",
      ring: "142 70% 42%",
    },
    previewGradient: "from-green-950 via-emerald-900 to-green-800",
  },
  {
    id: "lavender",
    name: "Lavender",
    emoji: "💜",
    vars: {
      background: "260 60% 9%",
      surface: "258 55% 13%",
      card: "256 52% 17%",
      "card-border": "256 52% 25%",
      primary: "270 70% 58%",
      secondary: "280 65% 62%",
      accent: "290 65% 70%",
      muted: "260 45% 80%",
      "muted-foreground": "260 38% 58%",
      ring: "270 70% 58%",
    },
    previewGradient: "from-violet-950 via-purple-800 to-indigo-800",
  },
  {
    id: "candy",
    name: "Candy",
    emoji: "🍬",
    vars: {
      background: "330 65% 7%",
      surface: "328 60% 11%",
      card: "326 55% 15%",
      "card-border": "326 55% 22%",
      primary: "340 100% 55%",
      secondary: "350 100% 60%",
      accent: "360 100% 68%",
      muted: "330 45% 78%",
      "muted-foreground": "330 38% 56%",
      ring: "340 100% 55%",
    },
    previewGradient: "from-rose-950 via-pink-900 to-red-800",
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    emoji: "🫧",
    vars: {
      background: "310 65% 7%",
      surface: "308 60% 11%",
      card: "306 55% 15%",
      "card-border": "306 55% 22%",
      primary: "316 100% 60%",
      secondary: "328 100% 65%",
      accent: "340 100% 72%",
      muted: "310 45% 80%",
      "muted-foreground": "310 38% 58%",
      ring: "316 100% 60%",
    },
    previewGradient: "from-fuchsia-950 via-pink-800 to-rose-700",
  },
];

export const WALLPAPERS = [
  { id: "none", name: "None", preview: "" },
  { id: "dots", name: "Dots", preview: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)" },
  { id: "grid", name: "Grid", preview: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)" },
  { id: "stars", name: "Stars", preview: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)" },
  { id: "waves", name: "Waves", preview: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)" },
  { id: "bokeh", name: "Bokeh", preview: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.08) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.06) 3px, transparent 3px), radial-gradient(circle at 50% 10%, rgba(255,255,255,0.05) 2px, transparent 2px)" },
  { id: "circuit", name: "Circuit", preview: "linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.03) 26%, transparent 27%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.03) 26%, transparent 27%)" },
  { id: "triangles", name: "Triangles", preview: "linear-gradient(60deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%), linear-gradient(120deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%)" },
];

export type WallpaperId = typeof WALLPAPERS[number]["id"];

export function applyTheme(themeId: string) {
  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const root = document.documentElement;
  root.dataset.theme = themeId;
  (Object.entries(theme.vars) as [string, string][]).forEach(([key, val]) => {
    root.style.setProperty(`--${key}`, val);
  });
  // Sync glow color for primary buttons
  root.style.setProperty("--glow-primary", `hsl(${theme.vars.primary} / 0.4)`);
}

export function getWallpaperStyle(wallpaperId: string, bgSize?: string): import("react").CSSProperties {
  const wp = WALLPAPERS.find(w => w.id === wallpaperId);
  if (!wp || !wp.preview) return {};
  return {
    backgroundImage: wp.preview,
    backgroundSize: bgSize ?? (wallpaperId === "dots" ? "20px 20px" : wallpaperId === "grid" ? "30px 30px" : wallpaperId === "circuit" ? "50px 50px" : wallpaperId === "triangles" ? "30px 52px" : "auto"),
  };
}
