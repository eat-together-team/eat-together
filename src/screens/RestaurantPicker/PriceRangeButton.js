import React from 'react'
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
const PriceRangeButton = ({dollars, text, setPriceRange , priceRange}) => {
 
  const handlePriceRange = () =>{
    if(dollars === "$"){
      setPriceRange(1);
    }else if (dollars === "$$"){
      setPriceRange(2);
    }else if (dollars === "$$$"){
      setPriceRange(3);
    }else{
      setPriceRange(4);
    }
  };
  return (
    <TouchableOpacity style = {styles.priceContainer(priceRange,dollars)} onPress={handlePriceRange}>
      <Text>
        <Text style = {{color:"#5DB075", fontSize: 15, fontWeight: 500}}>{dollars}</Text>
        <Text style = {{color:"#A9A9A9", fontSize: 15, fontWeight: 500}}>{text}</Text>
      </Text>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  priceContainer: (priceRange, dollars) => ({
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      width: 190,
      height: 40,
      backgroundColor: priceRange === dollars.length ? "#F2F4F7" : "#FFFFFF",
      borderRadius:10,
      shadowOpacity: 0.25,
      shadowOffset: {
          width: 0,
          height: 4,
      },
    })
  });
export default PriceRangeButton
