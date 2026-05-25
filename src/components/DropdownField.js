import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';
import DropdownMenu from './DropdownMenu';
import SubBodyText from './typography/SubBodyText';

const DropdownField = ({
  placeholder = 'Select...',
  value = '',
  onSelect,
  options = [],
  leadingIcon = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuLayout, setMenuLayout] = useState(null);
  const triggerRef = useRef(null);
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  const fontRegular = fontsLoaded
    ? 'Inter_400Regular'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif';

  const handleOpen = () => {
    triggerRef.current.measureInWindow((x, y, width, height) => {
      setMenuLayout({ x, y, width, height });
      setIsOpen(true);
    });
  };

  const hasValue = !!value;

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={handleOpen}
        activeOpacity={0.7}
        style={[styles.trigger, {
          borderColor: colors.outline,
          backgroundColor: colors.background,
        }]}
      >
        <View style={styles.leadingContent}>
          {leadingIcon && (
            <View style={styles.iconWrap}>{leadingIcon}</View>
          )}
          <SubBodyText
            style={[
              styles.text,
              { fontFamily: fontRegular, color: colors.onBackground },
              !hasValue && styles.dimmed,
            ]}
            color={colors.onBackground}
          >
            {value || placeholder}
          </SubBodyText>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.onBackground}
        />
      </TouchableOpacity>

      <DropdownMenu
        isOpen={isOpen}
        menuLayout={menuLayout}
        options={options}
        onSelect={onSelect}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 47,
    borderRadius: radiusTokens.small,
    borderWidth: 2,
    paddingHorizontal: 16,
  },
  leadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    opacity: 0.5,
  },
  dimmed: {
    opacity: 0.5,
  },
  text: {
    fontSize: 13,
  },
});

export default DropdownField;
