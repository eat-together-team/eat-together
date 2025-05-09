import React,{useState, useEffect} from 'react'
import {StyleSheet, View, TextInput, Text, TouchableOpacity} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantQuestion from "../../components/RestaurantQuestion";
import PriceRangeButton from './PriceRangeButton';

const PriceRangeCard = ({setPriceRange}) => {
  return (
    <View>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
                <RestaurantQuestion text = "What is your price range?"/>
            </View>
            <View style = {styles.buttonContainer}>
              <PriceRangeButton dollars="$" text="(Under $10)" setPriceRange = {setPriceRange}/>
              <PriceRangeButton dollars="$$" text="($11-$30)" setPriceRange = {setPriceRange}/>
              <PriceRangeButton dollars="$$$" text="($31-$60)" setPriceRange = {setPriceRange}/>
              <PriceRangeButton dollars="$$$$" text="(Above $61)" setPriceRange = {setPriceRange}/>
            </View>
        </RestaurantCard>
    </View>
  )
}
const styles = StyleSheet.create({
    questionContainer:{
        backgroundColor:'#FFFFFF',
        width: '100%',
        height: 105,
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
      exampleTextContainer:{
        marginTop:30,
        marginBottom:10,
      },
      exampleText:{
        fontFamily:'Inter',
        fontWeight: 600,
        fontSize:15,
        lineHeight: 15,
        color:"#A9A9A9",
        textAlign:'center'
      },
      dietTagInput:{
        width:"90%",
        borderColor:'gray',
        borderWidth: 0.5,
        borderRadius: 5,
        height: 35,
      },
      textInputContainer:{
        alignItems:'center',
      },
      buttonContainer:{
        height: 370,
        display:'flex',
        justifyContent:'space-evenly',
        alignItems:'center'
      }
})
export default PriceRangeCard
