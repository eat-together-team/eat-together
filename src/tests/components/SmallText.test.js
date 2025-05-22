import React from 'react';
import { render } from '@testing-library/react-native';
import SmallText from '../../components/SmallText'; // Adjusted path

describe('SmallText', () => {
  it('should apply styles from style prop', () => {
    const testStyle = { color: 'red', fontSize: 12 };
    const { getByText } = render(<SmallText style={testStyle}>Test Text</SmallText>);
    const textElement = getByText('Test Text');
    // Check if the style prop is an array and contains the testStyle
    expect(textElement.props.style).toEqual(expect.arrayContaining([expect.objectContaining(testStyle)]));
  });

  it('style prop should override default styles', () => {
    // Default styles are assumed to be: color: 'black', fontSize: 10
    const overridingStyle = { color: 'blue', fontSize: 15 };
    const { getByText } = render(<SmallText style={overridingStyle}>Override Test</SmallText>);
    const textElement = getByText('Override Test');
    
    // The component wraps styles in an array: [{default styles}, {passed styles}]
    // We need to check the composed style. React Native flattens this array.
    // For testing, we can simulate this by merging the objects, with later objects overriding earlier ones.
    const appliedStyles = Array.isArray(textElement.props.style) ? Object.assign({}, ...textElement.props.style) : textElement.props.style;
    
    expect(appliedStyles.color).toBe('blue');
    expect(appliedStyles.fontSize).toBe(15);
  });
});
