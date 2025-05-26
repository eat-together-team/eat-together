import {useState} from 'react';
import {View, Text, StyleSheet} from "react-native";
import Swiper from "react-native-deck-swiper";
import Button from '../../components/Button';
const SwipeDeck = ({result}) => {
  const mockRestaurants = [
  {
    id: "abc123-restaurant-1",
    name: "Mario's Italian Kitchen",
    rating: 4.5,
    reviewCount: 234,
    price: "$$",
    categories: "Italian, Pizza, Wine Bars",
    address: "1234 Main St, Downtown, Seattle, WA 98101",
    phone: "(206) 555-0123",
    distance: 850,
    imageUrl: "https://example.com/marios-kitchen.jpg",
    url: "https://yelp.com/biz/marios-italian-kitchen"
  },
  {
    id: "def456-restaurant-2", 
    name: "Seoul BBQ House",
    rating: 4.2,
    reviewCount: 187,
    price: "$$$",
    categories: "Korean, Barbecue, Asian Fusion",
    address: "5678 Pike Ave, Capitol Hill, Seattle, WA 98102",
    phone: "(206) 555-0456",
    distance: 1200,
    imageUrl: "https://example.com/seoul-bbq.jpg",
    url: "https://yelp.com/biz/seoul-bbq-house"
  },
  {
    id: "ghi789-restaurant-3",
    name: "The Green Spoon",
    rating: 4.7,
    reviewCount: 92,
    price: "$$",
    categories: "Vegetarian, Vegan, Healthy",
    address: "9012 Broadway E, Queen Anne, Seattle, WA 98109",
    phone: "(206) 555-0789", 
    distance: 650,
    imageUrl: "https://example.com/green-spoon.jpg",
    url: "https://yelp.com/biz/the-green-spoon"
  }
];
  return (
    <>
      <View style = {styles.outerContainer}>
        <Swiper
              cards={mockRestaurants}
              renderCard={(mockRestaurants) => {
                  return (
                      <View style = {styles.container}>
                          <Text>{mockRestaurants.name}</Text>
                      </View>
                  )
              }}
              onSwiped={(cardIndex) => {console.log(cardIndex)}}
              onSwipedAll={() => {console.log('onSwipedAll')}}
              cardIndex={0}
              stackSize= {3}>
          </Swiper>
      </View>
      <View>
        <Button
          fontSize={13}
          paddingHorizontal={30}
          paddingVertical={10}
          marginHorizontal={10}
          height = {40}
          width = {80}
          onPress = {()=> {
            console.log("works")
          }}
      >
          Finish
        </Button>
      </View>
    </>
  )
}
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    marginRight: 350,
  },
  container: {
    backgroundColor: "orange",
    height: 550,
    width: 320,
    borderRadius: 40,
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
  }
})
export default SwipeDeck
