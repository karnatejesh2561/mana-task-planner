import { PropsWithChildren, createContext, useContext, useMemo } from "react";

type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
  secondary: string;
  mint: string;
  amber: string;
  rose: string;
  indigo: string;
  cyan: string;
  shadow: string;

  // Strict ManaTaskTracker colors
  primary: string;
  primaryLt: string;
  primaryDk: string;
  accent1: string;
  accent1Lt: string;
  accent2: string;
  success: string;
  warning: string;
  error: string;

  // Backgrounds
  pageBg: string;
  surface1: string;
  surface2: string;
  surface3: string;
  cardBg: string;
  cardBorder: string;
};

const palette: Palette = {
  background: "#FFFFFF",
  surface: "#F8F7FF", // Surface 1
  surfaceAlt: "#F0EFFE", // Surface 2
  text: "#0F0A1E",
  muted: "#6B7280",
  line: "#EDE9FE", // Card border
  accent: "#7C3AED", // Primary
  secondary: "#A78BFA", // Primary Lt
  mint: "#10B981", // Success
  amber: "#F59E0B", // Warning
  rose: "#EF4444", // Error
  indigo: "#EEF2FF", // Surface 3
  cyan: "#06B6D4", // Accent 1
  shadow: "rgba(124,58,237,0.08)",

  // Strict ManaTaskTracker colors
  primary: "#7C3AED",
  primaryLt: "#A78BFA",
  primaryDk: "#5B21B6",
  accent1: "#06B6D4",
  accent1Lt: "#67E8F9",
  accent2: "#EC4899",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",

  // Backgrounds
  pageBg: "#FFFFFF",
  surface1: "#F8F7FF",
  surface2: "#F0EFFE",
  surface3: "#EEF2FF",
  cardBg: "#FFFFFF",
  cardBorder: "#EDE9FE",
};

export const shadows = {
  card: {
    shadowColor: "#7C3AED",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  button: {
    shadowColor: "#7C3AED",
    shadowOpacity: 0.30,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fab: {
    shadowColor: "#7C3AED",
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  input: {
    shadowColor: "#7C3AED",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  }
};

type AppThemeContextValue = {
  colors: Palette;
  shadows: typeof shadows;
  isDark: boolean;
  toggleTheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const value = useMemo(
    () => ({
      colors: palette,
      shadows,
      isDark: false,
      toggleTheme: () => undefined
    }),
    []
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);
  if (!value) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return value;
}
