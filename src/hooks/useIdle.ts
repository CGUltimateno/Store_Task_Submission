import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useIdle = (timeout: number) => {
  const [isIdle, setIsIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onActive = () => {
    if (isIdle) {
      setIsIdle(false);
    }
    resetTimer();
  };

  const onIdle = () => {
    setIsIdle(true);
  };

  const resetTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        onIdle();
      } else if (nextAppState === 'active') {
        onActive();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    resetTimer();

    return () => {
      subscription.remove();
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [timeout]);

  return { isIdle, resetTimer, markActive: onActive };
};
