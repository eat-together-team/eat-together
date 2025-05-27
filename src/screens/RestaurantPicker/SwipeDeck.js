import {View} from "react-native";
import {useState, useEffect, useCallback} from 'react'
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantRec from '../../components/RestaurantRec';
import {Swiper} from 'rn-swiper-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const SwipeDeck = ({result, cardsLeft, userResults, setCardsLeft, setUserResults}) => {
  
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setCardsLeft(result.length);
  }, [result.length, setCardsLeft]);
  
  const handleSwipeLeft = useCallback(() => {
    setCardsLeft(prev => prev - 1);
  }, [setCardsLeft]);

  const handleSwipeRight = useCallback((index) => {
    setCardsLeft(prev => prev - 1);
    setUserResults(prev => [...prev, result[index]]);
  }, [setCardsLeft, setUserResults]);

  console.log("WHATTT", userResults);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 40 }}>
        <Swiper
          cardStyle={{
            alignSelf: 'center',
          }}
          data={result}
          renderCard={(item, index) => (
            <RestaurantCard key = {index} expanded={expanded}>
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
    </GestureHandlerRootView>
  )
}
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    marginRight: 350,
  },
  container: {
    backgroundColor: "orange",
    height: 550,
    width: 320,
    borderRadius: 40,
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
  }
})
export default SwipeDeck
