import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Attendance from '../../src/components/Attendance';

describe('Attendance', () => {
  const mockOnPress = jest.fn();
  const mockPerson = {
    firstName: 'John',
    lastName: 'Doe',
    hasImage: false,
    image: ''
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Attendance person={mockPerson} attending={false} onPress={mockOnPress} />);
  });

  it('renders TouchableOpacity with correct styles based on attending prop', () => {
    const { getByTestId } = render(<Attendance person={mockPerson} attending={true} onPress={mockOnPress} />);
    expect(getByTestId('attendance-button')).toHaveStyle({ borderColor: '#5DB075' });
  });

  it('renders Image with correct source based on person image', () => {
    const { getByTestId } = render(<Attendance person={mockPerson} attending={false} onPress={mockOnPress} />);
    expect(getByTestId('attendance-image')).toHaveProp('source', require('../../assets/logo.png'));
  });

  it('renders NormalText with correct text based on person name', () => {
    const { getByText } = render(<Attendance person={mockPerson} attending={false} onPress={mockOnPress} />);
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('renders Foundation icon with correct color based on attending prop', () => {
    const { getByTestId } = render(<Attendance person={mockPerson} attending={true} onPress={mockOnPress} />);
    expect(getByTestId('attendance-checkmark')).toHaveStyle({ color: '#5DB075' });
  });

  it('calls onPress when TouchableOpacity is pressed', () => {
    const { getByTestId } = render(<Attendance person={mockPerson} attending={false} onPress={mockOnPress} />);
    fireEvent.press(getByTestId('attendance-button'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
