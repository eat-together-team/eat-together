import React, { useState } from 'react';
import { View, TextInput as RNTextInput, StyleSheet, Platform, Pressable } from 'react-native';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';

const TextInputField = ({
  hint = 'Hint',
  value = '',
  onChangeText,
  leadingIcon = null,
  trailingIcon = null,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  onFocus,
  onBlur,
}) => {
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [isFocused, setIsFocused] = useState(false);

  const fontFamily = fontsLoaded
    ? 'Inter_400Regular'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif';

  return (
    <View style={[styles.container, {
      borderColor: isFocused ? `${colors.textMedium}CC` : colors.outline,
      backgroundColor: colors.background,
    }, style]}>
      {leadingIcon && <View style={styles.iconWrap}>{leadingIcon}</View>}
      <RNTextInput
        style={[styles.input, { fontFamily, color: colors.onBackground }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={hint}
        placeholderTextColor={colors.textLight}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
      />
      {trailingIcon && (
        <Pressable style={styles.iconWrap} onPress={trailingIcon?.props?.onPress} hitSlop={8}>
          {React.cloneElement(trailingIcon, { onPress: undefined })}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 47,
    borderRadius: radiusTokens.small,
    borderWidth: 2,
    paddingHorizontal: 16,
    gap: 10,
  },
  iconWrap: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
});

export default TextInputField;
