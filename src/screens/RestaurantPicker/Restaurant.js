import {useState, useEffect} from 'react'
import {StyleSheet, View, ScrollView} from "react-native";
import { Layout, TopNav} from "react-native-rapi-ui";
import MediumText from "../../components/MediumText";
import { Ionicons } from "@expo/vector-icons";
import CuisineCard from './CuisineCard';
import DietaryPref from './DietaryCard';
import CardCarousel from './CardCarousel';
import PriceRangeCard from './PriceRangeCard';
import StartCard from './StartCard';
import DontWorryCard from './DontWorryCard';
import SwipeDeck from './NewSwipeDeck';
import Results from './Results';
import restaurant from '../../restaurantFetch';


export default function ({navigation}) {
  //grab state of all user input to pass into Yelp params
  const [categoryAliases, setCategoryAliases] = useState([]);
  const [cuisineTagSelected, setCuisineTagSelected] = useState([]);
  const [priceRange, setPriceRange] = useState();
  const [selectedDietaryTags, setSelectedDietaryTags] = useState([]);
  const [index, setIndex] = useState(0); // for 
  const [pressedFinished, setPressedFinished] = useState(false);
  const[result, setResult] = useState(null); 
  const[userResults, setUserResults] = useState([]);
  const[loading, setLoading] = useState(true); 
  const [userSkipped, setUserSkipped] = useState(false);
  const [pressedStart, setPressedStart] = useState(false);
  const [progress, setProgress] = useState(0.33);
  const [swipingFinished, setSwipingFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // for restaurant list
  const [resultVisible, setResultVisible] = useState(true);

  console.log(currentIndex);
  console.log("Pressed Start: " + pressedStart);
  console.log("User Skipped: " + userSkipped);
  //makes API call
  const findRestaurant = async() =>{
    //combine category params
    const categoryParams = categoryAliases.concat(selectedDietaryTags);
    try{
      const result = await restaurant(categoryParams);
      console.log(result);
      // const formattedResponse = extractRestaurantInfo(result);

      // return result;
    }catch(err){
      console.log(err);
    }
  } 

  //Format the response from Yelp API
  // const extractRestaurantInfo = (businesses) => {
  //   if (!businesses || businesses.length === 0) {
  //     return [];
  //   }
  
  //   return businesses.map(business => {
  //     return {
  //       id: business.id,
  //       name: business.name,
  //       rating: business.rating,
  //       reviewCount: business.review_count,
  //       price: business.price,
  //       categories: business.categories.map(cat => cat.title).join(', '),
  //       address: business.location.display_address.join(', '),
  //       phone: business.display_phone,
  //       distance: Math.round(business.distance), 
  //       imageUrl: business.image_url,
  //       url: business.url
  //     };
  //   });
  // };

  //make API request once user pressed "Finish" button
  useEffect(() => {
    if (pressedStart || userSkipped) {
      const fetchData = async() => {
        try{
          const response = await findRestaurant();
          console.log(response);

          setResult(response);
          setLoading(false);
        }catch(err){
          console.log(err);
        }
      }
      fetchData();
    }
  }, [pressedStart, userSkipped]);

  //increment index for button to render next card in carousel
  const incrementIndex = () => {
    console.log("Current card index: " + index);

    // only increase progress bar if on pref cards
    if (index >= 2 && index <= 3){
      setProgress(progress => progress + 0.34);
    }
    if (index === cards.length - 3){
      setPressedFinished(true);
      if(pressedFinished){ //if user presses start button when modal is up, increment index
        setPressedStart(true);
        setIndex(Math.min(cards.length - 1, index + 1));
      }
    } else{
      setIndex(Math.min(cards.length - 1, index + 1)); //can't go below index 0 
    }
  }

  //decrement index for button to go back to previous card in carousel
  const decrementIndex = () => {
    if (index > 2 && index <= 4){
      setProgress(progress => progress - 0.34);
    }
    setIndex(Math.max(0, index - 1)); //can't go above card.length - 1
  }

  //Skip to explore function
  const skipToSwiping = () => {
    setIndex(5);
    setUserSkipped(true);
  }

  //validation for user selection before allowing them to proceed
  const validateSteps = () => {
    console.log("Executed");
    switch(index){
      case 2:
        return cuisineTagSelected.length === 0
      case 3:
        return false
      case 4:
        return !priceRange
    }
  }

  //List of card componenets for carousel
  const cards = [
    <StartCard 
      incrementIndex = {incrementIndex} 
      skipToSwiping = {skipToSwiping}
    />, 
    <DontWorryCard 
      incrementIndex = {incrementIndex} 
      decrementIndex = {decrementIndex}
    />,
    <CuisineCard 
      setCategoryAliases = {setCategoryAliases} 
      categoryAliases = {categoryAliases} 
      setCuisineTagSelected = {setCuisineTagSelected} 
      cuisineTagSelected = {cuisineTagSelected}
    />, 
    <DietaryPref 
      setSelectedDietaryTags = {setSelectedDietaryTags} 
      selectedDietaryTags = {selectedDietaryTags}
    />, 
    <PriceRangeCard 
      setPriceRange = {setPriceRange} 
      priceRange = {priceRange}
    />,
    <SwipeDeck 
      listOfRestaurants = {result} 
      setSwipingFinished ={setSwipingFinished} 
      swipingFinished = {swipingFinished} 
      userResults = {userResults} 
      setUserResults = {setUserResults} 
      incrementIndex = {incrementIndex} 
      currentIndex = {currentIndex}
      setCurrentIndex = {setCurrentIndex}
      setIndex = {setIndex}
      setUserSkipped = {setUserSkipped}
      setPressedStart = {setPressedStart}
    />,
    <Results 
      userResults = {userResults}
      resultVisible={resultVisible}
      setResultVisible = {setResultVisible}
    />
  ];

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText size = {17}>Discover Places To Eat</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => navigation.goBack()}
      />
      <ScrollView 
        keyboardShouldPersistTaps="handled"
        >
      <View style = {styles.outerContainer}>
        <CardCarousel 
          cards = {cards} 
          incrementIndex = {incrementIndex} 
          decrementIndex = {decrementIndex} 
          index = {index}
          pressedFinished = {pressedFinished}
          setPressedFinished = {setPressedFinished}
          skipToSwiping = {skipToSwiping}
          validateSteps= {validateSteps}
          progress = {progress}
          setProgress = {setProgress}
        />
      </View>
      </ScrollView>
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
  },
  buttonContainer:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'center',
        padding:20,
  },
})
