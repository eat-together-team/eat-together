import {useState, useEffect} from 'react'
import {StyleSheet, View,} from "react-native";
import { Layout, TopNav} from "react-native-rapi-ui";
import MediumText from "../../components/MediumText";
import { Ionicons } from "@expo/vector-icons";
import CuisineCard from './CuisineCard';
import DietaryPref from './DietaryPref';
import CardCarousel from './CardCarousel';
import PriceRangeCard from './PriceRangeCard';
import StartCard from './StartCard';
import DontWorryCard from './DontWorryCard';
import SwipeDeck from './SwipeDeck';
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
  console.log(pressedFinished);
  //makes API call
  const findRestaurant = async() =>{
    //combine category params
    const categoryParams = categoryAliases.concat(selectedDietaryTags);
    try{
      const result = await restaurant(categoryParams);

      const formattedResponse = extractRestaurantInfo(result);

      return formattedResponse;
    }catch(err){
      console.log(err);
    }
  } 

  //Format the response from Yelp API
  const extractRestaurantInfo = (businesses) => {
    if (!businesses || businesses.length === 0) {
      return [];
    }
  
    return businesses.map(business => {
      return {
        id: business.id,
        name: business.name,
        rating: business.rating,
        reviewCount: business.review_count,
        price: business.price,
        categories: business.categories.map(cat => cat.title).join(', '),
        address: business.location.display_address.join(', '),
        phone: business.display_phone,
        distance: Math.round(business.distance), 
        imageUrl: business.image_url,
        url: business.url
      };
    });
  };

  //make API request once user pressed "Finish" button
  useEffect(() => {
    if (pressedFinished) {
      const fetchData = async() => {
        try{
          const response = await findRestaurant();
          console.log(response);

          setResult(response);
        }catch(err){
          console.log(err);
        }
      }
      fetchData();
    }
  }, [pressedFinished]);
  //increment index for button to render next card in carousel
  const incrementIndex = () => {
    if (index === cards.length - 2){
      setPressedFinished(true);
      if(pressedFinished){ //if user presses start button when modal is up, increment index
        setIndex(Math.min(cards.length - 1, index + 1));
      }
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
    <SwipeDeck result = {result}/>
  ];

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText size = {17}>Discover Places To Eat</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => navigation.goBack()}
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
