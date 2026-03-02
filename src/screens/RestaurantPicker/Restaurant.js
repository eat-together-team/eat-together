import {useState, useEffect} from 'react'
import {StyleSheet, View, ScrollView, Alert} from "react-native";
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
import weighRestaurant from '../../restaurantSorting';
import foodTagsToYelpCategories from '../../yelpTags';

// Renders card carousel and handles business logic 
export default function ({navigation, route}) {

  const [categoryAliases, setCategoryAliases] = useState([]);
  const [cuisineTagSelected, setCuisineTagSelected] = useState([]);
  const [priceRange, setPriceRange] = useState();
  const [selectedDietaryTags, setSelectedDietaryTags] = useState([]);

  useEffect(() => {
    const params = route.params || {};
    if (params.cuisineTagSelected != null) {
      setCuisineTagSelected(params.cuisineTagSelected);
      navigation.setParams({ cuisineTagSelected: undefined });
    }
    if (params.selectedDietaryTags != null) {
      setSelectedDietaryTags(params.selectedDietaryTags);
      navigation.setParams({ selectedDietaryTags: undefined });
    }
  }, [route.params]);
  
  const [index, setIndex] = useState(0); // Index for card carousel
  const [pressedFinished, setPressedFinished] = useState(false);
  const [result, setResult] = useState(null); 
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [userSkipped, setUserSkipped] = useState(false);
  const [pressedStart, setPressedStart] = useState(false);
  const [progress, setProgress] = useState(0.33);
  const [swipingFinished, setSwipingFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Index for list of restaurants
  const [resultVisible, setResultVisible] = useState(true);
  const [swipeCardExpanded, setSwipeCardExpanded] = useState(false);

  //Queries Yelp restaurant data
  const findRestaurant = async() =>{
    
    //combine category params (map dietary display names to Yelp aliases)
    const dietaryAliases = selectedDietaryTags
      .map((tag) => foodTagsToYelpCategories[tag])
      .filter(Boolean);
    const categoryParams = categoryAliases.concat(dietaryAliases);
    
    try{

      // 1. fetch restaurants based on user categories
      const result = await restaurant(categoryParams);

      // 2. get match scores (parallel to each restaurant in result)
      const matchScores =  result.map(business => 
        weighRestaurant({restaurant: business, cuisinePref: categoryAliases, dietaryPref: selectedDietaryTags, priceRange: priceRange}))
      // 3. Pair restaurants with scores
      const restaurantWithScores = result.map((restaurant, index) => ({
        ...restaurant,
        matchScore: matchScores[index]
      }));

      // 4. sort from highest to lowest
      const sortedRestaurants = restaurantWithScores.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }

        // tie-breaker 1: rating
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }

        // tie-breaker 2: review count
        return b.reviewCount - a.reviewCount;
      });

      return sortedRestaurants;

    }catch(err){
      if(err.message === 'Cannot read property \'length\' of undefined'){
        Alert.alert('No restaurants found. Please try different preferences.');
        return
      }
      else{
        console.log(err);
        Alert.alert('An Error Occurred. Please try again later.');
        return
      }
    }
  } 

  //make API request once user pressed "Finish" button in quiz or skipped straight to exploring
  useEffect(() => {
    if (pressedStart || userSkipped) {
      const fetchData = async() => {
        try{
          const response = await findRestaurant();

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
    switch(index){
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
      navigation={navigation}
      setCategoryAliases = {setCategoryAliases} 
      categoryAliases = {categoryAliases} 
      setCuisineTagSelected = {setCuisineTagSelected} 
      cuisineTagSelected = {cuisineTagSelected}
    />, 
    <DietaryPref 
      navigation={navigation}
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
      setResult = {setResult}
      onExpandedChange={setSwipeCardExpanded}
    />,
    <Results 
      userResults = {userResults}
      resultVisible={resultVisible}
      setResultVisible = {setResultVisible}
      setResult = {setResult}
    />
  ];

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText size = {17}>Discover Restaurants</MediumText>}
        leftContent={<Ionicons name="arrow-back" size={20} />}
        leftAction={() => navigation.goBack()}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={index > 4 && (index !== 5 || swipeCardExpanded)}
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
  scrollContent: {
    paddingBottom: 100,
  },
  
  outerContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    paddingTop: 20,
  },
  
  buttonContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    padding:20,
  },
})
