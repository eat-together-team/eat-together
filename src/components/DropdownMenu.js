import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';
import Header4Text from './typography/Header4Text';

const RIPPLE_SIZE = 80;

const DropdownMenuItem = ({ item, onPress }) => {
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const itemWidth = useRef(300);
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  const handlePressIn = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    setRipplePos({ x: locationX, y: locationY });

    const scaleTo = (itemWidth.current * 2.5) / RIPPLE_SIZE;
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.15);

    Animated.parallel([
      Animated.timing(rippleScale, { toValue: scaleTo, duration: 400, useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View
      style={styles.itemWrapper}
      onLayout={(e) => { itemWidth.current = e.nativeEvent.layout.width; }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        activeOpacity={1}
        style={styles.itemInner}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rippleCircle,
            {
              left: ripplePos.x - RIPPLE_SIZE / 2,
              top: ripplePos.y - RIPPLE_SIZE / 2,
              backgroundColor: colors.outline,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
            },
          ]}
        />
        <Header4Text color={colors.onMenuContainer}>{item}</Header4Text>
      </TouchableOpacity>
    </View>
  );
};

const DropdownMenu = ({ isOpen, menuLayout, onClose, options = [], onSelect }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const menuScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(menuOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(menuScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      menuOpacity.setValue(0);
      menuScale.setValue(0.9);
    }
  }, [isOpen]);

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={onClose}
        activeOpacity={1}
      />
      {menuLayout && (
        <Animated.View
          style={[
            styles.menu,
            {
              top: menuLayout.y + menuLayout.height + 4,
              left: menuLayout.x,
              width: menuLayout.width,
              backgroundColor: colors.menuContainer,
              opacity: menuOpacity,
              transform: [
                {
                  scale: menuScale,
                },
              ],
            },
          ]}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={options.length > 5}
          >
            {options.map((option, index) => (
              <DropdownMenuItem
                key={option}
                item={option}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    borderRadius: radiusTokens.medium,
    paddingVertical: 15,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  itemWrapper: {
    overflow: 'hidden',
  },
  itemInner: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  rippleCircle: {
    position: 'absolute',
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
  },
});

export default DropdownMenu;
