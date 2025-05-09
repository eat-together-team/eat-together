import React from 'react'
import {StyleSheet, View, TextInput, Text, TouchableOpacity} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantStartQuestion from "../../components/RestaurantStartQuestion";
import Button from '../../components/Button';
const DontWorryCard = ({incrementIndex, decrementIndex}) => {
  return (
    <View>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
                <View style = {styles.textWrapper}>
                    <RestaurantStartQuestion text = {"Don't worry!\nWe'll help you!"}/>
                    <Text style = {styles.subText}>Start by answering a few questions!</Text>
                </View>
            </View>
            <View style = {styles.buttonContainer}>
                <Button onPress ={incrementIndex} fontSize={14} width={195} paddingVertical={10}>Start</Button>
                <Button onPress ={decrementIndex} fontSize={14} width={195} paddingVertical={10} backgroundColor={'white'} color={'#5DB075'}>Back</Button>
            </View>
        </RestaurantCard>
    </View>
  )
}
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
      subText:{
      fontFamily:'Inter',
      fontWeight: 600,
      fontSize: 20,
      lineHeight: 20,
      paddingVertical:10,
      color:"#A9A9A9",
      textAlign:'center'
    }
})
export default DontWorryCardimport React from 'react'
import {StyleSheet, View, TextInput, Text, TouchableOpacity} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantStartQuestion from "../../components/RestaurantStartQuestion";
import Button from '../../components/Button';
const DontWorryCard = () => {
  return (
    <View>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
                <View style = {styles.textWrapper}>
                    <RestaurantStartQuestion text = {"Don't worry!\nWe'll help you!"}/>\
                    <Text style = {styles.subText}>Start by answering a few questions!</Text>
                </View>
            </View>
            <View style = {styles.buttonContainer}>
                <Button fontSize={14} width={195} paddingVertical={10}>Start</Button>
                <Button fontSize={14} width={195} paddingVertical={10} backgroundColor={'white'} color={'#5DB075'}>Back</Button>
            </View>
        </RestaurantCard>
    </View>
  )
}
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
      subText:{
      fontFamily:'Inter',
      fontWeight: 600,
      fontSize: 20,
      lineHeight: 20,
      paddingVertical:10,
      color:"#A9A9A9",
      textAlign:'center'
    }
})
export default DontWorryCard
