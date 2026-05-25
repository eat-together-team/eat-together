import React, { useRef, useState } from 'react';
import { View, Pressable, Animated, Platform, Text } from 'react-native';
import { useFonts, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';

const RIPPLE_SIZE = 80;

const LargeButton = ({ onPress, outlined = false, color = 'green', children, disabled, style, leadingIcon }) => {
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const buttonWidth = useRef(300);
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  const handlePressIn = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    setRipplePos({ x: locationX, y: locationY });

    const scaleTo = (buttonWidth.current * 2.5) / RIPPLE_SIZE;
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.5);

    Animated.parallel([
      Animated.timing(rippleScale, { toValue: scaleTo, duration: 400, useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const isGray = color === 'gray';
  const isGreen = color === 'green';
  const accentColor = isGray ? colors.outline : isGreen ? colors.primary : color;

  const wrapperStyle = outlined
    ? { backgroundColor: 'transparent', borderWidth: 2, borderColor: accentColor }
    : { backgroundColor: accentColor };

  const textColor = outlined ? accentColor : colors.onPrimary;
  const rippleColor = outlined
    ? (isGray ? 'rgba(187,187,187,0.22)' : isGreen ? 'rgba(93,176,117,0.22)' : `${accentColor}38`)
    : 'rgba(255,255,255,0.3)';

  const fontFamily = fontsLoaded
    ? 'Inter_600SemiBold'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-SemiBold' : 'sans-serif-medium';

  return (
    <View
      style={[styles.wrapper, wrapperStyle, style]}
      onLayout={(e) => { buttonWidth.current = e.nativeEvent.layout.width; }}
    >
      <Pressable onPress={onPress} onPressIn={handlePressIn} disabled={disabled} style={styles.inner}>
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
        {leadingIcon ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {leadingIcon}
            <Text style={{ fontSize: 13, fontFamily, color: textColor }}>{children}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: 13, fontFamily, color: textColor, textAlign: 'center' }}>
            {children}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = {
  wrapper: {
    borderRadius: radiusTokens.small,
    overflow: 'hidden',
    width: '100%',
  },
  inner: {
    height: 41,
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
};

export default LargeButton;
