import React from 'react'
import {StyleSheet, View} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import Header2Text from '../../components/typography/Header2Text';
import PriceRangeButton from '../../components/PriceRangeButton';
import { useTheme } from '../../rapi_ui_components';
import { colorTokens } from '../../theme/colorTokens';

// Price range screen that allows users to set price range preferences
const PriceRangeCard = ({setPriceRange, priceRange}) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  return (
    <View style={[styles.cardWrapper, { backgroundColor: colors.containerLow }]}>
        <RestaurantCard height={572} width={340}>
            <View style={styles.content}>
              <Header2Text color={colors.onBackground} center>What is your price{'\n'}range?</Header2Text>
              <View style={styles.buttonContainer}>
                <PriceRangeButton dollars="$" text="$10 and under" setPriceRange={setPriceRange} priceRange={priceRange}/>
                <PriceRangeButton dollars="$$" text="$10 to $30" setPriceRange={setPriceRange} priceRange={priceRange}/>
                <PriceRangeButton dollars="$$$" text="$30 to $60" setPriceRange={setPriceRange} priceRange={priceRange}/>
                <PriceRangeButton dollars="$$$$" text="$60 and above" setPriceRange={setPriceRange} priceRange={priceRange}/>
              </View>
            </View>
        </RestaurantCard>
    </View>
  )
}
const styles = StyleSheet.create({
    cardWrapper: {
      width: 340,
      borderRadius: 20,
      overflow: 'hidden',
    },

    content: {
      alignItems: 'center',
      gap: 31,
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 30,
    },

    buttonContainer: {
      width: '100%',
      gap: 20,
    },
})
export default PriceRangeCard
