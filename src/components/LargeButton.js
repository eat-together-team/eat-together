import React, { useRef, useState } from 'react';
import { View, Pressable, Animated, Platform, Text, StyleSheet } from 'react-native';
import { useFonts, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';

const RIPPLE_SIZE = 80;

const LargeButton = ({ onPress, outlined = false, children, disabled, style }) => {
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const buttonWidth = useRef(300);
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });

  const handlePressIn = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    setRipplePos({ x: locationX, y: locationY });

    const scaleTo = (buttonWidth.current * 2.5) / RIPPLE_SIZE;
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.5);

    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: scaleTo,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rippleColor = outlined
    ? 'rgba(93, 176, 117, 0.22)'
    : 'rgba(255, 255, 255, 0.3)';

  const textStyle = {
    fontSize: 13,
    fontFamily: fontsLoaded
      ? 'Inter_600SemiBold'
      : Platform.OS === 'ios'
      ? 'AppleSDGothicNeo-SemiBold'
      : 'sans-serif-medium',
    color: outlined ? colorTokens.light.primary : colorTokens.light.onPrimary,
    textAlign: 'center',
  };

  const TouchableComponent = Pressable;

  return (
    <View
      style={[styles.wrapper, outlined && styles.wrapperOutlined, style]}
      onLayout={(e) => { buttonWidth.current = e.nativeEvent.layout.width; }}
    >
      <TouchableComponent
        onPress={onPress}
        onPressIn={handlePressIn}
        disabled={disabled}
        style={outlined ? styles.outlined : styles.filled}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rippleCircle,
            {
              left: ripplePos.x - RIPPLE_SIZE / 2,
              top: ripplePos.y - RIPPLE_SIZE / 2,
              backgroundColor: rippleColor,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
            },
          ]}
        />
        <Text style={textStyle}>{children}</Text>
      </TouchableComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radiusTokens.small,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: colorTokens.light.primary,
  },
  wrapperOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colorTokens.light.primary,
  },
  filled: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  outlined: {
    height: 43, // 45 - 2*1 border
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  rippleCircle: {
    position: 'absolute',
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
  },
});

export default LargeButton;
