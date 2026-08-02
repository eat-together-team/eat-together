import { useRef, useState } from 'react';
import { Animated } from 'react-native';

const RIPPLE_SIZE = 80;

// Shared touch-point ripple used across pressable rows/buttons (LargeButton,
// SettingsRow, ...): grows a circle from wherever the user pressed, scaled to
// cover the pressable's own width. Consumers attach `onLayout`/`onPressIn` to
// the elements that already carry those handlers, then render an
// `Animated.View` with `rippleStyle` (plus their own `backgroundColor`)
// inside an `overflow: 'hidden'` wrapper.
export default function useRipple({ duration = 400, maxOpacity = 0.5, scaleMultiplier = 2.5 } = {}) {
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(300);

  const onLayout = (event) => {
    containerWidth.current = event.nativeEvent.layout.width;
  };

  const onPressIn = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    setRipplePos({ x: locationX, y: locationY });

    const scaleTo = (containerWidth.current * scaleMultiplier) / RIPPLE_SIZE;
    rippleScale.setValue(0);
    rippleOpacity.setValue(maxOpacity);

    Animated.parallel([
      Animated.timing(rippleScale, { toValue: scaleTo, duration, useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration, useNativeDriver: true }),
    ]).start();
  };

  const rippleStyle = {
    position: 'absolute',
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
    left: ripplePos.x - RIPPLE_SIZE / 2,
    top: ripplePos.y - RIPPLE_SIZE / 2,
    opacity: rippleOpacity,
    transform: [{ scale: rippleScale }],
  };

  return { onLayout, onPressIn, rippleStyle };
}
