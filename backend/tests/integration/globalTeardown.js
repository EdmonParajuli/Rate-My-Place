// Plain JS, not TS - Jest's globalTeardown runs outside the normal
// ts-jest transform pipeline, in its own process, so it needs to register
// ts-node itself before requiring any TS source.
//
// Closing the DB connection pool here (once, after every test FILE has
// finished) rather than per-file afterAll matters because `--runInBand`
// (see package.json's test:integration script) runs all integration test
// files in the SAME process, sharing the same Database singleton - closing
// it in one file's afterAll broke every file that ran after it.
module.exports = async () => {
  require("ts-node/register/transpile-only");
  require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env.test") });
  const { Database } = require("../../src/config");
  await Database.sequelize.close();
};
