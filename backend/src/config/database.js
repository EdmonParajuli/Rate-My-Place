// NODE_ENV=test (set by the db:migrate:test script) loads .env.test instead
// of .env, so `sequelize-cli db:migrate` targets the integration-test DB
// (docs/06-quality-and-ops.md, docs/specs/phase-9-integration-tests.md) -
// never the dev DB. Both keys below read the same already-resolved env vars;
// sequelize-cli itself picks development/test based on NODE_ENV.
require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const config = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    // Without this, sequelize-cli doesn't track which seeders already ran
    // (unlike migrations, which always track via SequelizeMeta) - every
    // `db:seed:all` call re-runs every seeder file, silently duplicating
    // whatever they insert. This makes seeders track their run state in a
    // SequelizeData table the same way migrations do, so re-running
    // `db:seed` is a no-op for seeders that already applied.
    seederStorage: 'sequelize'
};

module.exports = {
    development: config,
    test: config,
};