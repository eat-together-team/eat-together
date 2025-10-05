import React, {useState} from 'react'
import {StyleSheet, View, TextInput, Text} from "react-native";
import { Layout, TopNav} from "react-native-rapi-ui";
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantQuestion from "../../components/RestaurantQuestion";

const CuisineCard = () => {
const [cuisineSearch, setCuisineSearch] = useState("");
  return (
      <View>
        <RestaurantCard>
          <View style ={styles.questionContainer}>
            <RestaurantQuestion text = "What Cuisine(s) are you in the mood for?"/>
          </View>
          <View style = {styles.exampleTextContainer}>
            <Text style = {styles.exampleText}>E.g. favorite culture, favorite dish</Text>
          </View>
          <View style = {styles.textInputContainer}>
            <TextInput
              style={styles.cuisineTagInput}
              placeholder='Type a tag...' onChangeText={(newText)=> setCuisineSearch(newText)}/>
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
    exampleText:{
      fontFamily:'Inter',
      fontWeight: 600,
      fontSize:15,
      lineHeight: 15,
      color:"#A9A9A9",
      textAlign:'center'
    },
    cuisineTagInput:{
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
export default CuisineCard
