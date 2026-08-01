import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header3Text from './typography/Header3Text';
import { colorTokens } from '../theme/colorTokens';
import { useTheme } from '../rapi_ui_components';

// "Small app bar" — use at the top of pages that are secondary within the
// navigation hierarchy. Pass 0-2 actions (icon name + onPress) for the
// trailing icons (e.g. plus, checkmark).
const SmallAppBar = ({ title = 'Title', onBack, actions = [] }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      borderBottomColor: colors.containerMedium,
    }]}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={23} color={colors.onBackground} />
        </TouchableOpacity>
      )}
      <View style={styles.titleContainer} pointerEvents="none">
        <Header3Text color={colors.onBackground} center>
          {title}
        </Header3Text>
      </View>
      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map(({ icon, onPress }, index) => (
            <TouchableOpacity key={index} onPress={onPress}>
              <Ionicons name={icon} size={23} color={colors.onBackground} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
  },
  backButton: {
    zIndex: 1,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },
});

export default SmallAppBar;
