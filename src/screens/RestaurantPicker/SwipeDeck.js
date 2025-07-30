import { View, Modal, StyleSheet } from "react-native";
import { useState, useEffect, useCallback } from 'react';
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantRec from '../../components/RestaurantRec';
import Button from "../../components/Button";
import MediumText from "../../components/MediumText";
import LargeText from "../../components/LargeText";
import { Swiper } from 'rn-swiper-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const SwipeDeck = ({ setSwipingFinished, swipingFinished, result, cardsLeft, setCardsLeft, setUserResults, loading, incrementIndex }) => {
  console.log(swipingFinished)
  //loading if component renders before response
  if (loading) {
    return (
      <MediumText>
        Loading...
      </MediumText>
    );
  }

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setCardsLeft(result.length);
  }, [result.length, setCardsLeft]);

  const handleSwipeLeft = useCallback(() => {
    setCardsLeft(prev => prev - 1);
  }, [setCardsLeft]);

  const handleSwipeRight = useCallback((index) => {
    setCardsLeft(prev => prev - 1);
    p
  }, [setCardsLeft, setUserResults]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Top: Swiper area */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 40 }}>
          <Swiper
            cardStyle={{ alignSelf: 'center' }}
            disableTopSwipe={true}
            disableBottomSwipe={true}
            data={result}
            renderCard={(item, index) => (
              <RestaurantCard key={index} expanded={expanded}>
                <RestaurantRec
                  expanded={expanded}
                  setExpanded={setExpanded}
                  restaurant={item}
                />
              </RestaurantCard>
            )}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        </View>
        {!expanded && <View style={{ alignItems: 'center' }}>
          <MediumText size={12} >
            {cardsLeft} Cards Left
          </MediumText>
          <Button
            onPress= {()=> setSwipingFinished(true)}
            marginVertical={0}
            width={150}
          >
            Finish
          </Button>
        </View>}
        {/* Modal when finished button pressed*/}
        <Modal visible={swipingFinished} transparent={true}>
            <View style = {styles.overlay}>
                <View style = {styles.prefContainer}>
                    <LargeText color = "#5DB075" center = "center" marginBottom = {10}style ={{marginTop: 70}} >
                      Finish to view results? 
                    </LargeText>
                    <View style = {[styles.buttonContainer, {marginTop:30}]}>
                        <Button
                            backgroundColor="white"
                            color="#5DB075"
                            onPress={() => {
                                setSwipingFinished(false);
                            }}
                            fontSize={16}
                            paddingHorizontal={25}
                            paddingVertical={10}
                            marginHorizontal={10}
                        >
                            Back
                        </Button>
                        <Button
                            fontSize={16}
                            paddingHorizontal={25}
                            paddingVertical={10}
                            marginHorizontal={10}
                            onPress={incrementIndex}
                        >
                            Finish
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
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
  }
})
export default SwipeDeck;
