import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/src/theme";

interface ThemeToggleProps {
  size?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 36 }) => {
  const { theme, mode, toggleTheme, useSystemTheme, isUsingSystem } = useTheme();

  const iconName = mode === "dark" ? "sunny" : "moon";
  const nextLabel = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const longPressLabel = isUsingSystem
    ? "Theme follows system appearance"
    : "Hold to revert to system appearance";

  const buttonStyle = useMemo(
    () => [
      styles.button,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow,
      },
    ],
    [size, theme.colors.border, theme.colors.card, theme.colors.shadow],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={nextLabel}
      accessibilityHint="Hold to let the app match the device theme"
      onPress={toggleTheme}
      onLongPress={() => {
        if (!isUsingSystem) {
          useSystemTheme();
        }
      }}
      style={({ pressed }) => [
        ...buttonStyle,
        { opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={20} color={theme.colors.primaryText} accessibilityLabel={longPressLabel} />
      </View>
    </Pressable>
  );
};

export default ThemeToggle;

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
