/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/integration/setupEnv.ts"],
  globalTeardown: "<rootDir>/tests/integration/globalTeardown.js",
  // Real Postgres connections, not mocks - run serially (npm script passes
  // --runInBand) so concurrent test files don't race on shared tables via
  // truncateAll(). Higher default timeout than the unit config for real I/O.
  testTimeout: 15000,
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: { types: ["node", "jest"] },
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },
};
