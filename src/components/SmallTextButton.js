import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Header4Text from './typography/Header4Text';
import { colorTokens } from '../theme/colorTokens';
import { useTheme } from '../rapi_ui_components';

const SmallTextButton = ({ onPress, text = 'Text button', type = 'Primary', leadingIcon, color }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const textColor = color || (type === 'Primary' ? colors.primary : colors.outline);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {leadingIcon}
      <Header4Text color={textColor}>{text}</Header4Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SmallTextButton;
