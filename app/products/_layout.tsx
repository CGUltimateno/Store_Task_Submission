import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppDispatch } from "@/src/store";
import { logout } from "@/src/store/authSlice";
import { useTheme } from "@/src/theme";

const TAB_ICON_SIZE = 24;
const stylesDefaults = {
  activeColor: "#007AFF",
  inactiveColor: "#8E8E93",
};

export default function ProductsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: stylesDefaults.activeColor,
        tabBarInactiveTintColor: stylesDefaults.inactiveColor,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const handleLogout = useCallback(() => {
    dispatch(logout());
    queryClient.clear();
    router.replace("/login");
  }, [dispatch, queryClient, router]);

  const paddingBottom = insets.bottom > 0 ? insets.bottom + 6 : 14;
  const containerHeight = (Platform.OS === "ios" ? 64 : 60) + paddingBottom;

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          paddingBottom,
          height: containerHeight,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = resolveLabel(route.name, options.title, options.tabBarLabel);
        const isFocused = state.index === index;
        const color = isFocused ? theme.colors.accent : theme.colors.secondaryText;

        const icon =
          options.tabBarIcon?.({ focused: isFocused, color, size: TAB_ICON_SIZE }) ?? (
            <Ionicons
              name={isFocused ? "ellipse" : "ellipse-outline"}
              size={TAB_ICON_SIZE}
              color={color}
            />
          );

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.85}
          >
            {icon}
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        accessibilityRole="button"
        onPress={handleLogout}
        style={styles.logoutButton}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={TAB_ICON_SIZE} color={theme.colors.destructive} />
        <Text style={[styles.logoutLabel, { color: theme.colors.destructive }]}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const resolveLabel = (routeName: string, title?: string, tabBarLabel?: React.ReactNode): string => {
  if (typeof tabBarLabel === "string") {
    return tabBarLabel;
  }

  if (typeof title === "string") {
    return title;
  }

  return routeName;
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    paddingHorizontal: 12,
  paddingTop: 14,
    gap: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  logoutButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    color: "#FF3B30",
  },
});
