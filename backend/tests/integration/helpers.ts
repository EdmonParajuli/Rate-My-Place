import { Database } from "../../src/config";
import { UserRepository } from "../../src/repositories/userRepository";
import { CategoryRepository } from "../../src/repositories/categoryRepository";
import PlaceRepository from "../../src/repositories/placeRepository";
import { UserTypeEnum } from "../../src/enums/userTypesEnum";

// Truncates every table backed by a Sequelize model (not SequelizeMeta, which
// isn't a model - migration history stays intact) - called between tests for
// isolation, cheaper than re-migrating a fresh DB per test.
//
// Deliberately a single raw TRUNCATE, not Sequelize's own sequelize.truncate()
// convenience method - that resolves without error but silently truncates
// zero tables in this project's setup (its internal modelManager.models array
// is empty even though sequelize.models, the public registry, is correctly
// populated - a real, reproducible mismatch, not a usage mistake). Building
// the table list from sequelize.models (rather than hardcoding table names)
// keeps this in sync automatically as new models get added.
export async function truncateAll(): Promise<void> {
  const tableNames = Object.values(Database.sequelize.models).map((model) => `"${model.getTableName()}"`);
  await Database.sequelize.query(`TRUNCATE TABLE ${tableNames.join(", ")} RESTART IDENTITY CASCADE;`);
}

let userCounter = 0;
export async function createTestUser(overrides: Partial<{ email: string; userType: UserTypeEnum }> = {}) {
  userCounter += 1;
  return new UserRepository().create({
    email: overrides.email ?? `test-user-${userCounter}@example.com`,
    passwordHash: "not-a-real-hash",
    fullName: `Test User ${userCounter}`,
    userType: overrides.userType ?? UserTypeEnum.REGULAR,
  });
}

let categoryCounter = 0;
export async function createTestCategory() {
  categoryCounter += 1;
  return new CategoryRepository().create({
    label: `Test Category ${categoryCounter}`,
    description: "A category created for integration tests.",
  });
}

export async function createTestPlace(overrides: { ownerId: string; categoryId?: number }) {
  const categoryId = overrides.categoryId ?? (await createTestCategory()).id;
  return new PlaceRepository().create({
    label: "Test Place",
    address: "123 Integration Test Street",
    phone: "555-0100",
    ownerId: overrides.ownerId,
    categoryId: Number(categoryId),
  });
}
