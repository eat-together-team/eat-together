import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header3Text from './typography/Header3Text';
import { colorTokens } from '../theme/colorTokens';

const SmallAppBar = ({ title = 'Title', onBack }) => {
  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={23} color={colorTokens.light.onBackground} />
        </TouchableOpacity>
      )}
      <View style={styles.titleContainer} pointerEvents="none">
        <Header3Text color={colorTokens.light.onBackground} center>
          {title}
        </Header3Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: colorTokens.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colorTokens.light.containerMedium,
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

