import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppTheme, useTheme } from "@/src/theme";

const OfflineBanner = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>You're offline. Some features may be unavailable.</Text>
    </View>
  );
};

export default OfflineBanner;

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.offlineBannerBackground,
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    text: {
      color: theme.colors.offlineBannerText,
      fontSize: 14,
      fontWeight: "600",
    },
  });
