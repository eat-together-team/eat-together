import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BorderedButton from '../../src/components/BorderedButton';

describe('BorderedButton', () => {
  const mockOnPress = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<BorderedButton onPress={mockOnPress}>Test</BorderedButton>);
  });

  it('renders TouchableOpacity with correct styles based on props', () => {
    const { getByTestId } = render(<BorderedButton color="#000000" borderWidth={3} onPress={mockOnPress}>Test</BorderedButton>);
    expect(getByTestId('bordered-button')).toHaveStyle({ borderColor: '#000000', borderWidth: 3 });
  });

  it('renders MediumText with correct text, color, and size based on props', () => {
    const { getByText } = render(<BorderedButton color="#000000" fontSize={25} onPress={mockOnPress}>Test</BorderedButton>);
    const textElement = getByText('Test');
    expect(textElement).toBeTruthy();
    expect(textElement).toHaveStyle({ color: '#000000', fontSize: 25 });
  });

  it('calls onPress when TouchableOpacity is pressed', () => {
    const { getByTestId } = render(<BorderedButton onPress={mockOnPress}>Test</BorderedButton>);
    fireEvent.press(getByTestId('bordered-button'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
