import {View} from "react-native";
import React, {useState} from 'react'
import RestaurantCard from "../../components/RestaurantCard";
import RestaurantRec from '../../components/RestaurantRec';
import {Swiper} from 'rn-swiper-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const SwipeDeck = ({results}) => {
  const [expanded, setExpanded] = useState(false);
  const mockRestaurants = [
    {
      id: "abc123-restaurant-1",
      name: "Elemental Pizza",
      rating: 4.0,
      reviewCount: 23,
      price: "$$",
      categories: "Italian, Pizza, Gluten-Free",
      address: "2634 NE University Village St, Seattle, WA 98105",
      phone: "(206) 524-4930",
      distance: 200,
      imageUrl: "https://elementalpizza.com/wp-content/uploads/2015/06/Elemental_Pizza_U_Village_0121.jpg",
      url: "https://yelp.com/biz/marios-italian-kitchen"
    },
    {
      id: "def456-restaurant-2",
      name: "Mario's Italian Kitchen",
      rating: 4.5,
      reviewCount: 234,
      price: "$$",
      categories: "Italian, Pizza, Wine Bars",
      address: "1234 Main St, Downtown, Seattle, WA 98101",
      phone: "(206) 555-0123",
      distance: 850,
      imageUrl: "https://mariasitaliankitchen.com/wp-content/uploads/2022/01/2022-agoura-exterior.png",
      url: "https://yelp.com/biz/marios-italian-kitchen"
    },
    {
      id: "ghi789-restaurant-3", 
      name: "Seoul BBQ House",
      rating: 4.2,
      reviewCount: 187,
      price: "$$$",
      categories: "Korean, Barbecue, Asian Fusion",
      address: "5678 Pike Ave, Capitol Hill, Seattle, WA 98102",
      phone: "(206) 555-0456",
      distance: 1200,
      imageUrl: "https://whatnow.com/wp-content/uploads/2025/03/az--860x574.jpg",
      url: "https://yelp.com/biz/seoul-bbq-house"
    },
    {
      id: "jkl1011-restaurant-4",
      name: "The Green Spoon",
      rating: 4.7,
      reviewCount: 92,
      price: "$$",
      categories: "Vegetarian, Vegan, Healthy",
      address: "9012 Broadway E, Queen Anne, Seattle, WA 98109",
      phone: "(206) 555-0789", 
      distance: 650,
      imageUrl: "https://images.happycow.net/venues/1024/37/02/hcmp370285_3102524.jpeg",
      url: "https://yelp.com/biz/the-green-spoon"
    }
  ];
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 40 }}>
        <Swiper
          cardStyle={{
            alignSelf: 'center',
          }}
          data={mockRestaurants}
          renderCard={(item) => (
            <RestaurantCard expanded={expanded}>
              <RestaurantRec
                expanded={expanded}
                setExpanded={setExpanded}
                restaurant={item}
              />
            </RestaurantCard>
          )}
          onSwipeLeft={(index) => console.log('Swiped left:', mockRestaurants[index])}
          onSwipeRight={(index) => console.log('Swiped right:', mockRestaurants[index])}
          //stackSize={3}
        />
      </View>
    </GestureHandlerRootView>
  )
}

export default SwipeDeck
