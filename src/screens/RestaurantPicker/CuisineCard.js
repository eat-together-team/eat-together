import React, {useState, useEffect} from 'react'
import {StyleSheet, View} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantQuestion from "../../components/RestaurantQuestion";
import TagsSection from '../../components/TagsSection';
import foodTagsToYelpCategories from '../../yelpTags';
import SmallText from '../../components/SmallText';

const CuisineCard = ({setCategoryAliases}) => {

const foodTags = Object.keys(foodTagsToYelpCategories);

const [cuisineTagSelected, setCuisineTagSelected] = useState([]);

useEffect(()=> {
  //map out each food tag to yelp's approved category aliases 
  const updatedCategoryAliases = cuisineTagSelected.map((item) =>{
      return foodTagsToYelpCategories[item];
  });
  setCategoryAliases(updatedCategoryAliases);

}, [cuisineTagSelected]);

  return (
      <View>
        <RestaurantCard>
          <View style ={styles.questionContainer}>
            <RestaurantQuestion text = {"What Cuisine(s) are you\nin the mood for?"}/>
          </View>
          <View style = {styles.exampleTextContainer}>
            <SmallText weight = "600" color = "#A9A9A9" size = "13" center ={true}>E.g. favorite culture, favorite dish</SmallText>
          </View>
          <View style = {styles.textInputContainer}>
            <TagsSection
                      multi={true}
                      selectedItems={cuisineTagSelected}
                      onItemSelect={(item) => {
                          if (cuisineTagSelected.length >= 4) {
                              alert("You can only select up to 4 tags.");
                          } else {
                              setCuisineTagSelected([...cuisineTagSelected, item]);
                          }
                      }}
                      onRemoveItem={(item, index) => {
                          const newTags = cuisineTagSelected.filter((tag, i) => i !== index);
                          setCuisineTagSelected(newTags);
                      }}
                      items={foodTags}
                      chip={true}
                      resetValue={false}
                  />
          </View>
        </RestaurantCard>
      </View>
  )
}
const styles = StyleSheet.create({
    outerContainer:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
    },
    questionContainer:{
      backgroundColor:'#FFFFFF',
      width: '100%',
      height: 105,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      shadowOpacity: 0.25,
      shadowOffset: {
          width: 0,
          height: 4,
      },
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
    },
    exampleTextContainer:{
      marginTop:30,
      marginBottom:10,
    },
    cuisineTagInput:{
      borderColor:'gray',
      borderWidth: 0.5,
      borderRadius: 5,
      height: 35,
    },
    textInputContainer:{
      alignItems:'center',
    }
  })
export default CuisineCard
