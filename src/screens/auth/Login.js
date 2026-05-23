import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../../provider/Firebase';
import firebase from 'firebase/compat';
import 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { colorTokens } from '../../theme/colorTokens';
import SmallAppBar from '../../components/SmallAppBar';
import TextInputField from '../../components/TextInputField';
import SmallTextButton from '../../components/SmallTextButton';
import LargeButton from '../../components/LargeButton';
import DeviceToken from '../../utils/DeviceToken';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    await firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
      setLoading(false);
      alert(error.message);
    });

    const user = auth.currentUser;
    if (DeviceToken.getToken() != null) {
      await db.collection('Users').doc(user.uid).update({
        pushTokens: firebase.firestore.FieldValue.arrayUnion(DeviceToken.getToken()),
      });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <SmallAppBar title="Sign in" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.topSection}>
            <TextInputField
              hint="Email"
              value={email}
              onChangeText={setEmail}
              leadingIcon={
                <Ionicons name="mail-outline" size={16} color={colorTokens.light.onBackground} />
              }
              keyboardType="email-address"
            />
            <View style={styles.inputGap} />
            <TextInputField
              hint="Password"
              value={password}
              onChangeText={setPassword}
              leadingIcon={
                <Ionicons name="lock-closed-outline" size={16} color={colorTokens.light.onBackground} />
              }
              secureTextEntry
            />
            <View style={styles.forgotPasswordGap} />
            <SmallTextButton
              text="Forgot password?"
              type="Primary"
              onPress={() => navigation.navigate('ForgetPassword')}
            />
          </View>
          <View style={styles.footer}>
            <LargeButton onPress={login} disabled={loading}>
              {loading ? 'Loading...' : 'Sign in'}
            </LargeButton>
            <LargeButton outlined color="gray" onPress={() => navigation.goBack()}>
              Back
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
    backgroundColor: colorTokens.light.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  topSection: {
    flex: 1,
    paddingTop: 24,
  },
  inputGap: {
    height: 10,
  },
  forgotPasswordGap: {
    height: 20,
  },
  footer: {
    paddingBottom: 0,
    rowGap: 10,
  },
});
