import React from 'react'
import {StyleSheet, View} from "react-native";
import { Layout, TopNav} from "react-native-rapi-ui";
import MediumText from "../../components/MediumText";
import { Ionicons } from "@expo/vector-icons";
import RestaurantCard from "../../components/RestaurantCard";
const Restaurant = ({navigation}) => {
  return (
    <Layout>
      <TopNav 
        middleContent={<MediumText>Discover</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        onPress= {() => navigation.goBack()}
      />
      <View style = {styles.outerContainer}>
        <RestaurantCard/>
      </View>
    </Layout>
  )
}

const styles = StyleSheet.create({
  outerContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  }
})
export default Restaurant
