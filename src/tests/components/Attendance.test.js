import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Attendance from '../../components/Attendance';

describe('Attendance Component', () => {
    const mockPress = jest.fn();
    const mockPerson = {
        firstName: 'John',
        lastName: 'Doe',
        hasImage: true,
        image: 'http://example.com/image.jpg'
    };

    it('renders correctly', () => {
        const { getByText } = render(<Attendance person={mockPerson} attending={true} onPress={mockPress} />);
        expect(getByText('John Doe')).toBeTruthy();
    });

    it('displays the correct image when person has an image', () => {
        const { getByTestId } = render(<Attendance person={mockPerson} attending={true} onPress={mockPress} />);
        const image = getByTestId('person-image');
        expect(image.props.source.uri).toBe('http://example.com/image.jpg');
    });

    it('displays default image when person has no image', () => {
        const personWithoutImage = { ...mockPerson, hasImage: false };
        const { getByTestId } = render(<Attendance person={personWithoutImage} attending={true} onPress={mockPress} />);
        const image = getByTestId('person-image');
        expect(image.props.source).toBe(require("../../../assets/logo.png"));
        expect(image.props.source).toBe(require("../../../assets/logo.png"));
    });

    it('handles onPress event', () => {
        const { getByTestId } = render(<Attendance person={mockPerson} attending={true} onPress={mockPress} />);
        fireEvent.press(getByTestId('attendance-button'));
        expect(mockPress).toHaveBeenCalled();
    });
    it('changes borderColor based on attending status', () => {
        const { getByTestId } = render(<Attendance person={mockPerson} attending={true} onPress={mockPress} />);
        const button = getByTestId('attendance-button');
        expect(button.props.style.borderColor).toEqual("#5DB075");
        const falseButton = render(<Attendance person={mockPerson} attending={false} onPress={mockPress} />).getByTestId('attendance-button');
        expect(falseButton.props.style.borderColor).toEqual("grey");
    });

    it('displays the correct text when firstName or lastName is missing', () => {
        const missingLastName = { ...mockPerson, lastName: '' };
        const missingFirstName = { ...mockPerson, firstName: '' };
        const { getByText: getByTextMissingLastName } = render(<Attendance person={missingLastName} attending={true} onPress={mockPress} />);
        expect(getByTextMissingLastName('John')).toBeTruthy();
        const { getByText: getByTextMissingFirstName } = render(<Attendance person={missingFirstName} attending={true} onPress={mockPress} />);
        expect(getByTextMissingFirstName('Doe')).toBeTruthy();
    });
});