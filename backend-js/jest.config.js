// backend-js/jest.config.js
module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true,
  clearMocks: true,
  collectCoverageFrom: [
    "services/**/*.js",
    "models/**/*.js",
    "middleware/**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
