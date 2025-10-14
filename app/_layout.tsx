import { HttpError, getCurrentUser } from "@/src/api/auth";
import { BiometricModal } from "@/src/components/BiometricModal";
import LockScreen from "@/src/components/LockScreen";
import OfflineBanner from "@/src/components/OfflineBanner";
import { ToastProvider } from "@/src/components/ToastProvider";
import { useIdle } from "@/src/hooks/useIdle";
import { store, useAppDispatch, useAppSelector } from "@/src/store";
import { clearSession, restoreSession } from "@/src/store/authSlice";
import { ThemeProvider, useTheme } from "@/src/theme";
import { queryClient, queryClientPersistOptions } from "@/src/utils/queryClient";
import { StorageService } from "@/src/utils/storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as LocalAuthentication from "expo-local-authentication";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";

let isAppInitialized = false;

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { isIdle, markActive } = useIdle(10000);
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string>("");
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        if (!showBiometric && (isAuthenticated || hasStoredSession) && segments[0] !== "login") {
          setIsLocked(true);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [showBiometric, isAuthenticated, hasStoredSession, segments]);

  useEffect(() => {
    if (isIdle && !showBiometric && (isAuthenticated || hasStoredSession) && segments[0] !== "login") {
      setIsLocked(true);
    }
  }, [isIdle, isAuthenticated, hasStoredSession, showBiometric, segments]);

  useEffect(() => {
    if (!isAppInitialized) {
      checkSession();
      isAppInitialized = true;
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!prevAuthRef.current && isAuthenticated) {
      markActive();
      setIsLocked(false);
    }

    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, markActive]);

  useEffect(() => {
    if (isAuthenticated) {
      setHasStoredSession(true);
      return;
    }

    const token = StorageService.getToken();
    const username = StorageService.getUsername();
    const hasSession = !!(token && username);
    setHasStoredSession(hasSession);

    if (!hasSession) {
      setIsLocked(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading || showBiometric || isLocked) {
      return;
    }

    const inAuthGroup = segments[0] === "login";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && (inAuthGroup || segments.length === 0)) {
      router.replace("/products");
    }
  }, [isAuthenticated, segments, isLoading, router, showBiometric, isLocked]);

  const handleUnlock = async () => {
    if (isAuthenticating) {
      return;
    }
    setIsAuthenticating(true);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (hasHardware) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Unlock with Biometrics",
          fallbackLabel: "Enter Password",
        });

        if (result.success) {
          setIsLocked(false);
          markActive();
        } else {
          StorageService.clearAuth();
          dispatch(clearSession());
          setHasStoredSession(false);
          setIsLocked(false);
          markActive();
          router.replace("/login");
        }
      } else {
        StorageService.clearAuth();
        dispatch(clearSession());
        setHasStoredSession(false);
        setIsLocked(false);
        markActive();
        router.replace("/login");
      }
    } catch (error) {
      StorageService.clearAuth();
      dispatch(clearSession());
      setHasStoredSession(false);
      setIsLocked(false);
      markActive();
      router.replace("/login");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const checkSession = async () => {
    const token = StorageService.getToken();
    const username = StorageService.getUsername();
    const hasSession = !!(token && username);

    setHasStoredSession(hasSession);

    if (hasSession) {
      setPendingUsername(username);
      setShowBiometric(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setIsLocked(false);
    }
  };

  const handleBiometricSuccess = async () => {
    setShowBiometric(false);
    setIsLoading(true);

    const token = StorageService.getToken();
    const username = StorageService.getUsername();
    const cachedUserData = StorageService.getUserData();

    if (!token || !username) {
      StorageService.clearAuth();
      dispatch(clearSession());
      setHasStoredSession(false);
      setIsLoading(false);
      setIsLocked(false);
      router.replace("/login");
      return;
    }

    try {
      const freshUserData = await getCurrentUser(token);
      StorageService.saveUserData(freshUserData);
      dispatch(restoreSession({ token, username, userData: freshUserData }));
      setHasStoredSession(true);
      setIsLocked(false);
      markActive();
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        StorageService.clearAuth();
        dispatch(clearSession());
        setHasStoredSession(false);
        setIsLocked(false);
        setIsLoading(false);
        router.replace("/login");
        return;
      }

      if (cachedUserData) {
        dispatch(restoreSession({ token, username, userData: cachedUserData }));
        setHasStoredSession(true);
        setIsLocked(false);
        markActive();
      } else {
        StorageService.clearAuth();
        dispatch(clearSession());
        setHasStoredSession(false);
        setIsLocked(false);
        setIsLoading(false);
        router.replace("/login");
        return;
      }
    }

    setIsLoading(false);
  };

  const handleBiometricCancel = () => {
    StorageService.clearAuth();
    dispatch(clearSession());
    setHasStoredSession(false);
    setShowBiometric(false);
    setIsLoading(false);
    markActive();
    setIsLocked(false);
    router.replace("/login");
  };

  const handleFallbackToPassword = () => {
    StorageService.clearAuth();
    dispatch(clearSession());
    setHasStoredSession(false);
    setShowBiometric(false);
    setIsLoading(false);
    markActive();
    setIsLocked(false);
    router.replace("/login");
  };

  const handleUserInteraction = useCallback(() => {
    if (isLocked || showBiometric) {
      return;
    }
    markActive();
  }, [isLocked, showBiometric, markActive]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const shouldShowLockScreen = isLocked && (isAuthenticated || hasStoredSession);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["left", "right", "top"]}>
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
      <OfflineBanner />
      <View
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        onTouchStart={handleUserInteraction}
        onTouchEnd={handleUserInteraction}
        onTouchMove={handleUserInteraction}
      >
        <Stack screenOptions={{ headerShown: false }} />
        <BiometricModal
          visible={showBiometric}
          username={pendingUsername}
          onSuccess={handleBiometricSuccess}
          onCancel={handleBiometricCancel}
          onFallbackToPassword={handleFallbackToPassword}
        />
      </View>
      {shouldShowLockScreen ? <LockScreen onUnlock={handleUnlock} /> : null}
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistQueryClientProvider client={queryClient} persistOptions={queryClientPersistOptions}>
            <ToastProvider>
              <RootLayoutNav />
            </ToastProvider>
          </PersistQueryClientProvider>
        </Provider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
