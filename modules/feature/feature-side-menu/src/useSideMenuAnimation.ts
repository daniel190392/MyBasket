import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

const ANIMATION_DURATION_MS = 220;

// `progress` goes from 0 (closed) to 1 (open). The menu stays rendered until
// the closing animation ends, so it slides out instead of disappearing.
export function useSideMenuAnimation(isOpen: boolean) {
  const progress = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setIsRendered(true);

    const animation = Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: ANIMATION_DURATION_MS,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !isOpen) setIsRendered(false);
    });

    return () => animation.stop();
  }, [isOpen, progress]);

  return { isRendered, progress };
}
