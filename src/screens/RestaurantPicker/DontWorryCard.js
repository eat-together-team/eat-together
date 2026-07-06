import {StyleSheet, View, Text} from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import Button from '../../components/Button';
import SmallText from '../../components/SmallText';
import LargeText from '../../components/LargeText';

// Starting screen before user sets food preferences
const DontWorryCard = ({incrementIndex, decrementIndex}) => {
  return (
    <View style={styles.cardWrapper}>
        <RestaurantCard height={345}>
            <View style = {styles.questionContainer}>
                <View style = {styles.textWrapper}>
                    <LargeText marginBottom = {10} size = {30} color = "#5DB075" center = "center">Let's start!</LargeText>
                    <SmallText size = {13} center = "center">You'll answer a few short questions about your food preferences before we give recommendations.</SmallText>
                    <Text style={[styles.paragraph, { marginTop: 14 }]}>All questions are <Text style={styles.bold}>optional</Text>! If you wish to skip forward, simply press <Text style={styles.bold}>next</Text> on any question.</Text>

                </View>
            </View>
            <View style = {styles.buttonContainer}>
                <Button onPress ={incrementIndex} width="80%" fontSize={16} paddingHorizontal={25} 
                        paddingVertical={10} marginBottom={14} noShadow>Let's go</Button>
                <Button onPress ={decrementIndex} width="80%" fontSize={16} paddingHorizontal={25} 
                        paddingVertical={10} noShadow backgroundColor="#F7F7F7" color="#5DB075" 
                        borderWidth={2} borderColor="#5DB075">Cancel</Button>
            </View>
        </RestaurantCard>
    </View>
  )
};
const styles = StyleSheet.create({
    cardWrapper: {
        width: 311,
        borderWidth: 2,
        borderColor: '#D0D0D0',
        borderRadius: 20,
        marginTop: 110,
        backgroundColor: '#F7F7F7',
        overflow: 'hidden',
    },

    questionContainer:{
        backgroundColor:'#F7F7F7',
        width: '100%',
        display:'flex',
        justifyContent:'space-evenly',
        alignItems:'center',
      },

      textWrapper: {
        width: '80%',
        alignItems: 'center',
      },
      paragraph: {
        fontSize: 13,
        textAlign: 'center',
        color: 'black',
      },
      
      bold: {
        fontWeight: 'bold',
      },

      buttonContainer:{
        flex: 1,
        display:'flex',
        justifyContent:'flex-end',
        alignItems:'center',
        paddingBottom: 12,
      }
})
export default DontWorryCard