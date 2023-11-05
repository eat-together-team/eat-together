import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Availability from '../../src/components/Availability';

describe('Availability', () => {
  const mockEdit = jest.fn();
  const mockTime = {
    startTime: new Date(2022, 1, 1, 12, 0, 0),
    endTime: new Date(2022, 1, 1, 13, 0, 0)
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Availability time={mockTime} edit={mockEdit} />);
  });

  it('renders NormalText with correct text based on time prop', () => {
    const { getByText } = render(<Availability time={mockTime} edit={mockEdit} />);
    expect(getByText('12:00 PM - 01:00 PM')).toBeTruthy();
  });

  it('calls edit prop function when TouchableOpacity is pressed', () => {
    const { getByTestId } = render(<Availability time={mockTime} edit={mockEdit} />);
    fireEvent.press(getByTestId('availability-button'));
    expect(mockEdit).toHaveBeenCalled();
  });
});
