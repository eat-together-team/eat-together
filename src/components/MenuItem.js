import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Header4Text from './typography/Header4Text';
import { colorTokens } from '../theme/colorTokens';
import { useTheme } from '../rapi_ui_components';

// A single row in a Menu — optional leading icon + label. Pairs with Menu.
const MenuItem = ({ icon, text = 'Text', onPress }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  return (
    <TouchableOpacity
      style={[styles.item, icon ? styles.withIcon : styles.withoutIcon]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      {icon}
      <Header4Text color={tokens.onMenuContainer}>{text}</Header4Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 46,
    width: '100%',
  },
  withIcon: {
    paddingHorizontal: 18,
  },
  withoutIcon: {
    paddingHorizontal: 24,
  },
});

export default MenuItem;
