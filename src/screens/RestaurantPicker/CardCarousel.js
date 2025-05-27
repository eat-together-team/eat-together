import React, { useState } from 'react'
import {View, StyleSheet, Modal} from 'react-native';
import SmallText from '../../components/SmallText';
import MediumText from '../../components/MediumText';
import LargeText from '../../components/LargeText';
import Button from '../../components/Button';
import ProgressBar from './ProgressBar';

const CardCarousel = ({cards, incrementIndex, decrementIndex, index, pressedFinished, setPressedFinished}) => {

  return (
    <View>
        {cards[index]}
        <Modal visible={pressedFinished} transparent={true}>
            <View style = {styles.overlay}>
                <View style = {styles.prefContainer}>
                    <MediumText color = "#00000080" center = "center" style = {{marginTop:30 }}>Preferences are set!</MediumText>
                    <LargeText  size = {30} center = {true} marginBottom = {30} style = {{marginTop:20}}>Ready to Swipe?</LargeText>
                    <MediumText size = {25} center = {true}>Swipe <SmallText weight = {800} size = {25} color = "#5DB075">LEFT</SmallText> to skip.</MediumText>
                    <MediumText size = {25} center = {true} >Swipe <SmallText weight = {800} size = {25} color = "#5DB075">RIGHT</SmallText> to save.</MediumText>
                    <View style = {[styles.buttonContainer, {marginTop:30}]}>
                        <Button
                            backgroundColor="white"
                            color="#5DB075"
                            onPress={() => {
                                setPressedFinished(false);
                            }}
                            fontSize={16}
                            paddingHorizontal={25}
                            paddingVertical={10}
                            marginHorizontal={10}
                        >
                            Back
                        </Button>
                        <Button
                            fontSize={16}
                            paddingHorizontal={25}
                            paddingVertical={10}
                            marginHorizontal={10}
                            onPress = {()=> {
                                incrementIndex();
                                setPressedFinished(false);
                            }}
                        >
                            Start
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
        {(index >= 2 && index <=4 )  &&
            <View style = {styles.buttonContainer}>
                <Button
                    backgroundColor="white"
                    color="#5DB075"
                    onPress={decrementIndex}
                    fontSize={16}
                    paddingHorizontal={25}
                    paddingVertical={10}
                    marginHorizontal={10}
                >
                    Back
                </Button>
                <Button
                    onPress={incrementIndex}
                    fontSize={16}
                    paddingHorizontal={25}
                    paddingVertical={10}
                    marginHorizontal={10}
                >
                    {index == cards.length - 2 ? "Finish" : "Next"}
                </Button>
            </View>
        }
        { (index >= 2 && index <=4) && <ProgressBar index = {index}/>}
        <View style = {styles.stepContainer}>
            {
                (index >=2 && index <=4) && 
                <SmallText size = {12}>Step {index - 1} of {cards.length - 3}</SmallText>
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
    },
})
export default CardCarousel
