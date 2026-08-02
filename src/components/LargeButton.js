import React from 'react';
import { View, Pressable, Animated, Platform, Text } from 'react-native';
import { useFonts, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';
import useRipple from './utils/useRipple';

const LargeButton = ({ onPress, outlined = false, color = 'green', children, disabled, style, leadingIcon }) => {
  const { onLayout, onPressIn, rippleStyle } = useRipple();
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  const isGray = color === 'gray';
  const isGreen = color === 'green';
  // The standard "gray" accent across all outlined/gray buttons — textMedium
  // at 70% opacity (hex B3), darker/more legible than the old plain outline
  // gray.
  const accentColor = isGray ? `${colors.textMedium}B3` : isGreen ? colors.primary : color;

  const wrapperStyle = outlined
    ? { backgroundColor: 'transparent', borderWidth: 2, borderColor: accentColor }
    : { backgroundColor: accentColor };

  const textColor = outlined ? accentColor : colors.onPrimary;
  const rippleColor = outlined
    ? (isGreen ? 'rgba(93,176,117,0.22)' : `${accentColor}38`)
    : 'rgba(255,255,255,0.3)';

  const fontFamily = fontsLoaded
    ? 'Inter_600SemiBold'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-SemiBold' : 'sans-serif-medium';

  return (
    <View style={[styles.wrapper, wrapperStyle, style]} onLayout={onLayout}>
      <Pressable onPress={onPress} onPressIn={onPressIn} disabled={disabled} style={styles.inner}>
        <Animated.View pointerEvents="none" style={[rippleStyle, { backgroundColor: rippleColor }]} />
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
};

export default LargeButton;
