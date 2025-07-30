import { View, Modal, StyleSheet } from 'react-native';
import MediumText from '../../components/MediumText';
import SmallText from '../../components/SmallText';
import Button from '../../components/Button';
import RestaurantRec from '../../components/RestaurantRec';
import GreenButton from '../../components/GreenButton';
import RedButton from '../../components/RedButton';
import LargeText from '../../components/LargeText';

// "Swipe Deck" screen that renders each restaurant that is tailored to user preferences
const NewSwipeDeck = ({listOfRestaurants, swipingFinished, setSwipingFinished, incrementIndex, currentIndex, setCurrentIndex, setIndex, setUserSkipped, setPressedStart, setUserResults, setResult}) => {
  // store restaurant if green button is pressed
  const storeRestaurant = () => {
    setCurrentIndex((prev) => (prev + 1));
    setUserResults(prev => [...prev, listOfRestaurants[currentIndex]]);
  };

  // Ignore if red button is pressed
  const ignoreRestaurant = () => {
    setCurrentIndex((prev) => (prev + 1));
  };
  
  // Wait until API response loads
  if(!listOfRestaurants){
    return (
      <View style = {{marginTop: 300}}>
        <MediumText>Loading...</MediumText>
      </View>
    )
  }

  // Renders each restaurant as a card
  const renderCard = (restaurant) => {
    return (
        <>
            <RestaurantRec restaurant = {restaurant} setIndex = {setIndex} setUserSkipped = {setUserSkipped} setCurrentIndex = {setCurrentIndex} setPressedStart = {setPressedStart} setResult = {setResult}>
            </RestaurantRec>  
        </>
    );
  };

  return (
    <View>
        {renderCard(listOfRestaurants[currentIndex])}
        
        {currentIndex < 10 && <View>
            <MediumText center = {true} marginBottom = {12} style = {{marginTop:20}} >
              {listOfRestaurants.length - currentIndex} Cards Left
            </MediumText>
          <View style = {{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
            <RedButton onPress ={ignoreRestaurant}/>
            <Button onPress ={()=> setSwipingFinished(true)} width = {100} height = {10} fontSize = {13} paddingVertical = {1} paddingHorizontal = {1}>Finish</Button>
            <GreenButton onPress= {storeRestaurant}/>
          </View>
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
export default NewSwipeDeck;