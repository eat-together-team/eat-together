import React from 'react'
import {StyleSheet, View} from "react-native";
import RestaurantCard from '../../components/RestaurantCard';
import Button from '../../components/Button';
import LargeText from '../../components/LargeText';
const StartCard = ({incrementIndex, skipToSwiping}) => {
  return (
    <View>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
                <View style = {styles.textWrapper}>
                    <RestaurantQuestion size = {30} text = "Any thoughts on where to grab food?"/>
                </View>
            </View>
            <View style = {styles.buttonContainer}>
                <Button onPress={incrementIndex} fontSize={16} paddingHorizontal={25} paddingVertical={10}>Set Preferences First</Button>
                <Button onPress={skipToSwiping} fontSize={16} paddingHorizontal={25} paddingVertical={10}>I'd rather explore any!</Button>
            </View>
        </RestaurantCard>
    </View>
  )
}
const styles = StyleSheet.create({
    questionContainer:{
        backgroundColor:'#FFFFFF',
        width: '100%',
        height: 200,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
      },
      textWrapper: {
        width: '80%',
        alignItems: 'center',
      },
      buttonContainer:{
        height: 230,
        display:'flex',
        justifyContent:'space-evenly',
        alignItems:'center'
      }
})
export default StartCard
