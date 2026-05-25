import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { colorTokens } from '../../../theme/colorTokens';
import { useTheme } from '../../../rapi_ui_components';
import TextInputField from '../../../components/TextInputField';
import DropdownField from '../../../components/DropdownField';
import InformationCard from '../../../components/InformationCard';

const CAMPUS_OPTIONS = ['UW Seattle', 'UW Tacoma', 'UW Bothell'];

export default function CreateAccountStep3Content({
  email,
  setEmail,
  campus,
  setCampus,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  agreedToToS,
  setAgreedToToS,
  error,
  username,
  setUsername,
  usernames,
}) {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fontRegular = fontsLoaded
    ? 'Inter_400Regular'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif';

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <InformationCard
        type={error ? 'Error' : 'Informative'}
        text={error || 'At this time, Eat Together is only available to the UW community. Enter your school email address to verify'}
      />

      <View style={styles.group}>
        <TextInputField
          hint="UW email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leadingIcon={<Ionicons name="mail-outline" size={16} color={colors.onBackground} />}
        />
        <DropdownField
          placeholder="Campus"
          value={campus}
          onSelect={setCampus}
          options={CAMPUS_OPTIONS}
          leadingIcon={<Ionicons name="school-outline" size={16} color={colors.onBackground} />}
        />
      </View>

      <View style={styles.group}>
        <TextInputField
          hint="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          leadingIcon={<Ionicons name="lock-closed-outline" size={16} color={colors.onBackground} />}
          trailingIcon={<Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={16} color={colors.onBackground} onPress={() => setShowPassword(!showPassword)} />}
        />
        <TextInputField
          hint="Retype password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          leadingIcon={<Ionicons name="lock-closed-outline" size={16} color={colors.onBackground} />}
          trailingIcon={<Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={16} color={colors.onBackground} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
        />
      </View>

      <TextInputField
        hint="Choose a username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        leadingIcon={<Ionicons name="person-outline" size={16} color={colors.onBackground} />}
      />

      <TouchableOpacity
        style={styles.tosRow}
        onPress={() => setAgreedToToS(!agreedToToS)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, {
          borderColor: colors.primary,
          backgroundColor: agreedToToS ? colors.primary : 'transparent',
        }]}>
          {agreedToToS && (
            <Ionicons name="checkmark" size={13} color={colors.onPrimary} />
          )}
        </View>
        <Text style={[styles.tosText, { fontFamily: fontRegular, color: colors.onBackground }]}>
          {'I agree to the Eat Together '}
          <Text
            style={[styles.tosLink, { color: colors.primary }]}
            onPress={() => Linking.openURL('https://www.eat-together.org/terms-and-conditions')}
          >
            Terms of Service
          </Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 30,
  },
  group: {
    gap: 15,
  },
  tosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tosText: {
    fontSize: 13,
    flex: 1,
  },
  tosLink: {
    textDecorationLine: 'underline',
  },
});
