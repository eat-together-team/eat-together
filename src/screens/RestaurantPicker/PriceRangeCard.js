import React from 'react'
import {StyleSheet, View} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import MediumText from '../../components/MediumText';
import PriceRangeButton from '../../components/PriceRangeButton';

// Price range screen that allows users to set price range preferences
const PriceRangeCard = ({setPriceRange, priceRange}) => {

  return (
    <View style={styles.cardWrapper}>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
              <MediumText center = "center" marginBottom={10}>What is your price {'\n'}range?</MediumText>
            </View>
            <View style = {styles.buttonContainer}>
              <PriceRangeButton dollars="$" text="$10 and under" setPriceRange = {setPriceRange} priceRange = {priceRange}/>
              <PriceRangeButton dollars="$$" text="$10 to $30" setPriceRange = {setPriceRange} priceRange = {priceRange}/>
              <PriceRangeButton dollars="$$$" text="$30 to $60" setPriceRange = {setPriceRange} priceRange = {priceRange}/>
              <PriceRangeButton dollars="$$$$" text="$60 and above" setPriceRange = {setPriceRange} priceRange = {priceRange}/>
            </View>
        </RestaurantCard>
    </View>
  )
}
const styles = StyleSheet.create({
    cardWrapper: {
      width: 311,
      borderWidth: 2,
      borderColor: '#D0D0D0',
      borderRadius: 20,
      overflow: 'hidden',
    },
    
    questionContainer:{
        backgroundColor:'#F7F7F7',
        width: '100%',
        display:'flex',
        justifyContent:'center',
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
