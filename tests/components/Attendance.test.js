import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Attendance from '../../src/components/Attendance';

describe('Attendance', () => {
  const mockOnPress = jest.fn();

  const props = {
    person: {
      firstName: 'John',
      lastName: 'Doe',
      hasImage: true,
      image: 'http://example.com/image.jpg',
    },
    attending: true,
    onPress: mockOnPress,
  };

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<Attendance {...props} />);

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByTestId('checkmark').props.style.color).toBe('#5DB075');
    expect(getByTestId('image').props.source.uri).toBe('http://example.com/image.jpg');
  });

  it('renders default image when person has no image', () => {
    const { getByTestId } = render(<Attendance {...props, person: { ...props.person, hasImage: false }} />);

    expect(getByTestId('image').props.source).toEqual(require('../../assets/logo.png'));
  });

  it('renders grey checkmark when person is not attending', () => {
    const { getByTestId } = render(<Attendance {...props, attending: false} />);

    expect(getByTestId('checkmark').props.style.color).toBe('grey');
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(<Attendance {...props} />);

    fireEvent.press(getByTestId('attendance-button'));

    expect(mockOnPress).toHaveBeenCalled();
  });
});
