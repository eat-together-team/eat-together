import { View, ScrollView, Dimensions } from 'react-native';

const CARD_MAX_HEIGHT = Dimensions.get('window').height * 0.7; 

//Card components for Restaurant picker feature
const RestaurantCard = ({children, expanded}) => {
  return (
    <View style={{
      width: 311,
      height: expanded ? undefined : 500,
      maxHeight: expanded ? CARD_MAX_HEIGHT : undefined,
      backgroundColor: "#F7F7F7",
      borderRadius: 40,
      shadowOpacity: 0.25,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      marginBottom: 10,
      marginTop: 50,
      overflow: 'hidden',
    }}>
      {expanded ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  )
}
export default RestaurantCard
