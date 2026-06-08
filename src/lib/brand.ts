export const BRAND_COLORS = {
  limeGreen: "#588157",
  oliveGreen: "#819171",
  charcoalGreen: "#344e41",
  deepTeal: "#073b4c",
  steelTeal: "#28666e",
  platinum: "#E8EAE6",
  nightForest: "#1A2B24",
} as const;

export const BRAND_CHART_COLORS = [
  BRAND_COLORS.steelTeal,
  BRAND_COLORS.limeGreen,
  BRAND_COLORS.oliveGreen,
  BRAND_COLORS.deepTeal,
  BRAND_COLORS.charcoalGreen,
] as const;
