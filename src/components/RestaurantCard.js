import { View, ScrollView, Dimensions } from 'react-native';

const CARD_MAX_HEIGHT = Dimensions.get('window').height * 0.7; 

//Card components for Restaurant picker feature
const RestaurantCard = ({children, expanded, height: customHeight}) => {
  const defaultHeight = 510;
  const cardHeight = expanded ? undefined : (customHeight ?? defaultHeight);
  return (
    <View style={{
      width: 311,
      height: cardHeight,
      maxHeight: expanded ? CARD_MAX_HEIGHT : undefined,
      marginTop: 20,
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
