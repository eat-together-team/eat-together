import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const switchWidthRatio = 0.1;
const switchHeightRatio = 0.063;
const maxSwitchHeight = 22;
const maxSwitchWidth = 40;
const SWITCH_HEIGHT = Math.max(maxSwitchHeight, SCREEN_WIDTH * switchHeightRatio);
const SWITCH_WIDTH = Math.max(maxSwitchWidth, SCREEN_WIDTH * switchWidthRatio);

const Switch = ({
  value,
  onValueChange,
  style,
  duration = 400,
  trackColors = { on: '#5db075', off: '#808080' },
}) => {
  const height = useSharedValue(0);
  const width = useSharedValue(0);
  const isOn = useSharedValue(value ? 1 : 0);

  // Update the shared value when the boolean value prop changes
  useEffect(() => {
    isOn.value = withTiming(value ? 1 : 0, { duration });
  }, [value]);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      isOn.value,
      [0, 1],
      [trackColors.off, trackColors.on]
    );

    return {
      backgroundColor: color,
      borderRadius: height.value / 2,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(
      isOn.value,
      [0, 1],
      [0, width.value - height.value]
    );

    return {
      transform: [{ translateX: moveValue }],
      borderRadius: height.value / 2,
    };
  });

  const handlePress = () => {
    if (onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
          width.value = e.nativeEvent.layout.width;
        }}
        style={[switchStyles.track, style, trackAnimatedStyle]}>
        <Animated.View
          style={[switchStyles.thumb, thumbAnimatedStyle]}></Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const switchStyles = StyleSheet.create({
  track: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: SWITCH_HEIGHT,
    width: SWITCH_WIDTH,
    borderRadius: SWITCH_HEIGHT / 2,
    padding: 2,
    overflow: 'hidden',
  },
  thumb: {
    height: '100%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: (SWITCH_HEIGHT - 4) / 2,
  },
});

export default Switch;
