/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/setupEnv.ts"],
  clearMocks: true,
  transform: {
    // Root tsconfig.json only lists "node" types (it's also what `tsc` builds
    // src/ with) - add "jest" here rather than in tsconfig.json so test-only
    // globals (describe/it/expect) don't leak into the production build.
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: { types: ["node", "jest"] },
        // TS151002 is a harmless heads-up about node16 module resolution +
        // per-file transpilation, not a real type error - silence it rather
        // than touching tsconfig.json's isolatedModules (which the main
        // `tsc` build also reads).
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },
};
