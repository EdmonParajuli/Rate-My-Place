// Reverts everything seedTestingData.ts created. Prefers the exact IDs in
// seed-manifest.json (written by that script) so it can never touch
// anything else; falls back to a `WHERE email LIKE '%@rmp-seed-test.example.com'`
// sweep (deriving owner/reviewer ids from there instead) if the manifest is
// missing, since that fake domain is the one thing seedTestingData.ts never
// reuses for anything real. Hard-deletes (force: true) in FK-safe order:
// replies -> reviews -> places -> users. Run from backend/:
// npx ts-node --transpile-only scripts/unseedTestingData.ts
import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import { Database } from "../src/config";
import Model from "../src/models";

const { User, Place, Review, ReviewReply } = Model;

const TEST_EMAIL_DOMAIN = "rmp-seed-test.example.com";
const MANIFEST_PATH = path.join(__dirname, "seed-manifest.json");

async function main() {
  await Database.sequelize.authenticate();
  console.log("Connected to database.");

  let ownerIds: number[];
  let reviewerIds: number[];

  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    ownerIds = manifest.ownerIds;
    reviewerIds = manifest.reviewerIds;
    console.log(`Using manifest: ${ownerIds.length} owners, ${reviewerIds.length} reviewers.`);
  } else {
    console.log("No manifest found - falling back to email-domain sweep.");
    const seededUsers = await User.findAll({ where: { email: { [Op.like]: `%@${TEST_EMAIL_DOMAIN}` } }, raw: true });
    ownerIds = seededUsers.filter((u: any) => u.userType === "BUSINESS").map((u: any) => u.id);
    reviewerIds = seededUsers.filter((u: any) => u.userType === "REGULAR").map((u: any) => u.id);
    console.log(`Found ${ownerIds.length} owners, ${reviewerIds.length} reviewers via email sweep.`);
  }

  const allUserIds = [...ownerIds, ...reviewerIds];
  if (allUserIds.length === 0) {
    console.log("Nothing to revert - no seeded users found.");
    await Database.sequelize.close();
    return;
  }

  const places = await Place.findAll({ where: { ownerId: { [Op.in]: ownerIds } }, raw: true, paranoid: false });
  const placeIds = places.map((p: any) => p.id);

  const repliesDeleted = await ReviewReply.destroy({ where: { ownerId: { [Op.in]: ownerIds } }, force: true });
  console.log(`Deleted ${repliesDeleted} owner replies.`);

  const reviewsDeleted = await Review.destroy({
    where: { [Op.or]: [{ reviewerId: { [Op.in]: reviewerIds } }, { placeId: { [Op.in]: placeIds } }] },
    force: true,
  });
  console.log(`Deleted ${reviewsDeleted} reviews.`);

  const placesDeleted = await Place.destroy({ where: { ownerId: { [Op.in]: ownerIds } }, force: true });
  console.log(`Deleted ${placesDeleted} places.`);

  const usersDeleted = await User.destroy({ where: { id: { [Op.in]: allUserIds } }, force: true });
  console.log(`Deleted ${usersDeleted} users (owners + reviewers).`);

  if (fs.existsSync(MANIFEST_PATH)) {
    fs.unlinkSync(MANIFEST_PATH);
    console.log("Removed seed-manifest.json.");
  }

  console.log("\nRevert complete. You can now delete testing.md, scripts/seedTestingData.ts, and scripts/unseedTestingData.ts.");
  await Database.sequelize.close();
}

main().catch((err) => {
  console.error("Unseed failed:", err);
  process.exit(1);
});
