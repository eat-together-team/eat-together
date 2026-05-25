import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Header4Text from './typography/Header4Text';
import { colorTokens } from '../theme/colorTokens';
import { useTheme } from '../rapi_ui_components';

const SmallTextButton = ({ onPress, text = 'Text button', type = 'Primary' }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const textColor = type === 'Primary' ? colors.primary : colors.outline;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Header4Text color={textColor}>{text}</Header4Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SmallTextButton;
