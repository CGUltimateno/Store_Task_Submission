import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { useCallback, useEffect, useRef, useState } from "react";

interface NetworkStatusOptions {
  pollInterval?: number;
}

export const useNetworkStatus = ({ pollInterval = 5000 }: NetworkStatusOptions = {}) => {
  const [isOffline, setIsOffline] = useState(false);
  const lastKnownOffline = useRef(isOffline);
  const stabilizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitState = useCallback((offline: boolean) => {
    lastKnownOffline.current = offline;
    setIsOffline(offline);
    onlineManager.setOnline(!offline);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const applyState = (connected: boolean | null | undefined, reachable: boolean | null | undefined) => {
      if (!isMounted) {
        return;
      }
      const online = connected === true && reachable !== false;
      const nextOffline = !online;

      if (nextOffline === lastKnownOffline.current) {
        return;
      }

      if (nextOffline) {
        if (stabilizeTimer.current) {
          clearTimeout(stabilizeTimer.current);
          stabilizeTimer.current = null;
        }
        commitState(true);
        return;
      }

      if (stabilizeTimer.current) {
        clearTimeout(stabilizeTimer.current);
      }
      stabilizeTimer.current = setTimeout(() => {
        commitState(false);
        stabilizeTimer.current = null;
      }, 1200);
    };

    const checkStatus = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        applyState(state.isConnected, state.isInternetReachable);
      } catch (error) {
        if (isMounted) {
          if (stabilizeTimer.current) {
            clearTimeout(stabilizeTimer.current);
            stabilizeTimer.current = null;
          }
          commitState(false);
        }
      }
    };

    const subscription = Network.addNetworkStateListener((state: Network.NetworkState) => {
      applyState(state.isConnected, state.isInternetReachable);
    });

    checkStatus();
    const interval = pollInterval ? setInterval(checkStatus, pollInterval) : null;

    return () => {
      isMounted = false;
      subscription.remove();
      if (interval) {
        clearInterval(interval);
      }
      if (stabilizeTimer.current) {
        clearTimeout(stabilizeTimer.current);
        stabilizeTimer.current = null;
      }
    };
  }, [commitState, pollInterval]);

  return { isOffline };
};
