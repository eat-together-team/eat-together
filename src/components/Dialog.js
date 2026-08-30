import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useFonts, Inter_700Bold, Inter_600SemiBold, Inter_400Regular } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';
import { useTheme } from '../rapi_ui_components';
import LargeButton from './LargeButton';

const Dialog = ({
  type = 'Informative',
  title,
  children,
  icon,
  primaryButtonText = 'Button',
  secondaryButtonText,
  onPrimaryPress,
  onSecondaryPress,
}) => {
  const [fontsLoaded] = useFonts({ Inter_700Bold, Inter_600SemiBold, Inter_400Regular });
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  const fontBold = fontsLoaded ? 'Inter_700Bold' : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Bold' : 'sans-serif-bold';
  const fontRegular = fontsLoaded ? 'Inter_400Regular' : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif';

  const isDestructive = type === 'Destructive' || type === 'Destructive with icon';
  const primaryColor = isDestructive ? colors.error : colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentPadding}>
        {(type === 'Informative' || type === 'Destructive with icon') && (
          <View style={styles.headerSection}>
            {icon}
            <Text style={[styles.title, { fontFamily: fontBold, color: colors.onBackground }]}>
              {title}
            </Text>
          </View>
        )}
        {type === 'Destructive' && (
          <Text style={[styles.title, { fontFamily: fontBold, color: colors.onBackground, marginBottom: 15 }]}>
            {title}
          </Text>
        )}

        <View style={styles.contentSlot}>
          {children}
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <LargeButton
          color={primaryColor}
          onPress={onPrimaryPress}
        >
          {primaryButtonText}
        </LargeButton>
        {secondaryButtonText && (
          <LargeButton
            outlined
            color={colors.outline}
            onPress={onSecondaryPress}
          >
            {secondaryButtonText}
          </LargeButton>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radiusTokens.medium,
    gap: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width - 40,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 5,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
    alignItems: 'center',
    width: '100%',
  },
  headerSection: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  contentSlot: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default Dialog;
