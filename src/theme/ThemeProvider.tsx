import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { StorageService } from "@/src/utils/storage";

import { AppTheme, ThemeMode, getThemeForMode } from "./themes";

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  isUsingSystem: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  useSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const resolveSystemMode = (scheme: ReturnType<typeof useColorScheme>): ThemeMode =>
  scheme === "dark" ? "dark" : "light";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = StorageService.getThemeMode();
    if (stored) {
      return stored;
    }
    return resolveSystemMode(systemScheme);
  });
  const [isUsingSystem, setIsUsingSystem] = useState<boolean>(() => !StorageService.getThemeMode());

  useEffect(() => {
    if (isUsingSystem) {
      setModeState(resolveSystemMode(systemScheme));
    }
  }, [systemScheme, isUsingSystem]);

  const applyMode = useCallback((nextMode: ThemeMode, persist = true) => {
    setModeState(nextMode);
    if (persist) {
      StorageService.saveThemeMode(nextMode);
      setIsUsingSystem(false);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    applyMode(mode === "light" ? "dark" : "light");
  }, [applyMode, mode]);

  const useSystemTheme = useCallback(() => {
    StorageService.clearThemeMode();
    setIsUsingSystem(true);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const theme = getThemeForMode(mode);
    return {
      theme,
      mode,
      isUsingSystem,
      setMode: (nextMode: ThemeMode) => applyMode(nextMode),
      toggleTheme,
      useSystemTheme,
    };
  }, [applyMode, isUsingSystem, mode, toggleTheme, useSystemTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
