import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Availability from '../../components/Availability';

describe('Availability Component', () => {
  it('renders correctly', () => {
    // Create Date objects for startTime and endTime
    const mockTime = {
      startTime: new Date(2020, 0, 1, 10, 0), // January 1, 2020, 10:00 AM
      endTime: new Date(2020, 0, 1, 11, 0), // January 1, 2020, 11:00 AM
    };
    const mockEdit = jest.fn();
    const { getByText } = render(<Availability time={mockTime} edit={mockEdit} />);
    expect(getByText('10:00 am - 11:00 am')).toBeTruthy();
  });

  it('displays correct time range', () => {
    // Create Date objects for startTime and endTime
    const mockTime = {
      startTime: new Date(2020, 0, 1, 12, 0), // January 1, 2020, 12:00 PM
      endTime: new Date(2020, 0, 1, 14, 0), // January 1, 2020, 2:00 PM
    };
    const expectedTimeRange = '12:00 pm - 2:00 pm';
    const { getByText } = render(<Availability time={mockTime} edit={() => {}} />);
    expect(getByText(expectedTimeRange)).toBeTruthy();
  });

  it('edit function called on press', () => {
    // Create Date objects for startTime and endTime
    const mockTime = {
      startTime: new Date(2020, 0, 1, 15, 0), // January 1, 2020, 3:00 PM
      endTime: new Date(2020, 0, 1, 16, 0), // January 1, 2020, 4:00 PM
    };
    const mockEdit = jest.fn();
    const { getByText } = render(<Availability time={mockTime} edit={mockEdit} />);
    fireEvent.press(getByText('3:00 pm - 4:00 pm'));
    expect(mockEdit).toHaveBeenCalled();
  });
});
