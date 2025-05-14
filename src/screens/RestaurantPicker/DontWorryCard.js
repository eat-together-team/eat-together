import React from 'react'
import {StyleSheet, View} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import Button from '../../components/Button';
import MediumText from '../../components/MediumText';
import LargeText from '../../components/LargeText';

const DontWorryCard = ({incrementIndex, decrementIndex}) => {
  return (
    <View>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
                <View style = {styles.textWrapper}>
                    <RestaurantQuestion marginBottom = {10} size = {30} text = {"Don't worry!\nWe'll help you!"}/>
                    <MediumText size = {18} color = "#808080" center = "center">Start by answering a few questions!</MediumText>
                </View>
            </View>
            <View style = {styles.buttonContainer}>
                <Button onPress ={incrementIndex} fontSize={14} width={195} paddingVertical={10}>Start</Button>
                <Button onPress ={decrementIndex} fontSize={14} width={195} paddingVertical={10} backgroundColor={'white'} color={'#5DB075'}>Back</Button>
            </View>
        </RestaurantCard>
    </View>
  )
};
const styles = StyleSheet.create({
    questionContainer:{
        backgroundColor:'#FFFFFF',
        width: '100%',
        height: 210,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        display:'flex',
        justifyContent:'space-evenly',
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
      },
})
export default DontWorryCard