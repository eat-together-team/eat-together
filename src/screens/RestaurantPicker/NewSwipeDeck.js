import { View, Modal, StyleSheet, Animated, PanResponder } from 'react-native';
import { useEffect, useRef } from 'react';
import MediumText from '../../components/MediumText';
import Button from '../../components/Button';
import RestaurantRec from '../../components/RestaurantRec';
import LargeText from '../../components/LargeText';
import CustomButton from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

// "Swipe Deck" screen that renders each restaurant that is tailored to user preferences
const NewSwipeDeck = ({listOfRestaurants, swipingFinished, setSwipingFinished, incrementIndex, currentIndex, setCurrentIndex, setIndex, setUserSkipped, setPressedStart, setUserResults, setResult, onExpandedChange}) => {
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
      // If we've reached the end of the list, show the finish modal
      if (!listOfRestaurants[next]) {
        setSwipingFinished(true);
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
        <MediumText>Loading...</MediumText>
      </View>
    )
  }

  const restaurant = listOfRestaurants[currentIndex];

  // Renders each restaurant as a card
  const renderCard = () => {
    if (!restaurant) {
      if (!swipingFinished) {
        setSwipingFinished(true);
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
    <View>
        {renderCard()}
        
        {currentIndex <= 9 && <View style = {{marginTop:20}}>
            <View>
              <View style = {{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems: "center",}}>
                <CustomButton
                  width={67}
                  height={67}
                  borderRadius={50}
                  backgroundColor="#F8AEAE"
                  onPress={triggerReject}
                >
                  <Ionicons name="close" size={50} />
                </CustomButton>
                <CustomButton
                  width={67}
                  height={67}
                  borderRadius={50}
                  onPress={triggerApprove}
                >
                  <Ionicons name="checkmark" size={50} />
                </CustomButton>
              </View>
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <Button onPress ={()=> setSwipingFinished(true)} 
                  backgroundColor="white" 
                  color="#A9A9A9" 
                  borderWidth={2} 
                  borderColor="#A9A9A9" 
                  noShadow
                  paddingHorizontal={70}
                  paddingVertical={10}
                  fontSize={15}
                >
                    I'm done
                </Button>
              </View>
            </View>
        </View>}
        {/* Modal when finished button pressed*/}
        <Modal visible={swipingFinished} transparent={true}>
            <View style = {styles.overlay}>
                <View style = {styles.prefContainer}>
                    <LargeText color = "#5DB075" center = "center" marginBottom = {10} style ={{marginTop: 70, marginHorizontal: 20}} >
                      Finish to view your results? 
                    </LargeText>
                    <View style = {[styles.buttonContainer, {marginTop:30}]}>
                        <Button
                            backgroundColor="white"
                            color="#A9A9A9"
                            onPress={() => {
                                setSwipingFinished(false);
                            }}
                            fontSize={16}
                            paddingHorizontal={25}
                            paddingVertical={10}
                            marginHorizontal={10}
                            noShadow
                            borderWidth={2}
                            borderColor="#A9A9A9"
                        >
                            Back
                        </Button>
                        <Button
                            fontSize={16}
                            paddingHorizontal={25}
                            paddingVertical={10}
                            marginHorizontal={10}
                            onPress={incrementIndex}
                            noShadow
                        >
                            Finish
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  overlay:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    prefContainer:{
      display:'flex',
      backgroundColor:"#F7F7F7",
      borderRadius:20,
      height:315,
      width:290,
    },
    buttonContainer:{
      display:'flex',
      flexDirection:'row',
      justifyContent:'center',
      alignItems:'flex-end',
  },
  finishContainer:{
      textAlign:'center',
  },
  cardWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginTop: -36,
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