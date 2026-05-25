import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { colorTokens } from '../../../theme/colorTokens';
import { radiusTokens } from '../../../theme/radiusTokens';
import { useTheme } from '../../../rapi_ui_components';
import TextInputField from '../../../components/TextInputField';
import LargeButton from '../../../components/LargeButton';
import DropdownField from '../../../components/DropdownField';
import InformationCard from '../../../components/InformationCard';

const PRONOUNS_OPTIONS = ['he/him', 'she/her', 'they/them', 'xe/xem', 'ze/hir', 'hy/hym', 'co/cos'];

export default function CreateAccountStep1Content({
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
  error,
}) {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [fontsLoaded] = useFonts({ Inter_500Medium, Inter_700Bold });
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

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const fontMedium = fontsLoaded
    ? 'Inter_500Medium'
    : Platform.OS === 'ios' ? 'System' : 'sans-serif';
  const fontBold = fontsLoaded
    ? 'Inter_700Bold'
    : Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';
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
      {/* Error message */}
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
      {/* Identity section */}
      <View style={[styles.section, styles.identitySection]}>
        <Text style={[styles.sectionLabel, { color: colors.onBackground, fontFamily: fontMedium }]}>
          Identity
        </Text>
        <TextInputField
          hint="First name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
        <TextInputField
          hint="Last name"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
        <DropdownField
          placeholder="Pronouns"
          value={pronouns}
          onSelect={setPronouns}
          options={PRONOUNS_OPTIONS}
          leadingIcon={<Ionicons name="person-outline" size={16} color={colors.onBackground} />}
        />
      </View>

      {/* Picture section */}
      <View style={[styles.section, styles.pictureSection]}>
        <Text style={[styles.sectionLabel, { color: colors.onBackground, fontFamily: fontMedium }]}>
          Picture
        </Text>
        <View style={styles.pictureRow}>
          <View style={styles.pictureButtons}>
            <LargeButton outlined color="green" onPress={handleUploadPhoto}>
              Upload photo
            </LargeButton>
            {image ? (
              <LargeButton outlined color="gray" onPress={() => setImage('')}>
                Delete photo
              </LargeButton>
            ) : null}
          </View>
          {image ? (
            <Image source={{ uri: image }} style={[styles.avatar, { shadowColor: `${colors.onBackground}4D` }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { borderColor: colors.containerHigh }]}>
              <Ionicons name="person-circle-outline" size={46} color={colors.containerHigh} />
            </View>
          )}
        </View>
      </View>

      {/* Fun fact section */}
      <View style={[styles.section, styles.funFactSection]}>
        <Text style={[styles.sectionLabel, { color: colors.onBackground, fontFamily: fontMedium }]}>
          Fun fact
        </Text>
        <View
          style={[styles.funFactBox, { borderColor: colors.containerHigh }]}
        >
          <TextInput
            placeholder="Type here to add a fun fact to your profile"
            placeholderTextColor={colors.textLight}
            value={bio}
            onChangeText={setBio}
            multiline
            style={[
              styles.funFactInput,
              {
                color: colors.onBackground,
                fontFamily: fontBold,
              },
            ]}
            scrollEnabled={false}
          />
        </View>
      </View>
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
    gap: 25,
  },
  errorContainer: {
    marginBottom: 15,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 13,
  },
  identitySection: {
    gap: 15,
    marginTop: -25,
  },
  pictureSection: {
    gap: 15,
  },
  funFactSection: {
    gap: 15,
  },
  pictureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pictureButtons: {
    width: 163,
    gap: 10,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarPlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  funFactBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radiusTokens.medium,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  funFactInput: {
    fontSize: 22,
    padding: 0,
    textAlignVertical: 'top',
    textAlign: 'center',
  },
});
