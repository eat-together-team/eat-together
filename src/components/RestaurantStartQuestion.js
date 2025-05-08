import React from 'react'
import {Text, StyleSheet} from 'react-native';

const RestaurantQuestion = (props) => {
  return (
    <Text style = {{fontFamily:'Inter', fontWeight:'700', fontSize:36, color:'#5DB075',
     textAlign:'center'}}>
        {props.text}
    </Text>
  )
}

export default RestaurantQuestion