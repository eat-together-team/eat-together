import React, { useEffect, useRef } from 'react';
import { Modal, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';
import MenuItem from './MenuItem';

// Dropdown menu — pairs with MenuItem. `anchor` positions the card (e.g.
// { top, right } in screen coordinates), typically just under a trailing
// app-bar action. `items` is [{ icon, label, onPress }].
const Menu = ({ visible, onClose, anchor, items = [] }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.95);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
      <Animated.View
        style={[
          styles.menu,
          anchor,
          {
            backgroundColor: tokens.menuContainer,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            text={item.label}
            onPress={() => {
              onClose();
              item.onPress();
            }}
          />
        ))}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    borderRadius: radiusTokens.medium,
    paddingVertical: 15,
    minWidth: 190,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },
});

export default Menu;
