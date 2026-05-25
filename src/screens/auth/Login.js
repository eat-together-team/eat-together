import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../../provider/Firebase';
import firebase from 'firebase/compat';
import 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { colorTokens } from '../../theme/colorTokens';
import { useTheme } from '../../rapi_ui_components';
import SmallAppBar from '../../components/SmallAppBar';
import TextInputField from '../../components/TextInputField';
import SmallTextButton from '../../components/SmallTextButton';
import LargeButton from '../../components/LargeButton';
import InformationCard from '../../components/InformationCard';
import DeviceToken from '../../utils/DeviceToken';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.spring(errorHeight, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(errorOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.spring(errorHeight, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [error]);

  async function login() {
    setError('');
    setLoading(true);
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = auth.currentUser;
      if (DeviceToken.getToken() != null) {
        await db.collection('Users').doc(user.uid).update({
          pushTokens: firebase.firestore.FieldValue.arrayUnion(DeviceToken.getToken()),
        });
      }
    } catch (err) {
      setLoading(false);
      setError('Email or password is incorrect');
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <SmallAppBar title="Sign in" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.topSection}>
            <Animated.View
              style={[
                styles.errorContainer,
                {
                  opacity: errorOpacity,
                  maxHeight: errorHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200],
                  }),
                },
              ]}
            >
              {error && <InformationCard type="Error" text={error} />}
            </Animated.View>
            <View style={styles.inputsSection}>
            <TextInputField
              hint="Email"
              value={email}
              onChangeText={setEmail}
              leadingIcon={
                <Ionicons name="mail-outline" size={16} color={colors.onBackground} />
              }
              keyboardType="email-address"
            />
            <View style={styles.inputGap} />
            <TextInputField
              hint="Password"
              value={password}
              onChangeText={setPassword}
              leadingIcon={
                <Ionicons name="lock-closed-outline" size={16} color={colors.onBackground} />
              }
              secureTextEntry={!showPassword}
              trailingIcon={<Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={16} color={colors.onBackground} onPress={() => setShowPassword(!showPassword)} />}
            />
            <View style={styles.forgotPasswordGap} />
            <SmallTextButton
              text="Forgot password?"
              type="Primary"
              onPress={() => navigation.navigate('ForgetPassword')}
            />
          </View>
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
  errorContainer: {
    marginBottom: 15,
    overflow: 'hidden',
  },
  inputsSection: {
    gap: 5,
  },
  inputGap: {
    height: 5,
  },
  forgotPasswordGap: {
    height: 20,
  },
  footer: {
    paddingBottom: 15,
    rowGap: 10,
  },
});
