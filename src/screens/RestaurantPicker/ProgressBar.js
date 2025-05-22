import React from 'react'
 import {Text, View} from 'react-native';
const ProgressBar = ({index}) => {
  return (
  <View style = {{
        width:160,
        height:6,
        backgroundColor:"white",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#5DB075',
        borderStyle: 'solid',
        marginLeft: "auto",
        marginRight: 'auto',
        marginBottom: 5,}}>
    <View style = {{
        backgroundColor:'#5FB173',
        height:6,
        borderRadius: 15,
        width: index === 2? 160/3 : index === 3 ? 160 * (2/3): 160
        }}>
    </View>
  </View>
  )
}

export default ProgressBar
