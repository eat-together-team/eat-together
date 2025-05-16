import React, {useState} from 'react'
import {StyleSheet, View, TouchableOpacity, Text, Touchable} from "react-native";
import { Layout, TopNav} from "react-native-rapi-ui";
import MediumText from "../../components/MediumText";
import { Ionicons } from "@expo/vector-icons";
import CuisineCard from './CuisineCard';
import DietaryPref from './DietaryPref';
import CardCarousel from './CardCarousel';
import PriceRangeCard from './PriceRangeCard';
import StartCard from './StartCard';
import DontWorryCard from './DontWorryCard';
import restaurant from '../../restaurantFetch';

export default function ({navigation}) {
  //grab state of all user input to pass into Yelp params
  const [categoryAliases, setCategoryAliases] = useState([]);
  const [cuisineTagSelected, setCuisineTagSelected] = useState([]);
  const [priceRange, setPriceRange] = useState();
  const [selectedDietaryTags, setSelectedDietaryTags] = useState([]);
  const [index, setIndex] = useState(0);
  const [pressedFinished, setPressedFinished] = useState(false);
  const[result, setResult] = useState(null);

  //yelp
  const findRestaurant = async() =>{
    const categoryParams = categoryAliases + selectedDietaryTags;
    try{
      const result = await restaurant(categoryParams);
      console.log(result);
    }catch(err){
      console.log(err);
    }
  } 

  //increment index for button to render next card in carousel
  const incrementIndex = () => {
    if (index === cards.length - 1){
      setPressedFinished(true);
    } else{
      setIndex(Math.min(cards.length - 1, index + 1)); //can't go below index 0 
    }
  }

  //decrement index for button to go back to previous card in carousel
  const decrementIndex = () => {
    setIndex(Math.max(0, index - 1)); //can't go above card.length - 1
  }

  //card carousel
  const cards = [
    <StartCard incrementIndex = {incrementIndex}/>, 
    <DontWorryCard incrementIndex = {incrementIndex} decrementIndex = {decrementIndex}/>,
    <CuisineCard setCategoryAliases = {setCategoryAliases} categoryAliases = {categoryAliases} setCuisineTagSelected = {setCuisineTagSelected} cuisineTagSelected = {cuisineTagSelected}/>, 
    <DietaryPref setSelectedDietaryTags = {setSelectedDietaryTags} selectedDietaryTags = {selectedDietaryTags}/>, 
    <PriceRangeCard setPriceRange = {setPriceRange} priceRange = {priceRange}/>,
  ];

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText size = {17}>Discover Places To Eat</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => navigation.goBack()}
      />
      <View style = {styles.outerContainer}>
        <TouchableOpacity onPress= {findRestaurant}>
          <Text>Press</Text>
        </TouchableOpacity>
        <CardCarousel 
          cards = {cards} 
          incrementIndex = {incrementIndex} 
          decrementIndex = {decrementIndex} 
          index = {index}
          pressedFinished = {pressedFinished}
          setPressedFinished = {setPressedFinished}
        />
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
