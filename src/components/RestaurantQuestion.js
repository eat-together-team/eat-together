import React from 'react'
import {Text, StyleSheet} from 'react-native';

const RestaurantQuestion = (props) => {
  return (
    <Text style = {{fontFamily:'Inter', fontWeight:'600', fontSize:18, color:'#5DB075',
     textAlign:'center'}}>
        {props.text}
    </Text>
  )
}

export default RestaurantQuestion
