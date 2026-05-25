import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../rapi_ui_components';

const Scrim = ({ onPress }) => {
  const { theme } = useTheme();

  const scrimColor = theme === 'dark'
    ? 'rgba(83, 83, 83, 0.38)'
    : 'rgba(17, 17, 17, 0.15)';

  return (
    <View
      style={[styles.scrim, { backgroundColor: scrimColor }]}
      onTouchEnd={onPress}
    />
  );
};

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});

export default Scrim;
