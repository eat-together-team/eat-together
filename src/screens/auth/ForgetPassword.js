import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import firebase from 'firebase/compat';
import { Ionicons } from '@expo/vector-icons';
import { colorTokens } from '../../theme/colorTokens';
import { useTheme } from '../../rapi_ui_components';
import SmallAppBar from '../../components/SmallAppBar';
import TextInputField from '../../components/TextInputField';
import LargeButton from '../../components/LargeButton';
import InformationCard from '../../components/InformationCard';

export default function ForgetPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const insets = useSafeAreaInsets();

  async function submit() {
    setError('');
    setLoading(true);
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      setLoading(false);
      setError('Could not send reset email. Please check the address and try again.');
    }
  }

  if (submitted) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <SmallAppBar title="Reset password" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <View style={styles.topSection}>
            <InformationCard text="Check your inbox for a link to reset your password" />
          </View>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 15 }]}>
            <LargeButton
              outlined
              color="gray"
              leadingIcon={
                <Ionicons name="checkmark-outline" size={16} color={colors.outline} />
              }
              onPress={() => navigation.navigate('Login')}
            >
              Done
            </LargeButton>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <SmallAppBar title="Reset password" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.topSection}>
            {error ? (
              <>
                <InformationCard type="Error" text={error} />
                <View style={styles.gap} />
              </>
            ) : (
              <>
                <InformationCard text="Enter the email associated with your account to receive instructions to reset your password" />
                <View style={styles.gap} />
              </>
            )}
            <TextInputField
              hint="Email"
              value={email}
              onChangeText={setEmail}
              leadingIcon={
                <Ionicons name="mail-outline" size={16} color={colors.onBackground} />
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 15 }]}>
            <LargeButton onPress={submit} disabled={loading}>
              {loading ? 'Loading...' : 'Submit'}
            </LargeButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topSection: {
    flex: 1,
    paddingTop: 24,
  },
  gap: {
    height: 15,
  },
  footer: {
    paddingBottom: 15,
  },
});
