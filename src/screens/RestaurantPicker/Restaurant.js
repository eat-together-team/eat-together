import React, {useState} from 'react'
import {StyleSheet, View, } from "react-native";
import { Layout, TopNav} from "react-native-rapi-ui";
import MediumText from "../../components/MediumText";
import { Ionicons } from "@expo/vector-icons";
import CuisineCard from './CuisineCard';
import DietaryPref from './DietaryPref';
import CardCarousel from './CardCarousel';
import PriceRangeCard from './PriceRangeCard';
import StartCard from './StartCard';

export default function ({navigation}) {
  //grab state of all user input
  const [categoryAliases, setCategoryAliases] = useState([]);
  const [priceRange, setPriceRange] = useState();
  const [selectedDietaryTags, setSelectedDietaryTags] = useState([]);
  const [index, setIndex] = useState(0);
  const incrementIndex = ()=>{
    setIndex(Math.min(cards.length - 1, index + 1)); //can't go below index 0
    console.log(index);
  }
  const decrementIndex = () =>{
    setIndex(Math.max(0, index - 1)); //can't go above card.length - 1
  }

  //card carousel
  const cards = [<StartCard incrementIndex = {incrementIndex}/>, 
  <CuisineCard setCategoryAliases = {setCategoryAliases}/>, 
  <DietaryPref setSelectedDietaryTags = {setSelectedDietaryTags} selectedDietaryTags = {selectedDietaryTags}/>, 
  <PriceRangeCard setPriceRange = {setPriceRange}/>];

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText size = "17">Discover Places To Eat</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => navigation.goBack()}
      />
      <View style = {styles.outerContainer}>
        <CardCarousel cards = {cards} incrementIndex = {incrementIndex} decrementIndex = {decrementIndex} index = {index}/>
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
