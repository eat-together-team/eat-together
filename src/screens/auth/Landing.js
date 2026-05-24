import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Inter_500Medium } from '@expo-google-fonts/inter';
import { colorTokens } from '../../theme/colorTokens';
import { radiusTokens } from '../../theme/radiusTokens';
import { useTheme } from '../../rapi_ui_components';
import SubBodyText from '../../components/typography/SubBodyText';
import LargeButton from '../../components/LargeButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Landing({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fontsLoaded] = useFonts({ Inter_500Medium });
  const { theme, isDarkmode } = useTheme();
  const colors = colorTokens[theme];

  const SLIDES = [
    {
      image: theme === 'dark' ? require('../../../assets/welcome-sample-meetup-dark.png') : require('../../../assets/welcome-sample-meetup-light.png'),
      subtitle: 'Find meetups happening near you',
    },
    {
      image: theme === 'dark' ? require('../../../assets/welcome-sample-explore-dark.png') : require('../../../assets/welcome-sample-explore-light.png'),
      subtitle: 'Meet new friends with similar interests',
    },
    {
      image: theme === 'dark' ? require('../../../assets/welcome-sample-exchange-dark.png') : require('../../../assets/welcome-sample-exchange-light.png'),
      subtitle: 'Exchange your extra dining dollars for cash',
    },
    {
      image: theme === 'dark' ? require('../../../assets/welcome-sample-picker-dark.png') : require('../../../assets/welcome-sample-picker-light.png'),
      subtitle: 'Receive personalized restaurant recommendations',
    },
  ];

  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkmode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo-square.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text
          style={[
            styles.title,
            {
              color: colors.textNormal,
              fontFamily: fontsLoaded
                ? 'Inter_500Medium'
                : Platform.OS === 'ios'
                ? 'AppleSDGothicNeo-Medium'
                : 'sans-serif-medium',
            },
          ]}
        >
          Welcome to Eat Together
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.middle}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.carousel}
        >
          {SLIDES.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <View style={[styles.imageContainer, { backgroundColor: colors.primaryContainerLow }]}>
                <Image
                  source={slide.image}
                  style={styles.slideImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.carouselInfo}>
          <SubBodyText center color={colors.textMedium}>
            {SLIDES[currentIndex].subtitle}
          </SubBodyText>
          <View style={styles.dotsRow}>
            {SLIDES.map((_, dotIndex) => (
              <View
                key={dotIndex}
                style={[
                  styles.dot,
                  dotIndex === currentIndex ? styles.dotActive : styles.dotInactive,
                  {
                    backgroundColor: dotIndex === currentIndex
                      ? colors.primary
                      : colors.outline,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <LargeButton onPress={() => navigation.navigate('Name')}>
          Create an account
        </LargeButton>
        <LargeButton outlined onPress={() => navigation.navigate('Login')}>
          Sign in
        </LargeButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    rowGap: 25,
  },
  logoContainer: {
    width: 150,
    height: 152,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '82%',
    height: '82%',
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  spacer: {
    flex: 1,
  },
  middle: {
    alignItems: 'center',
    rowGap: 0,
  },
  carousel: {
    height: 320,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  carouselInfo: {
    alignItems: 'center',
    rowGap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  imageContainer: {
    width: 297,
    height: 297,
    borderRadius: radiusTokens.large,
    overflow: 'hidden',
  },
  slideImage: {
    position: 'absolute',
    top: 24,
    left: 63,
    width: 170,
    height: 320,
    borderRadius: radiusTokens.small,
  },
  dotsRow: {
    flexDirection: 'row',
    columnGap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 50,
  },
  dotActive: {
    width: 8,
    height: 8,
  },
  dotInactive: {
    width: 6,
    height: 6,
    opacity: 0.5,
  },
  footer: {
    paddingHorizontal: 40,
    paddingTop: 10,
    paddingBottom: 20,
    rowGap: 10,
  },
});
