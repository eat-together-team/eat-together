import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Availability from '../../src/components/Availability';

describe('Availability', () => {
  const mockEdit = jest.fn();

  const props = {
    time: {
      startTime: new Date(2022, 1, 1, 12, 0, 0),
      endTime: new Date(2022, 1, 1, 13, 0, 0),
    },
    edit: mockEdit,
  };

  it('renders correctly', () => {
    const { getByText } = render(<Availability {...props} />);

    expect(getByText('12:00 PM - 01:00 PM')).toBeTruthy();
  });

  it('calls edit function when pressed', () => {
    const { getByText } = render(<Availability {...props} />);

    fireEvent.press(getByText('12:00 PM - 01:00 PM'));

    expect(mockEdit).toHaveBeenCalled();
  });
});
