import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header3Text from './typography/Header3Text';
import { colorTokens } from '../theme/colorTokens';
import { useTheme } from '../rapi_ui_components';

const SmallAppBar = ({ title = 'Title', onBack }) => {
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default SmallAppBar;
