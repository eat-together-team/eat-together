import React from 'react'
import {View} from 'react-native';

const RestaurantCard = ({children, expanded}) => {
  return (
    <View style={{
      width: 311,
      height: expanded ? undefined : 500,
      backgroundColor: "#FFFFFF",
      borderRadius: 40,
      shadowOpacity: 0.25,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      marginBottom: 10,
      marginTop: 50,
      overflow: 'hidden',
    }}>
      {children}
    </View>
  )
}
export default RestaurantCard
