import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';

const ProgressBar = ({ progress = 0 }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const animatedWidth = useRef(new Animated.Value(clampedProgress * 100)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clampedProgress * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { backgroundColor: colors.containerMedium }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: colors.primary,
            width: widthInterpolation,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 19,
    borderRadius: radiusTokens.small,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radiusTokens.small,
  },
});

export default ProgressBar;
