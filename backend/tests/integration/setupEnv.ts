import path from "path";
import dotenv from "dotenv";

// Loads .env.test (gitignored, like .env - see .env.test.example) before any
// app code imports src/config, so repositories connect to the real
// integration-test database instead of dev. Runs as a Jest setupFiles entry,
// guaranteed to execute before test module imports.
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });
