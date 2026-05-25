import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { useTheme } from '../rapi_ui_components';

const RIPPLE_SIZE = 60;

const FilterChip = ({ text, type = 'Display', color = 'Clear', onPress, onRemove }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const chipWidth = useRef(60);
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  const handleRemovePress = () => {
    Animated.parallel([
      Animated.timing(exitScale, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onRemove());
  };

  const handlePressIn = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    setRipplePos({ x: locationX, y: locationY });

    const scaleTo = (chipWidth.current * 2) / RIPPLE_SIZE;
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.15);

    Animated.parallel([
      Animated.timing(rippleScale, { toValue: scaleTo, duration: 400, useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const fontFamily = fontsLoaded
    ? 'Inter_400Regular'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif';

  const colorMap = {
    Clear: { bg: 'transparent', border: colors.textLight, text: colors.textMedium },
    Green: { bg: colors.primaryContainer, border: colors.outline, text: colors.onPrimaryContainer },
    Purple: { bg: colors.foodTagContainerLow, border: colors.foodTagBorder, text: colors.onFoodTagContainerLow },
    Yellow: { bg: colors.educationTagContainerLow, border: colors.educationTagBorder, text: colors.onEducationTagContainerLow },
    Blue: { bg: colors.hobbyTagContainerLow, border: colors.hobbyTagBorder, text: colors.onHobbyTagContainerLow },
  };

  const colorScheme = colorMap[color] || colorMap.Clear;

  const isPlusIcon = type === 'Add' && color === 'Clear';
  const isRemoveIcon = type === 'Remove';
  const isAddType = type === 'Add';

  const chipContent = (
    <View
      style={[
        styles.chipWrapper,
        {
          backgroundColor: colorScheme.bg,
          borderColor: colorScheme.border,
        },
      ]}
      onLayout={(e) => { chipWidth.current = e.nativeEvent.layout.width; }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.rippleCircle,
          {
            left: ripplePos.x - RIPPLE_SIZE / 2,
            top: ripplePos.y - RIPPLE_SIZE / 2,
            backgroundColor: colorScheme.text,
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />
      <View
        style={[
          styles.chip,
          {
            flexDirection: type === 'Remove' ? 'row' : 'row',
            gap: 5,
          },
        ]}
      >
        <Text style={[styles.text, { color: colorScheme.text, fontFamily }]}>
          {text}
        </Text>
        {isPlusIcon && <Ionicons name="add" size={16} color={colorScheme.border} />}
        {isRemoveIcon && (
          <Ionicons name="close" size={16} color={colorScheme.border} />
        )}
      </View>
    </View>
  );

  if (isAddType) {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} hitSlop={8}>
        {chipContent}
      </Pressable>
    );
  }

  if (isRemoveIcon) {
    return (
      <Animated.View style={{ opacity: exitOpacity, transform: [{ scale: exitScale }] }}>
        <Pressable
          onPress={handleRemovePress}
          onPressIn={handlePressIn}
          hitSlop={8}
        >
          {chipContent}
        </Pressable>
      </Animated.View>
    );
  }

  return chipContent;
};

const styles = StyleSheet.create({
  chipWrapper: {
    borderRadius: 30,
    borderWidth: 0.5,
    borderStyle: 'solid',
    overflow: 'hidden',
    height: 33,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 33,
  },
  text: {
    fontSize: 12,
  },
  rippleCircle: {
    position: 'absolute',
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
  },
});

export default FilterChip;
