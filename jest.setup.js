jest.mock('@expo-google-fonts/inter', () => ({
    useFonts: jest.fn().mockReturnValue([true, null]),
  }));

jest.mock('@expo/vector-icons', () => ({
    Foundation: jest.fn().mockReturnValue([true, null]),
    Ionicons: 'Ionicons',
}));