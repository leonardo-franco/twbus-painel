/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  rootDir: '../',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/basic.test.js'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js',
    '!<rootDir>/src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  verbose: true
};
