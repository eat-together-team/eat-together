import {View, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import SmallText from '../../components/SmallText';
import Header2Text from '../../components/typography/Header2Text';
import BodyText from '../../components/typography/BodyText';
import LargeButton from '../../components/LargeButton';
import * as Progress from 'react-native-progress';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../rapi_ui_components';
import { colorTokens } from '../../theme/colorTokens';
import { radiusTokens } from '../../theme/radiusTokens';

// Carousel to display each card component for restaurant personalizer
const CardCarousel = ({cards, incrementIndex, decrementIndex, index, pressedFinished, setPressedFinished, validateSteps, progress}) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  // Matches each step card's own width (the Cuisine/Dietary/Price range steps
  // are wider than the rest) so the progress bar/Back-Next row lines up with
  // the card above it.
  const cardWidth = (index >= 2 && index <= 4) ? 340 : 311;

  return (
    <View style={[styles.root, index >= 5 && styles.rootFullHeight]}>
        {cards[index]}
        <Modal visible={pressedFinished} transparent={true} animationType="fade">
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setPressedFinished(false)}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {}}
                    style={[styles.dialog, { backgroundColor: colors.background }]}
                >
                    <View style={styles.dialogHeader}>
                        <Ionicons name="fast-food-outline" size={40} color={colors.onBackground} />
                        <Header2Text color={colors.onBackground}>Ready to explore?</Header2Text>
                    </View>
                    <View style={styles.instructions}>
                        <View style={styles.instructionRow}>
                            <BodyText color={colors.onBackground} style={styles.instructionText}>Press the</BodyText>
                            <View style={[styles.iconBadge, { backgroundColor: colors.error }]}>
                                <Ionicons name="close" size={18} color="white" />
                            </View>
                            <BodyText color={colors.onBackground} style={styles.instructionText}>to skip</BodyText>
                        </View>
                        <View style={styles.instructionRow}>
                            <BodyText color={colors.onBackground} style={styles.instructionText}>Press the</BodyText>
                            <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
                                <Ionicons name="checkmark" size={18} color="white" />
                            </View>
                            <BodyText color={colors.onBackground} style={styles.instructionText}>to save</BodyText>
                        </View>
                    </View>
                    <View style={styles.dialogButtons}>
                        <LargeButton onPress={() => { incrementIndex(); setPressedFinished(false); }}>Let's go!</LargeButton>
                        <LargeButton outlined color="gray" onPress={() => setPressedFinished(false)}>Exit</LargeButton>
                    </View>
                </TouchableOpacity>
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
    rootFullHeight:{
        flex: 1,
        width: '100%',
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
        flexShrink: 0,
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
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    dialog:{
        width: 350,
        alignItems: 'center',
        gap: 15,
        padding: 20,
        borderRadius: radiusTokens.medium,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
        elevation: 4,
    },
    dialogHeader:{
        alignItems: 'center',
        gap: 10,
    },
    instructions:{
        alignItems: 'center',
        gap: 15,
    },
    instructionRow:{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    instructionText:{
        fontSize: 18,
    },
    iconBadge:{
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogButtons:{
        width: '100%',
        gap: 10,
    },
})
export default CardCarousel
