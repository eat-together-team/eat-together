import {StyleSheet, View} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import Header1Text from '../../components/typography/Header1Text';
import BodyText from '../../components/typography/BodyText';
import LargeButton from '../../components/LargeButton';
import { useTheme } from '../../rapi_ui_components';
import { colorTokens } from '../../theme/colorTokens';

// Starting screen before user sets food preferences
const DontWorryCard = ({incrementIndex, decrementIndex}) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  return (
    <View style={[styles.cardWrapper, {backgroundColor: colors.containerLow}]}>
        <RestaurantCard height={380}>
            <View style = {styles.content}>
                <View style = {styles.textWrapper}>
                    <Header1Text color={colors.primary} center style={styles.heading}>Let's start!</Header1Text>
                    <BodyText color={colors.onBackground} center style={styles.bodyText}>You'll answer a few short questions about your food preferences before we give recommendations.</BodyText>
                    <BodyText color={colors.onBackground} center style={styles.bodyText}>All questions are optional! If you wish to skip forward, simply press next on any question.</BodyText>
                </View>
                <View style = {styles.buttonContainer}>
                    <LargeButton onPress={incrementIndex}>Let's go</LargeButton>
                    <LargeButton outlined color="gray" onPress={decrementIndex}>Cancel</LargeButton>
                </View>
            </View>
        </RestaurantCard>
    </View>
  )
};
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
        paddingTop: 0,
        paddingBottom: 20,
    },

    textWrapper: {
        gap: 10,
        alignItems: 'center',
    },

    heading: {
        fontSize: 30,
    },

    bodyText: {
        fontSize: 13,
    },

    buttonContainer:{
        gap: 10,
    }
})
export default DontWorryCard
