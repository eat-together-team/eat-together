import React, {useEffect} from 'react'
import {StyleSheet, View} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import TagsSection from '../../components/TagsSection';
import foodTagsToYelpCategories from '../../yelpTags';
import MediumText from '../../components/MediumText';

// Cuisine screen tha allows users to select cuisine preferences
const CuisineCard = ({navigation, setCategoryAliases, cuisineTagSelected, setCuisineTagSelected}) => {
  
  //Eat together's food tags
  const foodTags = Object.keys(foodTagsToYelpCategories); 

  //gets corresponding category alias for every food tag selected
  useEffect(()=> {
    //map out each food tag to yelp's approved category aliases 
    const updatedCategoryAliases = cuisineTagSelected.map((item) =>{
        return foodTagsToYelpCategories[item];
    });
    setCategoryAliases(updatedCategoryAliases);

  }, [cuisineTagSelected]);

  return (
      <View style={styles.cardWrapper}>
        <RestaurantCard>
          <View style ={styles.questionContainer}>
            <MediumText center = "center">What cuisines are you {'\n'} in the mood for?</MediumText>
          </View>
          <View style = {styles.textInputContainer}>
            <TagsSection
                      multi={true}
                      selectedItems={cuisineTagSelected}
                      onRemoveItem={(tag, index) => {
                          const newTags = cuisineTagSelected.filter((tag, i) => i !== index);
                          setCuisineTagSelected(newTags);
                      }}
                      items={foodTags}
                      chip={true}
                      resetValue={false}
                      onInputPress={() => navigation.navigate('TagSearch', { items: foodTags, selectedItems: cuisineTagSelected, screenType: 'cuisine', title: 'Add cuisines' })}
                  />
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
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      marginBottom: 20,
    },

    cuisineTagInput:{
      borderColor:'gray',
      borderWidth: 0.5,
      borderRadius: 5,
      height: 35,
    },

    textInputContainer:{
      alignItems:'center',
      width:"100%",
      marginLeft: 'auto',
      marginRight:'auto',
    }
  })
export default CuisineCard
