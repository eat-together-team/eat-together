import React from 'react'
import {StyleSheet, View, } from "react-native";
import { Layout, TopNav} from "react-native-rapi-ui";
import MediumText from "../../components/MediumText";
import { Ionicons } from "@expo/vector-icons";
import CuisineCard from './CuisineCard';
import DietaryPref from './DietaryPref';
import CardCarousel from './CardCarousel';
import PriceRangeCard from './PriceRangeCard';
import StartCard from './StartCard';

const Restaurant = ({navigation}) => {
  const cards = [<StartCard/>, <CuisineCard/>, <DietaryPref/>, <PriceRangeCard/>]
  return (
    <Layout>
      <TopNav 
        middleContent={<MediumText size = "17">Discover Places To Eat</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        onPress= {() => navigation.goBack()}
      />
      <View style = {styles.outerContainer}>
        <CardCarousel cards = {cards}/>
      </View>
    </Layout>
  )
}

const styles = StyleSheet.create({
  outerContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  buttonContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    padding:20,
  }
})
export default Restaurant
