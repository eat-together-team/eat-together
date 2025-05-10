import React from 'react'
import {View, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import SmallText from '../../components/SmallText';
import MediumText from '../../components/MediumText';
import LargeText from '../../components/LargeText';

const CardCarousel = ({cards, incrementIndex, decrementIndex, index, pressedFinished, setPressedFinished}) => {
    const [index, setIndex] = useState(0);

  const incrementIndex = ()=>{
    setIndex(Math.min(cards.length - 1, index + 1)); //can't go below index 0
    if(index === cards.length - 1){
        console.log("user wants to go to next page boy");
    }
  }
  const decrementIndex = () =>{
    setIndex(Math.max(0, index - 1)); //can't go above card.length - 1
  }

  return (
    <View>
        {cards[index]}
        <Modal visible={pressedFinished} transparent={true}>
            <View style = {styles.overlay}>
                <View style = {styles.prefContainer}>
                    <MediumText color = "#00000080" center = "center" style = {{marginTop:30 }}>Preferences are set!</MediumText>
                    <LargeText  size = "30" center = {true} marginBottom = {30} style = {{marginTop:20}}>Ready to Swipe?</LargeText>
                    <MediumText size = "25" center = {true}>Swipe <SmallText weight = "800" size = "25" color = "#5DB075">LEFT</SmallText> to skip.</MediumText>
                    <MediumText size = "25" center = {true} >Swipe <SmallText weight = "800" size = "25" color = "#5DB075">RIGHT</SmallText> to save.</MediumText>
                    <View style = {[styles.buttonContainer, {marginTop:30}]}>
                        <TouchableOpacity style = {styles.backButton} onPress={()=> setPressedFinished(false)}>
                            <SmallText size = "13" color = "#5DB075" weight = "600" >Back</SmallText>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.nextButton}>
                            <SmallText size = "13" color = "#FFFFFF" weight = "600" >Start</SmallText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        {index > 1 &&
            <View style = {styles.buttonContainer}>
                <TouchableOpacity style = {styles.backButton} onPress={decrementIndex}>
                    <SmallText size = "13" color = "#5DB075">Back</SmallText>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.nextButton} onPress={incrementIndex}>
                    {
                        index == cards.length - 1 ? 
                        <SmallText color = "#FFFFFF">Finish</SmallText> : 
                        <SmallText color = "#FFFFFF">Next</SmallText> 
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
    }
})
export default CardCarousel
