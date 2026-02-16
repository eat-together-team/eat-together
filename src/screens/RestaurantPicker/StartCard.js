import React from 'react'
import {StyleSheet, View} from "react-native";
import RestaurantCard from '../../components/RestaurantCard';
import Button from '../../components/Button';
import LargeText from '../../components/LargeText';
import SmallText from '../../components/SmallText';

// Explore screen where user can start setting preferences or go straight into exploring restaurants
const StartCard = ({incrementIndex, skipToSwiping}) => {
  return (
    <View style={styles.cardWrapper}>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
                <View style = {styles.textWrapper}>
                    <LargeText color = "#808080" size = {30}>Before we start,</LargeText>
                    <LargeText color = "#5DB075" size = {30}>Any preferences in mind?</LargeText>
                    <SmallText size = {13} style={styles.bodyText}>Tell us more about your favorite cuisines, foods, price range, and dietary restrictions so we can provide you more personalized recommendations.</SmallText>
                </View>
            </View>
            <View style = {styles.buttonContainer}>
                <Button onPress={incrementIndex} width="80%" fontSize={16} paddingHorizontal={25} 
                        paddingVertical={10} marginBottom={14} noShadow>Set Preferences</Button>
                <Button onPress={skipToSwiping} width="80%" fontSize={16} paddingHorizontal={25} 
                        paddingVertical={10} noShadow backgroundColor="#F7F7F7" color="#5DB075" 
                        borderWidth={2} borderColor="#5DB075">I'm open to anything!</Button>
            </View>
        </RestaurantCard>
    </View>
  )
}
const styles = StyleSheet.create({
    cardWrapper: {
        borderWidth: 2,
        borderColor: '#D0D0D0',
        borderRadius: 20,
    },

    questionContainer:{
        backgroundColor:'#F7F7F7',
        width: '100%',
        height: 200,
        display:'flex',
        justifyContent:'flex-start',
        alignItems:'center'
      },

      textWrapper: {
        width: '80%',
        alignItems: 'flex-start',
      },

      bodyText: {
        marginTop: 14,
      },

      buttonContainer:{
        flex: 1,
        display:'flex',
        justifyContent:'flex-end',
        alignItems:'center',
        paddingBottom: 12,
      }
})
export default StartCard
