export type ThemeMode = "light" | "dark";

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    background: string;
    backgroundGradientStart: string;
    backgroundGradientEnd: string;
    surface: string;
    surfaceElevated: string;
    card: string;
    cardHighlight: string;
    overlay: string;
    primaryText: string;
    secondaryText: string;
    tertiaryText: string;
    muted: string;
    border: string;
    borderSubtle: string;
    accent: string;
    accentSecondary: string;
    accentContrast: string;
    success: string;
    successContrast: string;
    destructive: string;
    destructiveContrast: string;
    warning: string;
    warningContrast: string;
    bannerBackground: string;
    bannerText: string;
    offlineBannerBackground: string;
    offlineBannerText: string;
    toastBackground: string;
    toastText: string;
    toastAction: string;
    tabBarBackground: string;
    tabBarBorder: string;
    inputBackground: string;
    inputBorder: string;
    inputPlaceholder: string;
    shadow: string;
    shimmer: string;
  };
  typography: {
    displayLarge: number;
    displayMedium: number;
    titleLarge: number;
    titleMedium: number;
    titleSmall: number;
    bodyLarge: number;
    bodyMedium: number;
    bodySmall: number;
    labelLarge: number;
    labelMedium: number;
    labelSmall: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
}

const base = {
  shadow: "#000000",
  typography: {
    displayLarge: 36,
    displayMedium: 32,
    titleLarge: 28,
    titleMedium: 22,
    titleSmall: 18,
    bodyLarge: 17,
    bodyMedium: 15,
    bodySmall: 13,
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 11,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

export const lightTheme: AppTheme = {
  mode: "light",
  colors: {
    background: "#FAFBFC",
    backgroundGradientStart: "#FFFFFF",
    backgroundGradientEnd: "#F5F7FA",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    card: "#FFFFFF",
    cardHighlight: "#F8F9FB",
    overlay: "rgba(17, 24, 39, 0.5)",
    primaryText: "#0F172A",
    secondaryText: "#475569",
    tertiaryText: "#64748B",
    muted: "#94A3B8",
    border: "#E2E8F0",
    borderSubtle: "#F1F5F9",
    accent: "#6366F1",
    accentSecondary: "#8B5CF6",
    accentContrast: "#FFFFFF",
    success: "#10B981",
    successContrast: "#FFFFFF",
    destructive: "#EF4444",
    destructiveContrast: "#FFFFFF",
    warning: "#F59E0B",
    warningContrast: "#FFFFFF",
    bannerBackground: "#F8FAFC",
    bannerText: "#1E293B",
    offlineBannerBackground: "#FEF3C7",
    offlineBannerText: "#92400E",
    toastBackground: "#1E293BF5",
    toastText: "#F8FAFC",
    toastAction: "#A5B4FC",
    tabBarBackground: "#FFFFFF",
    tabBarBorder: "#E2E8F0",
    inputBackground: "#F8FAFC",
    inputBorder: "#E2E8F0",
    inputPlaceholder: "#94A3B8",
    shadow: base.shadow,
    shimmer: "#F1F5F9",
  },
  typography: base.typography,
  spacing: base.spacing,
  borderRadius: base.borderRadius,
};

export const darkTheme: AppTheme = {
  mode: "dark",
  colors: {
    background: "#0A0E1A",
    backgroundGradientStart: "#0F172A",
    backgroundGradientEnd: "#0A0E1A",
    surface: "#1E293B",
    surfaceElevated: "#334155",
    card: "#1E293B",
    cardHighlight: "#334155",
    overlay: "rgba(0, 0, 0, 0.7)",
    primaryText: "#F8FAFC",
    secondaryText: "#CBD5E1",
    tertiaryText: "#94A3B8",
    muted: "#64748B",
    border: "#334155",
    borderSubtle: "#1E293B",
    accent: "#818CF8",
    accentSecondary: "#A78BFA",
    accentContrast: "#0F172A",
    success: "#34D399",
    successContrast: "#0F172A",
    destructive: "#F87171",
    destructiveContrast: "#0F172A",
    warning: "#FBBF24",
    warningContrast: "#0F172A",
    bannerBackground: "#1E293B",
    bannerText: "#E2E8F0",
    offlineBannerBackground: "#92400E",
    offlineBannerText: "#FEF3C7",
    toastBackground: "#0F172AF5",
    toastText: "#F8FAFC",
    toastAction: "#A5B4FC",
    tabBarBackground: "#1E293B",
    tabBarBorder: "#334155",
    inputBackground: "#0F172A",
    inputBorder: "#334155",
    inputPlaceholder: "#64748B",
    shadow: base.shadow,
    shimmer: "#334155",
  },
  typography: base.typography,
  spacing: base.spacing,
  borderRadius: base.borderRadius,
};

export const getThemeForMode = (mode: ThemeMode): AppTheme => (mode === "dark" ? darkTheme : lightTheme);
