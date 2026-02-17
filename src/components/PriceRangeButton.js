import React from 'react'
import {TouchableOpacity, StyleSheet} from 'react-native';
import MediumText from './MediumText';
import SmallText from './SmallText';
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
      <MediumText>
        <MediumText color  = "#808080" size = {15} center = "center">{dollars} {'\n'}</MediumText>
        <SmallText color = "#808080" size = {12} center = "center">{text}</SmallText>
      </MediumText>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  priceContainer: (priceRange, dollars) => {
      const isSelected = priceRange === dollars.length;
      return {
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        width: 258,
        height: 87,
        backgroundColor: isSelected ? 'rgba(93, 176, 117, 0.3)' : '#FFFFFF',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: isSelected ? '#5DB075' : '#D0D0D0',
        marginVertical: 10,
      };
    }
  });
export default PriceRangeButton
