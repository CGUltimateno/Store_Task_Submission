import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

export type ToastType = "info" | "success" | "error";

export interface ToastOptions {
  message: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface InternalToast extends ToastOptions {
  id: number;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const DEFAULT_DURATION = 4500;
const ANIMATION_DURATION = 220;

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentToast, setCurrentToast] = useState<InternalToast | null>(null);
  const queueRef = useRef<InternalToast[]>([]);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const animateTo = (toValue: number, callback?: () => void) => {
    Animated.timing(animatedValue, {
      toValue,
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      callback?.();
    });
  };

  const showNextToast = useCallback((toast: InternalToast) => {
    setCurrentToast(toast);
    animateTo(1);
    clearTimer();
    hideTimerRef.current = setTimeout(() => {
      animateTo(0, () => {
        setCurrentToast(null);
        const next = queueRef.current.shift();
        if (next) {
          showNextToast(next);
        }
      });
    }, toast.duration);
  }, [animateTo]);

  const hideToast = useCallback(() => {
    if (!currentToast) {
      return;
    }
    clearTimer();
    animateTo(0, () => {
      setCurrentToast(null);
      const next = queueRef.current.shift();
      if (next) {
        showNextToast(next);
      }
    });
  }, [animateTo, currentToast, showNextToast]);

  const showToast = useCallback((options: ToastOptions) => {
    const toast: InternalToast = {
      id: Date.now(),
      message: options.message,
      type: options.type ?? "info",
      actionLabel: options.actionLabel,
      onAction: options.onAction,
      duration: options.duration ?? DEFAULT_DURATION,
    };

    if (currentToast) {
      queueRef.current.push(toast);
      hideToast();
    } else {
      showNextToast(toast);
    }
  }, [currentToast, hideToast, showNextToast]);

  const contextValue = useMemo<ToastContextValue>(() => ({
    showToast,
    hideToast,
  }), [hideToast, showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastRenderer toast={currentToast} animatedValue={animatedValue} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

interface ToastRendererProps {
  toast: InternalToast | null;
  animatedValue: Animated.Value;
  onHide: () => void;
}

const ToastRenderer: React.FC<ToastRendererProps> = ({ toast, animatedValue, onHide }) => {
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();

  if (!toast) {
    return null;
  }

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });
  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const backgroundColor = (() => {
    switch (toast.type) {
      case "success":
        return theme.colors.accent;
      case "error":
        return theme.colors.destructive;
      default:
        return theme.colors.toastBackground;
    }
  })();

  const textColor = toast.type === "info" ? theme.colors.toastText : theme.colors.accentContrast;
  const actionColor = toast.type === "info" ? theme.colors.toastAction : theme.colors.accentContrast;

  const animatedStyles = useMemo(
    () => [
      styles.toast,
      {
        backgroundColor,
        opacity,
        transform: [{ translateY }],
        shadowColor: theme.colors.shadow,
      },
    ],
    [backgroundColor, opacity, theme.colors.shadow, translateY],
  );

  return (
    <View pointerEvents="box-none" style={[styles.container, { top: top + 14 }]}>
      <Animated.View
        style={animatedStyles as Animated.WithAnimatedValue<StyleProp<ViewStyle>>}
      >
        <Text style={[styles.message, { color: textColor }]}>{toast.message}</Text>
        {toast.actionLabel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={toast.actionLabel}
            onPress={() => {
              toast.onAction?.();
              onHide();
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.action,
              {
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.actionText, { color: actionColor }]}>{toast.actionLabel}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  action: {
    marginLeft: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
