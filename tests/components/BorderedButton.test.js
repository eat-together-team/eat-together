import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BorderedButton from '../../src/components/BorderedButton';

describe('BorderedButton', () => {
  const mockOnPress = jest.fn();

  it('renders correctly with default props', () => {
    const { getByText } = render(<BorderedButton onPress={mockOnPress}>Test</BorderedButton>);

    expect(getByText('Test')).toBeTruthy();
  });

  it('renders correctly with custom props', () => {
    const { getByText } = render(
      <BorderedButton color="red" borderWidth={3} onPress={mockOnPress}>
        Test
      </BorderedButton>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(<BorderedButton onPress={mockOnPress}>Test</BorderedButton>);

    fireEvent.press(getByText('Test'));

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(
      <BorderedButton disabled onPress={mockOnPress}>
        Test
      </BorderedButton>
    );

    fireEvent.press(getByText('Test'));

    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
