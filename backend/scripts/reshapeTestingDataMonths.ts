// Additive follow-up to seedTestingData.ts - does NOT re-seed from scratch.
// Two things, both needed to make Business Dashboard KPIs/charts (12-month
// rating trend, review volume, month-over-month deltas, sentiment) show
// real variation instead of a single spike in the current month:
//
// 1. Backdates every existing seeded review+reply's createdAt across the
//    past 12 months (weighted so the current month has the most - a
//    realistic growth curve, and one that makes reviewCountTrend/
//    averageRatingTrend/responseRateTrend genuinely non-zero).
// 2. Tops up owner26@rmp-seed-test.example.com's place (Everest Coding
//    Academy) to ~30 reviews using previously-unused reviewers from the same
//    30-person pool, so its dashboard specifically has real volume to show
//    across every KPI/section, not just seedTestingData.ts's original 4-5.
//    The 2 most recent of these are left unreplied on purpose, so "Awaiting
//    Reply" isn't permanently stuck at zero on this account either.
//
// New review/reply ids are appended to seed-manifest.json, so
// unseedTestingData.ts still cleanly reverts all of it. Run from backend/:
// npx ts-node --transpile-only scripts/reshapeTestingDataMonths.ts
import fs from "fs";
import { Op } from "sequelize";
import { Database } from "../src/config";
import Model from "../src/models";
import {
  MANIFEST_PATH,
  TESTING_MD_PATH,
  TEST_EMAIL_DOMAIN,
  REVIEW_TEMPLATES,
  REPLY_TEMPLATES,
  pick,
  pickUnused,
  randInt,
  weightedRating,
  replyToneFor,
} from "./seedTestingData";

const { User, Place, Review, ReviewReply } = Model;

const BOOST_OWNER_EMAIL = `owner26@${TEST_EMAIL_DOMAIN}`;
const BOOST_TARGET_REVIEWS = 30;
const UNREPLIED_COUNT = 2; // most-recent N of the newly added reviews get no reply

const NOW = new Date();

// Mirrors businessDashboardMath.ts's computeMonthlyBuckets window exactly
// (last 12 calendar months up to and including the current one) - monthsAgo
// 0 = current month, 11 = eleven months ago. Weight (12 - monthsAgo) means
// the current month is 12x as likely as the oldest, a deliberate growth
// curve so reviewCountTrend/averageRatingTrend/responseRateTrend (which
// compare "as of now" against "as of the start of this month") come out
// meaningfully positive rather than flat.
function pickBackdatedReviewDate(): Date {
  const weights = Array.from({ length: 12 }, (_, monthsAgo) => 12 - monthsAgo);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let monthsAgo = 11;
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) {
      monthsAgo = i;
      break;
    }
    r -= weights[i];
  }

  const monthStart = new Date(NOW.getFullYear(), NOW.getMonth() - monthsAgo, 1);
  const monthEnd = monthsAgo === 0 ? NOW : new Date(NOW.getFullYear(), NOW.getMonth() - monthsAgo + 1, 1);
  return new Date(monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime()));
}

function replyDateAfter(reviewDate: Date): Date {
  const candidate = new Date(reviewDate.getTime() + randInt(1, 10) * 24 * 60 * 60 * 1000);
  return candidate.getTime() > NOW.getTime() ? NOW : candidate;
}

async function backdateExisting(manifest: any) {
  console.log(`Backdating ${manifest.reviewIds.length} existing reviews/replies across the past 12 months...`);
  for (let i = 0; i < manifest.reviewIds.length; i++) {
    const reviewDate = pickBackdatedReviewDate();
    const replyDate = replyDateAfter(reviewDate);
    await Review.update({ createdAt: reviewDate }, { where: { id: manifest.reviewIds[i] } });
    await ReviewReply.update({ createdAt: replyDate }, { where: { id: manifest.replyIds[i] } });
    if ((i + 1) % 50 === 0) console.log(`  ...${i + 1}/${manifest.reviewIds.length}`);
  }
  console.log("Done backdating existing data.");
}

