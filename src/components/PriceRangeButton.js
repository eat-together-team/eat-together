import React from 'react'
import {TouchableOpacity, StyleSheet} from 'react-native';
import Header3Text from './typography/Header3Text';
import SubBodyText from './typography/SubBodyText';
import { useTheme } from '../rapi_ui_components';
import { colorTokens } from '../theme/colorTokens';

const PriceRangeButton = ({dollars, text, setPriceRange, priceRange}) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const isSelected = priceRange === dollars.length;
  const textColor = isSelected ? colors.onPrimaryContainer : colors.outline;

  return (
    <TouchableOpacity
      style={[
        styles.priceContainer,
        {
          backgroundColor: isSelected ? colors.primaryContainer : colors.background,
          borderColor: isSelected ? colors.primary : colors.outline,
        },
      ]}
      onPress={() => setPriceRange(dollars.length)}
    >
      <Header3Text color={textColor}>{dollars}</Header3Text>
      <SubBodyText color={textColor}>{text}</SubBodyText>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  priceContainer: {
    width: '100%',
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 2,
  },
});
export default PriceRangeButton
