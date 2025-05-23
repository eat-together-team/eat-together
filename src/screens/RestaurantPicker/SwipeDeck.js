import {View, Text} from "react-native";
const SwipeDeck = ({result}) => {
  
  return (
    <View>
      {result.map((restaurant) => {
        return(
          <Text>{restaurant.name}</Text>
        )
      })}
    </View>
  )
}

export default SwipeDeck
