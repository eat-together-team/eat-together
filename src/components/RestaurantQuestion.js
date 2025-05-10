import React from 'react'
import {Text, StyleSheet} from 'react-native';

const RestaurantQuestion = (props) => {
  return (
    <Text style = {{
      fontFamily:'Inter',
      fontWeight:'700', 
      fontSize: props.size? 
      props.size : 18,
      marginBottom: props.marginBottom ? props.marginBottom : 0,
      color:'#5DB075',
      textAlign:'center'}}>
        {props.text}
    </Text>
  )
}

export default RestaurantQuestion
