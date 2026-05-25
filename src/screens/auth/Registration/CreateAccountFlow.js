import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { colorTokens } from '../../../theme/colorTokens';
import { radiusTokens } from '../../../theme/radiusTokens';
import { useTheme } from '../../../rapi_ui_components';
import SmallAppBar from '../../../components/SmallAppBar';
import LargeButton from '../../../components/LargeButton';
import ProgressBar from '../../../components/ProgressBar';
import CreateAccountStep1 from './CreateAccountStep1';
import CreateAccountStep2 from './CreateAccountStep2';
import CreateAccountStep3 from './CreateAccountStep3';

const TOTAL_STEPS = 3;

export default function CreateAccountFlow({
  navigation,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  pronouns,
  setPronouns,
  image,
  setImage,
  bio,
  setBio,
  foodTags,
  setFoodTags,
  hobbyTags,
  setHobbyTags,
  schoolTags,
  setSchoolTags,
  email,
  setEmail,
  campus,
  setCampus,
  password,
  setPassword,
  createUser,
  loading = false,
  username,
  setUsername,
  usernames,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToToS, setAgreedToToS] = useState(false);
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const fontRegular = fontsLoaded
    ? 'Inter_400Regular'
    : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif';

  useEffect(() => {
    contentOpacity.setValue(0);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 1 && error && firstName.trim() && lastName.trim() && pronouns) {
      setError('');
    }
  }, [firstName, lastName, pronouns, error, currentStep]);

  const validateStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('You must add your name to continue');
        return false;
      }
    }
    if (currentStep === 3) {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      const domain = email.split('@')[1];
      const isValidEmail = emailPattern.test(email) && (domain === 'uw.edu' || domain === 'cs.washington.edu');
      if (!isValidEmail) {
        setError('Enter a valid UW email address');
        return false;
      }
      if (!campus) {
        setError('Please select your campus');
        return false;
      }
      if (!username.trim()) {
        setError('Please choose a username');
        return false;
      }
      if (usernames.includes(username.trim())) {
        setError('Username already taken');
        return false;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!agreedToToS) {
        setError('You must agree to the Terms of Service to continue');
        return false;
      }
    }
    return true;
  };

  const isNextDisabled = () => {
    if (currentStep === 1) return !firstName.trim() || !lastName.trim() || !pronouns;
    if (currentStep === 2) return foodTags.length === 0 || hobbyTags.length === 0 || schoolTags.length === 0;
    if (currentStep === 3) {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      const domain = email.split('@')[1];
      const isValidEmail = emailPattern.test(email) && (domain === 'uw.edu' || domain === 'cs.washington.edu');
      return !isValidEmail || !campus || !username.trim() || usernames.includes(username.trim()) || password.length < 8 || password !== confirmPassword || !agreedToToS;
    }
    return false;
  };

  const handleNext = async () => {
    if (!validateStep()) {
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        await createUser();
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreateAccountStep1
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            pronouns={pronouns}
            setPronouns={setPronouns}
            image={image}
            setImage={setImage}
            bio={bio}
            setBio={setBio}
            error={error}
          />
        );
      case 2:
        return (
          <CreateAccountStep2
            navigation={navigation}
            foodTags={foodTags}
            setFoodTags={setFoodTags}
            hobbyTags={hobbyTags}
            setHobbyTags={setHobbyTags}
            schoolTags={schoolTags}
            setSchoolTags={setSchoolTags}
          />
        );
      case 3:
        return (
          <CreateAccountStep3
            email={email}
            setEmail={setEmail}
            campus={campus}
            setCampus={setCampus}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            agreedToToS={agreedToToS}
            setAgreedToToS={setAgreedToToS}
            error={error}
            username={username}
            setUsername={setUsername}
            usernames={usernames}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <SmallAppBar title="Create account" onBack={handleBack} />

      <Animated.View style={[styles.contentContainer, { opacity: contentOpacity }]}>
        {renderContent()}
      </Animated.View>

      {/* Fixed bottom sheet */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.background, shadowColor: `${colors.onBackground}4D` }]}>
        <ProgressBar progress={currentStep / TOTAL_STEPS} />
        <View style={styles.bottomButtons}>
          <View style={styles.sideButton}>
            <LargeButton outlined color="gray" onPress={handleBack}>
              Back
            </LargeButton>
          </View>
          <Text style={[styles.stepLabel, { color: colors.onBackground, fontFamily: fontRegular }]}>
            {currentStep} of {TOTAL_STEPS}
          </Text>
        <View style={[styles.sideButton, { opacity: isNextDisabled() ? 0.4 : 1 }]}>
            <LargeButton onPress={handleNext}>
              {currentStep === TOTAL_STEPS ? (loading ? 'Loading...' : 'Finish') : 'Next'}
            </LargeButton>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
  },
  bottomSheet: {
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 5,
    borderTopLeftRadius: radiusTokens.small,
    borderTopRightRadius: radiusTokens.small,
    gap: 25,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4.15,
    elevation: 8,
  },
  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sideButton: {
    flex: 1,
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
  },
});
