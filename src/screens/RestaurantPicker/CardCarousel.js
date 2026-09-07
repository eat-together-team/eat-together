import {View, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import SmallText from '../../components/SmallText';
import LargeText from '../../components/LargeText';
import Button from '../../components/Button';
import LargeButton from '../../components/LargeButton';
import * as Progress from 'react-native-progress';
import CustomButton from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../rapi_ui_components';
import { colorTokens } from '../../theme/colorTokens';

// Carousel to display each card component for restaurant personalizer
const CardCarousel = ({cards, incrementIndex, decrementIndex, index, pressedFinished, setPressedFinished, validateSteps, progress}) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  // Matches each step card's own width (CuisineCard is wider than the rest)
  // so the progress bar/Back-Next row lines up with the card above it.
  const cardWidth = index === 2 ? 340 : 311;

  return (
    <View style={styles.root}>
        {cards[index]}
        <Modal visible={pressedFinished} transparent={true}>
            <TouchableOpacity style = {styles.overlay} onPress={() => setPressedFinished(false)}>
                    <View style = {styles.prefContainer}>
                        <LargeText  size = {30} center = {true} marginBottom = {30} style = {{marginTop:20}}>Ready to explore?</LargeText>
                        <View>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <SmallText size={25}>Press the </SmallText>

                                <CustomButton
                                disabled
                                width={30}
                                height={30}
                                borderRadius={50}
                                backgroundColor="#F8AEAE"
                                style={{
                                    aspectRatio: 1,
                                    marginHorizontal: 5,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                >
                                <Ionicons name="close" size={18} />
                                </CustomButton>

                                <SmallText size={25}> to skip</SmallText>
                            </View>

                            <View
                                style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 40,
                                }}
                            >
                                <SmallText size={25}>Press the </SmallText>

                                <CustomButton
                                disabled
                                width={30}
                                height={30}
                                borderRadius={50}
                                paddingVertical={0}
                                paddingHorizontal={0}
                                elevation={0}
                                style={{
                                    aspectRatio: 1,
                                    marginHorizontal: 5,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                >
                                <Ionicons name="checkmark" size={18} />
                                </CustomButton>

                                <SmallText size={25}> to save</SmallText>
                            </View>
                        </View>
                        <View style = {[{marginTop:30}]}>
                            <Button
                                fontSize={16}
                                paddingHorizontal={25}
                                paddingVertical={10}
                                marginHorizontal={15}
                                onPress = {()=> {
                                    incrementIndex();
                                    setPressedFinished(false);
                                }}
                            >
                                Let's go!
                            </Button>
                        </View>
                    </View>
            </TouchableOpacity>
        </Modal>
        {(index >= 2 && index <= 4) && (
            <>
                <Progress.Bar
                  progress={progress}
                  width={cardWidth}
                  height={16}
                  color={colors.primary}
                  unfilledColor={colors.containerMedium}
                  borderWidth={0}
                  borderRadius={8}
                  style={{ alignSelf: 'center', marginTop: 30 }}
                />
                <View style={[styles.buttonContainer, { width: cardWidth }]}>
                    <View style={styles.buttonFlex}>
                        <LargeButton outlined color="gray" onPress={decrementIndex}>Back</LargeButton>
                    </View>
                    <SmallText size={13} style={styles.stepLabel}>{index - 1} of {cards.length - 4}</SmallText>
                    <View style={styles.buttonFlex}>
                        <LargeButton disabled={validateSteps()} onPress={incrementIndex}>
                            {index == cards.length - 2 ? "Finish" : "Next"}
                        </LargeButton>
                    </View>
                </View>
            </>
        )}
  </View>
  )
}
const styles = StyleSheet.create({
    root:{
        alignItems: 'center',
    },
    buttonContainer:{
        flexDirection:'row',
        alignItems:'center',
        gap: 41,
        paddingTop: 16,
        paddingBottom: 50,
    },
    buttonFlex:{
        flex: 1,
    },
    stepLabel:{
        width: 35,
        textAlign: 'center',
    },
    backButton:{
        backgroundColor:"#F7F7F7", 
        width: 110, 
        height:50, 
        display:'flex', 
        justifyContent:'center',
        alignItems:'center',
        borderRadius: 10, 
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },
    nextButton:{
        backgroundColor:"#5DB075", 
        width: 110, 
        height:50,
        display:'flex', 
        justifyContent:'center', 
        alignItems:'center',
        marginLeft: 30, 
        borderRadius: 10, 
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },
    stepContainer:{
        display:'flex',
        alignItems:'center',
    },
    stepText:{
        fontFamily:'Inter',
        fontWeight: 400,
        fontSize: 15,
        color: "#000000",
    },
    overlay:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    prefContainer:{
        display:'flex',
        backgroundColor:"#F7F7F7",
        borderRadius:20,
        height:289,
        width:315,
    },
})
export default CardCarousel
