import React from 'react'
import {StyleSheet, View,} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import TagsSection from '../../components/TagsSection';
import MediumText from '../../components/MediumText';

// Dietary screen that allows users to select dietary preferences
const DietaryPref = ({setSelectedDietaryTags, selectedDietaryTags}) => {

  //dietary tags (approved category aliases) from Yelp
  const dietaryTags = ["vegan","vegetarian","gluten_free","halal","kosher"];
  return (
    <View style={styles.cardWrapper}>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
                <MediumText center ="center">Do you have any dietary restrictions?</MediumText>
            </View>

            <View style = {styles.textInputContainer}>
              <TagsSection
                        multi={true}
                        selectedItems={selectedDietaryTags}
                        onItemSelect={(item) => {
                            if (selectedDietaryTags.length >= 4) {
                                alert("You can only select up to 4 tags.");
                            } else {
                              setSelectedDietaryTags([...selectedDietaryTags, item]);
                            }
                        }}
                        onRemoveItem={(item, index) => {
                            const newTags = selectedDietaryTags.filter((tag, i) => i !== index);
                            setSelectedDietaryTags(newTags);
                        }}
                        items={dietaryTags}
                        chip={true}
                        resetValue={false}
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

      dietTagInput:{
        width:"90%",
        borderColor:'gray',
        borderWidth: 0.5,
        borderRadius: 5,
        height: 35,
      },
      textInputContainer:{
        alignItems:'center',
        width:'90%',
        marginLeft:'auto',
        marginRight: 'auto'
      }
})
export default DietaryPref
