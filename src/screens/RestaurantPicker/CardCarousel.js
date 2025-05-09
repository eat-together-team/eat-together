import React, {useState} from 'react'
import {View, StyleSheet, TouchableOpacity,Text, Modal} from 'react-native';

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
        <Modal 
            visible={pressedFinished} 
            transparent={true}
            >
            <View style = {styles.overlay}>
                <View style = {styles.prefContainer}>
                    <Text style = {{fontFamily:"Inter", fontWeight: 600, color:"#00000080", textAlign:'center', marginTop: 30}}>
                        Preferences are set!</Text>
                    <Text style = {{fontFamily:"Inter", fontSize: 30, fontWeight: 800, textAlign:'center', marginTop:20, marginBottom: 30}}
                    >Ready to Swipe?</Text>
                    <Text style = {{fontFamily:"Inter", fontWeight:400, fontSize: 25, textAlign:"center"}}>Swipe <Text style = {{color:"#5DB075", fontWeight:800}}>LEFT</Text> to skip.</Text>
                    <Text style = {{fontFamily:"Inter", fontWeight:400, fontSize: 25, textAlign:"center"}}>Swipe <Text style = {{color:"#5DB075", fontWeight:800}}>RIGHT</Text> to save.</Text>
                    <View style = {[styles.buttonContainer, {marginTop:30}]}>
                        <TouchableOpacity style = {styles.backButton} onPress={()=> setPressedFinished(false)}>
                            <Text style = {{color:"#5DB075"}}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.nextButton}>
                            <Text style = {{color: "#FFFFFF"}}>Start</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        {index > 1&& <View style = {styles.buttonContainer}>
            <TouchableOpacity style = {styles.backButton} onPress={decrementIndex}>
                <Text style = {{color:"#5DB075"}}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {styles.nextButton} onPress={incrementIndex}>
                {index == cards.length - 1 ? <Text style = {{color: "#FFFFFF"}}>Finish</Text>: <Text style = {{color: "#FFFFFF"}}>Next</Text> }
            </TouchableOpacity>
        </View>
        }
        <View style = {styles.stepContainer}>
            {index > 1 && <Text style = {styles.stepText}>Step {index - 1} of {cards.length - 2}</Text>}
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
