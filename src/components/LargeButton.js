import React from 'react';
import { View, Pressable, Animated, Platform, Text } from 'react-native';
import { useFonts, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';
import useRipple from './utils/useRipple';

const LargeButton = ({ onPress, outlined = false, color = 'green', textColor: textColorOverride, children, disabled, style, leadingIcon }) => {
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

  const textColor = textColorOverride ?? (outlined ? accentColor : colors.onPrimary);
  // A custom textColor implies a light-on-light fill (e.g. a white button
  // with green text) where the default white ripple would be invisible —
  // tint the ripple with the text color instead in that case.
  const rippleColor = outlined
    ? (isGreen ? 'rgba(93,176,117,0.22)' : `${accentColor}38`)
    : textColorOverride ? `${textColorOverride}33` : 'rgba(255,255,255,0.3)';

  const fontFamily = fontsLoaded
    ? 'Inter_600SemiBold'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-SemiBold' : 'sans-serif-medium';

  return (
    <View style={[styles.wrapper, wrapperStyle, style]} onLayout={onLayout}>
      <Pressable onPress={onPress} onPressIn={onPressIn} disabled={disabled} style={styles.inner}>
        <Animated.View pointerEvents="none" style={[rippleStyle, { backgroundColor: rippleColor }]} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {leadingIcon}
          <Text style={{ fontSize: 13, fontFamily, color: textColor }}>{children}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = {
  wrapper: {
    // Fixed so an outlined button's border draws inward instead of adding
    // to the total height — otherwise it renders a few px taller than a
    // filled button sitting next to it (border adds to auto-sized content,
    // it doesn't inset into it).
    height: 41,
    borderRadius: radiusTokens.small,
    overflow: 'hidden',
    width: '100%',
  },
  inner: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
};

export default LargeButton;
