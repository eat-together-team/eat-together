import React from 'react'
import {View, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import SmallText from '../../components/SmallText';
import MediumText from '../../components/MediumText';
import LargeText from '../../components/LargeText';

const CardCarousel = ({cards, incrementIndex, decrementIndex, index, pressedFinished, setPressedFinished}) => {

  return (
    <View>
        {cards[index]}
        <Modal visible={pressedFinished} transparent={true}>
            <View style = {styles.overlay}>
                <View style = {styles.prefContainer}>
                    <MediumText color = "#00000080" center = "center" style = {{marginTop:30 }}>Preferences are set!</MediumText>
                    <LargeText  size = "30" center = {true} marginBottom = {30} style = {{marginTop:20}}>Ready to Swipe?</LargeText>
                    <SmallText size = "25" center = {true}>Swipe <MediumText size = "25" color = "#5DB075">LEFT</MediumText> to skip.</SmallText>
                    <SmallText size = "25" center = {true} >Swipe <MediumText weight = "800" size = "25" color = "#5DB075">RIGHT</MediumText> to save.</SmallText>
                    <View style = {[styles.buttonContainer, {marginTop:30}]}>
                        <TouchableOpacity style = {styles.backButton} onPress={()=> setPressedFinished(false)}>
                            <MediumText size = "13" color = "#5DB075" weight = "600" >Back</MediumText>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.nextButton}>
                            <MediumText size = "13" color = "#FFFFFF" weight = "600" >Start</MediumText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        {index > 1 &&
            <View style = {styles.buttonContainer}>
                <TouchableOpacity style = {styles.backButton} onPress={decrementIndex}>
                    <MediumText size = "13" color = "#5DB075">Back</MediumText>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.nextButton} onPress={incrementIndex}>
                    {
                        index == cards.length - 1 ? 
                        <MediumText size = "13" color = "#FFFFFF">Finish</MediumText> : 
                        <MediumText size = "13" color = "#FFFFFF">Next</MediumText>
                    }
                </TouchableOpacity>
            </View>
        }
        <View style = {styles.stepContainer}>
            {
                index > 1 && 
                <SmallText size = "12">Step {index - 1} of {cards.length - 2}</SmallText>
            }
        </View>
  </View>
  )
}
const styles = StyleSheet.create({
    buttonContainer:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'center',
        padding:20,
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
        height:360,
        width:315,
    }
})
export default CardCarousel
