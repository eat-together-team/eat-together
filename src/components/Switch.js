import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const switchWidthRatio = 0.1;
const switchHeightRatio = 0.063;
const maxSwitchHeight = 22;
const maxSwitchWidth = 40;
const SWITCH_HEIGHT = Math.max(maxSwitchHeight, SCREEN_WIDTH * switchHeightRatio);
const SWITCH_WIDTH = Math.max(maxSwitchWidth, SCREEN_WIDTH * switchWidthRatio);
const THUMB_TRAVEL = SWITCH_WIDTH - SWITCH_HEIGHT;

const Switch = ({
  value,
  onValueChange,
  style,
  duration = 150,
  trackColors = { on: '#5db075', off: '#808080' },
}) => {
  const isOn = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Animate toward the new boolean value whenever it changes.
  // backgroundColor interpolation isn't supported by the native driver,
  // so this whole animation runs on the JS thread — fine for an
  // occasional toggle, and it avoids Reanimated/worklets entirely.
  useEffect(() => {
    Animated.timing(isOn, {
      toValue: value ? 1 : 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const trackColor = isOn.interpolate({
    inputRange: [0, 1],
    outputRange: [trackColors.off, trackColors.on],
  });

  const thumbTranslateX = isOn.interpolate({
    inputRange: [0, 1],
    outputRange: [0, THUMB_TRAVEL],
  });

  const handlePress = () => {
    if (onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[switchStyles.track, style, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[switchStyles.thumb, { transform: [{ translateX: thumbTranslateX }] }]}
        />
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
