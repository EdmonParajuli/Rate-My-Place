// Dummy env vars so src/config/index.ts's mustExist() guards pass on import -
// unit tests mock the repository/Database layer directly, so none of these
// values are ever used to reach a real Postgres or Cloudinary account.
process.env.DB_HOST = "localhost";
process.env.DB_USER = "test";
process.env.DB_PASSWORD = "test";
process.env.DB_NAME = "test";
process.env.DB_DIALECT = "postgres";
process.env.DB_PORT = "5432";
process.env.PORT = "4000";
// Low bcrypt cost factor - authService tests hash real passwords, and the
// default production cost would make the suite noticeably slower for no
// added test value.
process.env.PASSWORD_HASH_CONSTANT = "4";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_REFRESH_EXPIRES_IN = "30d";
process.env.CLOUDINARY_NAME = "test-cloud";
process.env.API_KEY = "test-key";
process.env.API_SECRET = "test-secret";
