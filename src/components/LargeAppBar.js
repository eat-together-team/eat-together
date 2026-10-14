import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header1Text from './typography/Header1Text';
import { colorTokens } from '../theme/colorTokens';
import { useTheme } from '../rapi_ui_components';

// "Large app bar" — use at the top of primary pages within the navigation
// hierarchy. Pass 0-2 actions (icon name + onPress) for the trailing icons.
// An action can set `showBadge` for a small dot in its corner — same
// treatment (and same 8pt error-coloured dot) the bottom tab bar uses.
const LargeAppBar = ({ title = 'Title', actions = [] }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  return (
    <View style={styles.container}>
      <Header1Text color={colors.onBackground} style={styles.title}>
        {title}
      </Header1Text>
      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map(({ icon, onPress, targetRef, showBadge }, index) => (
            <TouchableOpacity key={index} ref={targetRef} onPress={onPress}>
              <Ionicons name={icon} size={25} color={colors.onBackground} />
              {showBadge && (
                <View style={[styles.badge, { backgroundColor: colors.error }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 30,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default LargeAppBar;
