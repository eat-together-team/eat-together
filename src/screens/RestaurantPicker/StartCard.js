import React from 'react'
import {StyleSheet, View} from "react-native";
import RestaurantCard from '../../components/RestaurantCard';
import Header1Text from '../../components/typography/Header1Text';
import BodyText from '../../components/typography/BodyText';
import LargeButton from '../../components/LargeButton';
import { useTheme } from '../../rapi_ui_components';
import { colorTokens } from '../../theme/colorTokens';

// Explore screen where user can start setting preferences or go straight into exploring restaurants
const StartCard = ({incrementIndex, skipToSwiping}) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  return (
    <View style={[styles.cardWrapper, {backgroundColor: colors.containerLow}]}>
        <RestaurantCard height={630}>
            <View style = {styles.content}>
                <View style = {styles.textWrapper}>
                    <View style = {styles.headingGroup}>
                        <Header1Text color={colors.textMedium} style={styles.heading}>Before we start,</Header1Text>
                        <Header1Text color={colors.primary} style={styles.heading}>Any preferences in mind?</Header1Text>
                    </View>
                    <BodyText color={colors.onBackground} style={styles.bodyText}>Tell us more about your favorite cuisines, foods, price range, and dietary restrictions so we can provide you more personalized recommendations.</BodyText>
                </View>
                <View style = {styles.buttonContainer}>
                    <LargeButton onPress={incrementIndex}>Set preferences</LargeButton>
                    <LargeButton outlined onPress={skipToSwiping}>I'm open to anything</LargeButton>
                </View>
            </View>
        </RestaurantCard>
    </View>
  )
}
const styles = StyleSheet.create({
    cardWrapper: {
        width: 311,
        borderRadius: 20,
        overflow: 'hidden',
    },

    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
    },

    textWrapper: {
        gap: 10,
        alignItems: 'flex-start',
    },

    headingGroup: {
        gap: 0,
        alignItems: 'flex-start',
    },

    heading: {
        fontSize: 30,
        lineHeight: 32,
    },

    bodyText: {
        fontSize: 13,
    },

    buttonContainer:{
        gap: 10,
    }
})
export default StartCard
