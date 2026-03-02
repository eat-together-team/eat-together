import { View, Modal, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import MediumText from '../../components/MediumText';
import Button from '../../components/Button';
import RestaurantRec from '../../components/RestaurantRec';
import LargeText from '../../components/LargeText';
import CustomButton from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

// "Swipe Deck" screen that renders each restaurant that is tailored to user preferences
const NewSwipeDeck = ({listOfRestaurants, swipingFinished, setSwipingFinished, incrementIndex, currentIndex, setCurrentIndex, setIndex, setUserSkipped, setPressedStart, setUserResults, setResult, onExpandedChange}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  // reset card position when index changes
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    cardOpacity.value = 0;
    cardOpacity.value = withTiming(1, { duration: 200 });
  }, [currentIndex]);

  // new card starts collapsed, so parent can disable scroll
  useEffect(() => {
    onExpandedChange?.(false);
  }, [currentIndex]);

  // store restaurant if green button is pressed (or swipe right)
  const storeRestaurant = () => {
    setCurrentIndex((prev) => (prev + 1));
    setUserResults(prev => [...prev, listOfRestaurants[currentIndex]]);
  };

  // Ignore if red button is pressed
  const ignoreRestaurant = () => {
    setCurrentIndex((prev) => (prev + 1));
  };

  // card animation when declining a restaurant
  const triggerReject = () => {
    translateX.value = withTiming(-400, { duration: 180 }, (finished) => {
      if (finished) {
        runOnJS(ignoreRestaurant)();
      }
    });
  };

  // card animation when approving a restaurant
  const triggerApprove = () => {
    translateX.value = withTiming(400, { duration: 180 }, (finished) => {
      if (finished) {
        runOnJS(checkLimit)();
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

  const checkLimit = () => {
    if (currentIndex >= 9) {
      setSwipingFinished(true);
    } else {
      storeRestaurant();
    }
  };

  // translation for angled card swiping
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-40, 40])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      const goRight = e.translationX > 80 || e.velocityX > 300;
      const goLeft = e.translationX < - 80 || e.velocityX < -300;
      if (goRight) {
        translateX.value = withTiming(400, { duration: 180 }, (finished) => {
          if (finished) runOnJS(checkLimit)();
        });
      } else if (goLeft) {
        translateX.value = withTiming(-400, { duration: 180 }, (finished) => {
          if (finished) runOnJS(ignoreRestaurant)();
        });
      } else {
        translateX.value = 0;
        translateY.value = 0;
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = (translateX.value / 350) * 12;
    return {
      opacity: cardOpacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  // rejected background when declining a restaurant
  const rejectOverlayStyle = useAnimatedStyle(() => {
    const isLeft = translateX.value < 0;
    const magnitude = Math.abs(translateX.value);
    const opacity = isLeft ? Math.min(magnitude / 140, 1) : 0;
    const scale = 0.9 + opacity * 0.15;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // accepted background when approving a restaurant
  const acceptOverlayStyle = useAnimatedStyle(() => {
    const isRight = translateX.value > 0;
    const magnitude = Math.abs(translateX.value);
    const opacity = isRight ? Math.min(magnitude / 140, 1) : 0;
    const scale = 0.9 + opacity * 0.15;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Wait until API response loads
  if(!listOfRestaurants){
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
      return (
        <RestaurantRec
          restaurant={restaurant}
          setIndex={setIndex}
          setUserSkipped={setUserSkipped}
          setCurrentIndex={setCurrentIndex}
          setPressedStart={setPressedStart}
          setResult={setResult}
          onExpandedChange={onExpandedChange}
          onBack={handleBack}
        />
      );
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
        <GestureDetector gesture={panGesture}>
          <Animated.View style={cardAnimatedStyle}>
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
        </GestureDetector>
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