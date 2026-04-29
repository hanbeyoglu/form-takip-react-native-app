export const colors = {
  background: "#F4F6FC",
  backgroundSecondary: "#EAEFFD",
  surface: "#FFFFFF",
  surfaceElevated: "#FCFDFF",
  surfaceMuted: "#F3F4FB",
  primary: "#5B57E8",
  primaryDeep: "#4840D7",
  primaryGlow: "#7C83FF",
  primarySoft: "#ECEBFF",
  primaryMuted: "#D7D7FF",
  onPrimary: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#667085",
  textMuted: "#98A0B3",
  borderSoft: "#DFE5F2",
  borderStrong: "#CBD5E6",
  border: "#D6DEEC",
  success: "#1FA971",
  warning: "#D79A19",
  danger: "#D1435B",
  shadowBase: "#1B2559",
  overlay: "rgba(17, 24, 39, 0.22)"
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl2: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999
} as const;

export const typography = {
  pageTitle: 30,
  heroMetric: 46,
  cardMetric: 32,
  sectionTitle: 18,
  title: 22,
  subtitle: 17,
  body: 15,
  bodyStrong: 15,
  caption: 12,
  helper: 12,
  button: 15,
  metric: 28
} as const;

export const shadows = {
  shadowSmall: {
    shadowColor: colors.shadowBase,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2
  },
  shadowCard: {
    shadowColor: colors.shadowBase,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5
  },
  shadowHero: {
    shadowColor: colors.shadowBase,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.18,
    shadowRadius: 34,
    elevation: 11
  }
} as const;
