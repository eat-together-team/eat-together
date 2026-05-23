import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { colorTokens } from '../theme/colorTokens';
import { radiusTokens } from '../theme/radiusTokens';

const InformationCard = ({ type = 'Informative', text = 'Information message', actionText = 'Go to profile', onAction }) => {
  const [fontsLoaded] = useFonts({ Inter_400Regular });

  const isError = type === 'Error';
  const isAction = type === 'Action';

  const bgColor = isError ? colorTokens.light.errorContainer : colorTokens.light.containerMedium;
  const textColor = isError ? colorTokens.light.onErrorContainer : colorTokens.light.onContainerMedium;
  const iconColor = textColor;

  const fontFamily = fontsLoaded
    ? 'Inter_400Regular'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.iconWrap, { opacity: 0.7 }]}>
        <Ionicons name="information-circle-outline" size={20} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontFamily, color: textColor, opacity: 0.75 }]}>
          {text}
        </Text>
        {isAction && (
          <Text style={[styles.actionText, { fontFamily, color: textColor, opacity: 0.75 }]} onPress={onAction}>
            {actionText}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: radiusTokens.small,
    alignItems: 'center',
  },
  iconWrap: {},
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 10,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 5,
  },
});

export default InformationCard;
