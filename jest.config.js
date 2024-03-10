module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['../eat-together/jest.setup.js'],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
  };