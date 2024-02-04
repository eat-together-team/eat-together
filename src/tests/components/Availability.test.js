import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Availability from '../../src/components/Availability';

describe('Availability Component', () => {
  it('renders correctly', () => {
    const mockTime = { startTime: '10:00', endTime: '11:00' };
    const mockEdit = jest.fn();
    const { getByText } = render(<Availability time={mockTime} edit={mockEdit} />);
    expect(getByText('10:00 - 11:00')).toBeTruthy();
  });

  it('displays correct time range', () => {
    const mockTime = { startTime: '12:00', endTime: '14:00' };
    const expectedTimeRange = '12:00 - 14:00';
    const { getByText } = render(<Availability time={mockTime} edit={() => {}} />);
    expect(getByText(expectedTimeRange)).toBeTruthy();
  });

  it('edit function called on press', () => {
    const mockTime = { startTime: '15:00', endTime: '16:00' };
    const mockEdit = jest.fn();
    const { getByText } = render(<Availability time={mockTime} edit={mockEdit} />);
    fireEvent.press(getByText('15:00 - 16:00'));
    expect(mockEdit).toHaveBeenCalled();
  });
});
