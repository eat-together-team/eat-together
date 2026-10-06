import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsRow from '../../components/SettingsRow';
import { colorTokens } from '../../theme/colorTokens';

// Sidesteps ThemeProvider.tsx's expo-navigation-bar import, which Jest's
// react-native preset can't transform (ESM, not app-relevant in a unit test).
jest.mock('../../rapi_ui_components', () => ({
    useTheme: () => ({ theme: 'light' }),
}));

jest.mock('../../components/Switch', () => {
    const { Pressable } = require('react-native');
    return (props) => (
        <Pressable
            testID="settings-row-switch"
            onPress={() => props.onValueChange?.(!props.value)}
        />
    );
});

const tokens = colorTokens.light;

describe('SettingsRow', () => {
    it('renders the title and subtitle', () => {
        const { getByText } = render(
            <SettingsRow title="Notifications" subtitle="Chats, meetups, and updates" />
        );
        expect(getByText('Notifications')).toBeTruthy();
        expect(getByText('Chats, meetups, and updates')).toBeTruthy();
    });

    it('omits the subtitle when none is given', () => {
        const { getByText, queryByText } = render(<SettingsRow title="Launch tutorial" />);
        expect(getByText('Launch tutorial')).toBeTruthy();
        expect(queryByText('Chats, meetups, and updates')).toBeNull();
    });

    it('shows a chevron by default and calls onPress when tapped', () => {
        const onPress = jest.fn();
        const { getByTestId, UNSAFE_getByProps } = render(
            <SettingsRow testID="row" title="Privacy policy" onPress={onPress} />
        );
        expect(UNSAFE_getByProps({ name: 'chevron-forward' })).toBeTruthy();
        fireEvent.press(getByTestId('row'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders no accessory when accessory is "none"', () => {
        const { UNSAFE_queryByProps, queryByTestId } = render(
            <SettingsRow title="Logout" accessory="none" />
        );
        expect(UNSAFE_queryByProps({ name: 'chevron-forward' })).toBeNull();
        expect(queryByTestId('settings-row-switch')).toBeNull();
    });

    it('toggles the switch and reports the new value on press', () => {
        const onValueChange = jest.fn();
        const { getByTestId } = render(
            <SettingsRow
                testID="row"
                title="Recommendations"
                accessory="switch"
                value={false}
                onValueChange={onValueChange}
            />
        );
        fireEvent.press(getByTestId('row'));
        expect(onValueChange).toHaveBeenCalledWith(true);
    });

    it('renders the leading icon when one is provided', () => {
        const { UNSAFE_getByProps } = render(
            <SettingsRow title="Notifications" icon="notifications-outline" />
        );
        expect(UNSAFE_getByProps({ name: 'notifications-outline' })).toBeTruthy();
    });

    it('colors a destructive row title with the error token', () => {
        const { getByText } = render(
            <SettingsRow title="Delete account" accessory="none" destructive />
        );
        const text = getByText('Delete account');
        expect(text.props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({ color: tokens.error })])
        );
    });
});
