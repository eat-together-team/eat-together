import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';

const AboutChip = ({ text, color = 'Purple', type = 'Display', onRemove }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [fontsLoaded] = useFonts({ Inter_700Bold });

  const fontFamily = fontsLoaded
    ? 'Inter_700Bold'
    : Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

  const colorMap = {
    Purple: {
      bg: colors.foodTagContainer,
      text: colors.onFoodTagContainer,
    },
    Blue: {
      bg: colors.hobbyTagContainer,
      text: colors.onHobbyTagContainer,
    },
    Yellow: {
      bg: colors.educationTagContainer,
      text: colors.onEducationTagContainer,
    },
  };

  const colorScheme = colorMap[color] || colorMap.Purple;
  const isRemovable = type === 'Removable';

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colorScheme.bg,
          flexDirection: isRemovable ? 'row' : 'column',
          gap: isRemovable ? 10 : 0,
        },
      ]}
    >
      <Text style={[styles.text, { color: colorScheme.text, fontFamily }]}>
        {text}
      </Text>
      {isRemovable && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close" size={16} color={colorScheme.text} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default AboutChip;
