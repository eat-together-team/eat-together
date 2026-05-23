import React from 'react';
import { View, TextInput as RNTextInput, StyleSheet, Platform } from 'react-native';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';

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
}) => {
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const fontFamily = fontsLoaded
    ? 'Inter_400Regular'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif';

  return (
    <View style={[styles.container, style]}>
      {leadingIcon && <View style={styles.iconWrap}>{leadingIcon}</View>}
      <RNTextInput
        style={[styles.input, { fontFamily }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={hint}
        placeholderTextColor="rgba(32,32,32,0.5)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {trailingIcon && <View style={styles.iconWrap}>{trailingIcon}</View>}
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
    borderColor: colorTokens.light.outline,
    backgroundColor: colorTokens.light.background,
    paddingHorizontal: 16,
    gap: 10,
  },
  iconWrap: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colorTokens.light.onBackground,
    padding: 0,
  },
});

export default TextInputField;
