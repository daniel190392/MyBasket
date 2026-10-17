module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\.[jt]sx?$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: ['module:@react-native/babel-preset'],
      },
    ],
  },
};