async function boostOwner26(manifest: any) {
  const owner: any = await User.findOne({ where: { email: BOOST_OWNER_EMAIL } });
  if (!owner) throw new Error(`${BOOST_OWNER_EMAIL} not found - has it been seeded?`);
  const place: any = await Place.findOne({ where: { ownerId: owner.id } });
  if (!place) throw new Error(`No place found for ${BOOST_OWNER_EMAIL}`);

  console.log(`\nBoosting "${place.label}" (owner ${BOOST_OWNER_EMAIL}, place id ${place.id})...`);

  const existingReviews: any[] = await Review.findAll({ where: { placeId: place.id }, raw: true });
  const usedReviewerIds = new Set(existingReviews.map((r) => r.reviewerId));
  const existingReplies: any[] = await ReviewReply.findAll({
    where: { reviewId: { [Op.in]: existingReviews.map((r) => r.id) } },
    raw: true,
  });

  // Reconstruct "already used" template sets from what's already in the DB,
  // so newly added reviews/replies don't just repeat this place's existing
  // ones (same reasoning as pickUnused's own per-place dedup in
  // seedTestingData.ts, applied here across the pre-existing + new set).
  const usedReviewTexts = new Set<string>();
  for (const r of existingReviews) {
    const tier = r.rating as 5 | 4 | 3 | 2;
    const templates = REVIEW_TEMPLATES[tier] ?? [];
    const match = templates.find((t) => t.replace("{place}", place.label) === r.review);
    if (match) usedReviewTexts.add(match);
  }
  const usedReplyTexts = new Set<string>();
  for (const reply of existingReplies) {
    for (const pool of Object.values(REPLY_TEMPLATES)) {
      if (pool.includes(reply.description)) usedReplyTexts.add(reply.description);
    }
  }

  const availableReviewers: any[] = (
    await User.findAll({ where: { id: { [Op.in]: manifest.reviewerIds.filter((id: number) => !usedReviewerIds.has(id)) } } })
  );

  const toAdd = Math.max(0, Math.min(BOOST_TARGET_REVIEWS - existingReviews.length, availableReviewers.length));
  console.log(`  ${existingReviews.length} existing reviews, adding ${toAdd} more (target ${BOOST_TARGET_REVIEWS}).`);

  // Newest-dated reviews get no reply (UNREPLIED_COUNT of them) - generate
  // all dates up front, sort, then decide reply/no-reply by recency rank.
  const newReviewDates = Array.from({ length: toAdd }, () => pickBackdatedReviewDate()).sort((a, b) => a.getTime() - b.getTime());

  const newReviewIds: number[] = [];
  const newReplyIds: number[] = [];

  for (let i = 0; i < toAdd; i++) {
    const reviewer = availableReviewers[i];
    const rating = weightedRating();
    const reviewDate = newReviewDates[i];
    const review: any = await Review.create({
      review: pickUnused(REVIEW_TEMPLATES[rating], usedReviewTexts).replace(/\{place\}/g, place.label),
      rating,
      placeId: place.id,
      reviewerId: reviewer.id,
      helpfulCount: randInt(0, 20),
      createdAt: reviewDate,
    } as any);
    newReviewIds.push(review.id);

    const isAmongNewest = i >= toAdd - UNREPLIED_COUNT;
    if (!isAmongNewest) {
      const reply: any = await ReviewReply.create({
        description: pickUnused(REPLY_TEMPLATES[replyToneFor(rating)], usedReplyTexts),
        reviewId: review.id,
        ownerId: owner.id,
        createdAt: replyDateAfter(reviewDate),
      } as any);
      newReplyIds.push(reply.id);
    }
  }

  const allReviews: any[] = await Review.findAll({ where: { placeId: place.id }, raw: true });
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await Place.update(
    { averageRating: Math.round(avg * 10) / 10, reviewCount: allReviews.length },
    { where: { id: place.id } }
  );

  console.log(`  "${place.label}" now has ${allReviews.length} reviews (avg ${Math.round(avg * 10) / 10}), ${UNREPLIED_COUNT} awaiting reply.`);

  return { newReviewIds, newReplyIds, placeLabel: place.label, placeId: place.id, totalReviews: allReviews.length };
}

async function main() {
  await Database.sequelize.authenticate();
  console.log("Connected to database.");

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`${MANIFEST_PATH} not found - run seedTestingData.ts first.`);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));

  await backdateExisting(manifest);
  const boost = await boostOwner26(manifest);

  manifest.reviewIds.push(...boost.newReviewIds);
  manifest.replyIds.push(...boost.newReplyIds);
  manifest.monthsSpread = true;
  manifest.boostedPlace = { id: boost.placeId, label: boost.placeLabel, ownerEmail: BOOST_OWNER_EMAIL, totalReviews: boost.totalReviews };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest updated: ${manifest.reviewIds.length} total reviews, ${manifest.replyIds.length} total replies tracked.`);

  appendTestingMdNote(boost);
  console.log(`testing.md updated at ${TESTING_MD_PATH}`);

  await Database.sequelize.close();
}

function appendTestingMdNote(boost: { placeLabel: string; ownerEmail: string; totalReviews: number }) {
  const existing = fs.existsSync(TESTING_MD_PATH) ? fs.readFileSync(TESTING_MD_PATH, "utf-8") : "";
  const note = [
    "",
    "## Month spread + dashboard boost (reshapeTestingDataMonths.ts)",
    "",
    "Ran after the initial seed to make Business Dashboard KPIs/charts show real month-over-month variation instead",
    "of everything dated the same day:",
    "",
    "- Every seeded review/reply's `createdAt` was backdated across the past 12 months (weighted toward the current",
    "  month - a growth curve, not a flat spread), so the Rating Trend / Review Volume charts and every trend delta",
    "  (Reputation Score, Average Rating, Review Count, Response Rate) now show real movement on every business",
    "  account, not just the one below.",
    `- **${boost.ownerEmail}**'s place ("${boost.placeLabel}") was topped up to **${boost.totalReviews} reviews** (using`,
    "  previously-unused reviewers from the same 30-person pool) specifically so its own dashboard has enough volume",
    "  to look genuinely full across every KPI and section. Its 2 most-recent reviews were left unreplied on",
    "  purpose, so \"Awaiting Reply\" has something real to show on this account too.",
    "",
  ].join("\n");
  fs.writeFileSync(TESTING_MD_PATH, existing + note);
}

main().catch((err) => {
  console.error("Reshape failed:", err);
  process.exit(1);
});
