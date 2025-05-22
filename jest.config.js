module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['./jest.setup.js'],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
  };