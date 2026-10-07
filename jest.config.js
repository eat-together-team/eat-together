module.exports = {
    preset: '@react-native/jest-preset',
    setupFilesAfterEnv: ['../eat-together/jest.setup.js'],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
  };