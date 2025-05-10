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
import DontWorryCard from './DontWorryCard';

export default function ({navigation}) {
  //grab state of all user input
  const [categoryAliases, setCategoryAliases] = useState([]);
  const [priceRange, setPriceRange] = useState();
  const [selectedDietaryTags, setSelectedDietaryTags] = useState([]);
  const [index, setIndex] = useState(0);
  const[pressedFinished, setPressedFinished] = useState(false);

  const incrementIndex = ()=>{
    if(index === cards.length - 1){
      setPressedFinished(true);
    }else{
      setIndex(Math.min(cards.length - 1, index + 1)); //can't go below index 0 
    }

  }
  const decrementIndex = () =>{
    setIndex(Math.max(0, index - 1)); //can't go above card.length - 1
  }

  //card carousel
  const cards = [
    <StartCard incrementIndex = {incrementIndex}/>, 
    <DontWorryCard incrementIndex = {incrementIndex} decrementIndex = {decrementIndex}/>,
    <CuisineCard setCategoryAliases = {setCategoryAliases}/>, 
    <DietaryPref setSelectedDietaryTags = {setSelectedDietaryTags} selectedDietaryTags = {selectedDietaryTags}/>, 
    <PriceRangeCard setPriceRange = {setPriceRange} priceRange = {priceRange}/>
  ];

  return (
    <Layout>
      <TopNav 
        middleContent={<MediumText size = "17">Discover Places To Eat</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        onPress= {() => navigation.goBack()}
      />
      <View style = {styles.outerContainer}>
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
export default Restaurant
