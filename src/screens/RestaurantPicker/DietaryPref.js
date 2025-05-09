import React, {useState} from 'react'
import {StyleSheet, View, Text} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantQuestion from "../../components/RestaurantQuestion";
import TagsSection from '../../components/TagsSection';

const DietaryPref = ({setSelectedDietaryTags, selectedDietaryTags}) => {

  const dietaryTags = ["vegan","vegetarian","gluten_free","halal","kosher"];
  return (
    <View>
        <RestaurantCard>
            <View style = {styles.questionContainer}>
                <RestaurantQuestion text = {"Do you have any dietary preferences?"}/>
            </View>
            <View style = {styles.exampleTextContainer}>
                <Text style = {styles.exampleText}>E.g. Vegetarian, Gluten-free</Text>
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
      exampleText:{
        fontFamily:'Inter',
        fontWeight: 600,
        fontSize:15,
        lineHeight: 15,
        color:"#A9A9A9",
        textAlign:'center'
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
      }
})
export default DietaryPref
