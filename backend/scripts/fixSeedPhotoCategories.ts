// One-off backfill for scripts/seedTestingData.ts's already-seeded 50
// places: their coverPhotoUrl/profilePicture originally came from Picsum
// Photos' /id/{n} endpoint, which has no category awareness (a cafe could
// get a photo of a mountain). This updates every place tracked in
// seed-manifest.json in place - no new rows, no manifest changes - to a
// LoremFlickr photo matched to its own category, using the exact same
// photoUrlsFor() helper (and per-place lock scheme) seedTestingData.ts
// itself now uses, so a fresh reseed would reproduce identical URLs. Run
// from backend/: npx ts-node --transpile-only scripts/fixSeedPhotoCategories.ts
import fs from "fs";
import { Database } from "../src/config";
import Model from "../src/models";
import { MANIFEST_PATH, TESTING_MD_PATH, photoUrlsFor } from "./seedTestingData";

const { Place, Category } = Model;

async function main() {
  await Database.sequelize.authenticate();
  console.log("Connected to database.");

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`${MANIFEST_PATH} not found - run seedTestingData.ts first.`);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));

  const categories = await Category.findAll({ raw: true });
  const categoryLabelById = new Map(categories.map((c: any) => [c.id, c.label]));

  let updated = 0;
  for (let i = 0; i < manifest.placeIds.length; i++) {
    const placeId = manifest.placeIds[i];
    const place: any = await Place.findByPk(placeId);
    if (!place) {
      console.warn(`  place id ${placeId} not found, skipping.`);
      continue;
    }
    const categoryLabel = categoryLabelById.get(place.categoryId);
    if (!categoryLabel) {
      console.warn(`  place id ${placeId} has unknown categoryId ${place.categoryId}, skipping.`);
      continue;
    }
    const { coverPhotoUrl, profilePicture } = photoUrlsFor(categoryLabel, i);
    await Place.update({ coverPhotoUrl, profilePicture }, { where: { id: placeId } });
    updated++;
    if (updated % 10 === 0) console.log(`  ...${updated}/${manifest.placeIds.length} places done`);
  }

  console.log(`\nUpdated photos for ${updated}/${manifest.placeIds.length} places to match their category.`);

  appendTestingMdNote(updated);
  console.log(`testing.md updated at ${TESTING_MD_PATH}`);

  await Database.sequelize.close();
}

function appendTestingMdNote(updated: number) {
  const existing = fs.existsSync(TESTING_MD_PATH) ? fs.readFileSync(TESTING_MD_PATH, "utf-8") : "";
  const note = [
    "",
    "## Category-matched photos (fixSeedPhotoCategories.ts)",
    "",
    "Ran after the initial seed to fix a real bug: the original cover photos/profile pictures came from Picsum",
    "Photos' `/id/{n}` endpoint, which returns arbitrary stock photos with no relationship to a place's actual",
    `category (a cafe could get a photo of a mountain). All ${updated} places' photos were replaced with`,
    "category-matched photos from [LoremFlickr](https://loremflickr.com) instead (e.g. restaurants/diners get",
    "restaurant photos, gyms get gym/fitness photos, apartments get apartment-building photos), each pinned to a",
    "stable per-place `lock` value so reloads don't re-randomize them.",
    "",
  ].join("\n");
  fs.writeFileSync(TESTING_MD_PATH, existing + note);
}

main().catch((err) => {
  console.error("Photo backfill failed:", err);
  process.exit(1);
});
