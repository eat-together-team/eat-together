import { View, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import BodyText from '../../components/typography/BodyText';
import LargeButton from '../../components/LargeButton';
import RestaurantRec from '../../components/RestaurantRec';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../rapi_ui_components';
import { colorTokens } from '../../theme/colorTokens';

// "Swipe Deck" screen that renders each restaurant that is tailored to user preferences
const NewSwipeDeck = ({listOfRestaurants, incrementIndex, currentIndex, setCurrentIndex, setIndex, setUserSkipped, setPressedStart, setUserResults, setResult, onExpandedChange}) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const hasFinishedRef = useRef(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  // reset card position when index changes
  useEffect(() => {
    translateX.setValue(0);
    translateY.setValue(0);
    cardOpacity.setValue(0);
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  // new card starts collapsed, so parent can disable scroll
  useEffect(() => {
    onExpandedChange?.(false);
  }, [currentIndex]);

  // Approve current restaurant (button or swipe right)
  const approveCurrent = () => {
    if (!Array.isArray(listOfRestaurants) || listOfRestaurants.length === 0) {
      return;
    }

    setCurrentIndex(prevIndex => {
      const current = listOfRestaurants[prevIndex];
      if (current) {
        setUserResults(prev => [...prev, current]);
      }

      const next = prevIndex + 1;
      // If we've reached the end of the list, go straight to the results
      if (!listOfRestaurants[next]) {
        incrementIndex();
        return prevIndex;
      }
      return next;
    });
  };

  // Ignore if red button is pressed
  const ignoreRestaurant = () => {
    setCurrentIndex((prev) => (prev + 1));
  };

  // card animation when declining a restaurant
  const triggerReject = () => {
    Animated.timing(translateX, {
      toValue: -400,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        ignoreRestaurant();
      }
    });
  };

  // card animation when approving a restaurant
  const triggerApprove = () => {
    Animated.timing(translateX, {
      toValue: 400,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        approveCurrent();
      }
    });
  };

  // go back to previous restaurant for back button
  const handleBack = () => {
    setCurrentIndex(prevIndex => {
      if (prevIndex === 0) {
        return prevIndex;
      }

      const previousIndex = prevIndex - 1;
      const previousRestaurant = listOfRestaurants[previousIndex];

      if (previousRestaurant) {
        setUserResults(prevResults =>
          prevResults.filter(r => r.id !== previousRestaurant.id)
        );
      }

      return previousIndex;
    });
  };

  // translation for angled card swiping
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 15 || Math.abs(gestureState.dy) > 15,
      onPanResponderMove: (evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy * 0.3);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        const goRight = dx > 80 || vx > 0.3;
        const goLeft = dx < -80 || vx < -0.3;

        if (goRight) {
          Animated.timing(translateX, {
            toValue: 400,
            duration: 180,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) {
              approveCurrent();
            }
          });
        } else if (goLeft) {
          Animated.timing(translateX, {
            toValue: -400,
            duration: 180,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) {
              ignoreRestaurant();
            }
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const rotation = translateX.interpolate({
    inputRange: [-350, 0, 350],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const cardAnimatedStyle = {
    opacity: cardOpacity,
    transform: [
      { translateX },
      { translateY },
      { rotate: rotation },
    ],
  };

  // rejected background when declining a restaurant
  const rejectOpacity = translateX.interpolate({
    inputRange: [-140, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const rejectScale = translateX.interpolate({
    inputRange: [-140, 0],
    outputRange: [1.05, 0.9],
    extrapolate: 'clamp',
  });
  const rejectOverlayStyle = {
    opacity: rejectOpacity,
    transform: [{ scale: rejectScale }],
  };

  // accepted background when approving a restaurant
  const acceptOpacity = translateX.interpolate({
    inputRange: [0, 140],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const acceptScale = translateX.interpolate({
    inputRange: [0, 140],
    outputRange: [0.9, 1.05],
    extrapolate: 'clamp',
  });
  const acceptOverlayStyle = {
    opacity: acceptOpacity,
    transform: [{ scale: acceptScale }],
  };

  // Wait until API response loads
  if (!Array.isArray(listOfRestaurants)) {
    return (
      <View style = {{marginTop: 300}}>
        <BodyText color={colors.onBackground} center>Loading...</BodyText>
      </View>
    )
  }

  const restaurant = listOfRestaurants[currentIndex];

  // Renders each restaurant as a card
  const renderCard = () => {
    if (!restaurant) {
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        incrementIndex();
      }

      return null;
    }
    return (
      <View style={styles.cardWrapper}>
        <Animated.Image
          source={require('../../../assets/reject-restaurant.png')}
          style={[styles.rejectOverlay, rejectOverlayStyle]}
          resizeMode="contain"
        />
        <Animated.Image
          source={require('../../../assets/approve-restaurant.png')}
          style={[styles.acceptOverlay, acceptOverlayStyle]}
          resizeMode="contain"
        />
        <Animated.View style={cardAnimatedStyle} {...panResponder.panHandlers}>
          <RestaurantRec
            key={restaurant.id}
            restaurant={restaurant}
            setIndex={setIndex}
            setUserSkipped={setUserSkipped}
            setCurrentIndex={setCurrentIndex}
            setPressedStart={setPressedStart}
            setResult={setResult}
            onExpandedChange={onExpandedChange}
            onBack={handleBack}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
        <View style={styles.cardCenterer}>
          {renderCard()}
        </View>

        {currentIndex <= 9 && <View style = {styles.actionsWrapper}>
            <View style = {styles.swipeButtonsRow}>
              <TouchableOpacity
                style={[styles.swipeButton, { backgroundColor: colors.error }]}
                onPress={triggerReject}
              >
                <Ionicons name="close" size={32} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.swipeButton, { backgroundColor: colors.primary }]}
                onPress={triggerApprove}
              >
                <Ionicons name="checkmark" size={32} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.doneButtonWrapper}>
              <LargeButton outlined color="gray" onPress={incrementIndex}>
                I'm done
              </LargeButton>
            </View>
        </View>}
    </View>
  );
};
const styles = StyleSheet.create({
    root:{
      flex: 1,
      width: '100%',
      alignItems: 'center',
    },
    cardCenterer:{
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionsWrapper:{
      alignItems: 'center',
      gap: 34,
      paddingBottom: 40,
    },
    swipeButtonsRow:{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: 260,
    },
    swipeButton:{
      width: 67,
      height: 67,
      borderRadius: 33.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    doneButtonWrapper:{
      width: 198,
    },
  cardWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  rejectOverlay: {
    position: 'absolute',
    width: 300,
    height: 650,
    top: 20,
    left: -40,
  },
  acceptOverlay: {
    position: 'absolute',
    width: 300,
    height: 650,
    top: 20,
    right: -40,
  },
})
export default NewSwipeDeck;