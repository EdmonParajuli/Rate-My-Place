import { Database } from "../../src/config";
import { CategoryRepository } from "../../src/repositories/categoryRepository";
import { truncateAll } from "./helpers";

// Real Postgres, not a mocked repository - doc 6's testing layer 2
// ("verifies the Sequelize models, migrations, and BaseRepository methods
// actually work together"). Category is the simplest real model (no FK
// dependencies) so these tests can focus purely on BaseRepository's own
// behavior rather than fixture setup.
describe("BaseRepository (integration)", () => {
  let repository: CategoryRepository;

  beforeEach(async () => {
    await truncateAll();
    repository = new CategoryRepository();
  });

  it("creates and reads a row back", async () => {
    const created = await repository.create({ label: "Cafés", description: "Coffee shops" });
    const found = await repository.findByPk(created.id);

    expect(found.label).toBe("Cafés");
    expect(found.description).toBe("Coffee shops");
  });

  it("soft-deletes via the paranoid convention - findByPk excludes it, the row still physically exists, restore brings it back", async () => {
    const created = await repository.create({ label: "Gyms", description: "Fitness" });

    await repository.deleteOne(created.id);

    expect(await repository.findByPk(created.id)).toBeNull();
    const stillInDb = await repository.findOne({ where: { id: created.id }, paranoid: false });
    expect(stillInDb).not.toBeNull();
    expect(stillInDb.deletedAt).not.toBeNull();

    await repository.restore(Number(created.id));
    const restored = await repository.findByPk(created.id);
    expect(restored).not.toBeNull();
    expect(restored.deletedAt).toBeNull();
  });

  // Regression test for the real bug found and fixed during Phase 8 (see
  // docs/specs/phase-8-media-plumbing.md's transaction-visibility note):
  // BaseRepository.count() didn't accept a transaction, so a count() call
  // issued inside an open transaction couldn't see rows the SAME transaction
  // had just inserted - Postgres's default READ COMMITTED isolation makes
  // uncommitted rows invisible to any query outside the transaction that
  // wrote them, and "outside" included this repository's own count() before
  // the fix. A mocked-repository unit test structurally cannot catch this -
  // it depends on real transaction/isolation semantics.
  it("count() with a transaction sees rows the same open transaction just inserted", async () => {
    const transaction = await Database.sequelize.transaction();
    try {
      await repository.create({ label: "In-flight", description: "Created inside the transaction" }, { transaction });

      const countInsideTransaction = await repository.count({ transaction });
      expect(countInsideTransaction).toBe(1);

      const countOutsideTransaction = await repository.count({});
      expect(countOutsideTransaction).toBe(0);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    const countAfterCommit = await repository.count({});
    expect(countAfterCommit).toBe(1);
  });
});
