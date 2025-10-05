import React from 'react'
import {StyleSheet, View} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import MediumText from '../../components/MediumText';
import PriceRangeButton from '../../components/PriceRangeButton';

// Price range screen that allows users to set price range preferences
const PriceRangeCard = ({setPriceRange, priceRange}) => {

  return (
    <View>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
              <MediumText center = "center" color = "#5DB075">What is your price {'\n'}range?</MediumText>
            </View>
            <View style = {styles.buttonContainer}>
              <PriceRangeButton dollars="$" text="(Under $10)" setPriceRange = {setPriceRange} priceRange = {priceRange}/>
              <PriceRangeButton dollars="$$" text="($11-$30)" setPriceRange = {setPriceRange} priceRange = {priceRange}/>
              <PriceRangeButton dollars="$$$" text="($31-$60)" setPriceRange = {setPriceRange} priceRange = {priceRange}/>
              <PriceRangeButton dollars="$$$$" text="(Above $61)" setPriceRange = {setPriceRange} priceRange = {priceRange}/>
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
