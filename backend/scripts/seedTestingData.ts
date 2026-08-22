// One-off test-data generator, NOT part of the app or the tracked db:seed
// pipeline (see backend/scripts/README - lives outside src/ on purpose so
// `npm run build` never compiles or ships it). Creates ~50 realistic
// businesses (owners, places, reviews, owner replies) spread across every
// real category and five real cities, for exploring the app like a live
// product. Every seeded user's email ends in the fake TEST_EMAIL_DOMAIN
// below - that's the sole marker unseedTestingData.ts (and testing.md's
// revert instructions) use to find and remove exactly this data, and
// nothing else. Run from backend/: npx ts-node --transpile-only scripts/seedTestingData.ts
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { Database } from "../src/config";
import Model from "../src/models";
import { UserTypeEnum } from "../src/enums/userTypesEnum";
import { PriceRangeEnum } from "../src/enums/priceRangeEnum";

const { User, Place, Category, Review, ReviewReply } = Model;

// example.com (not .local) - Joi's email validator (backend/src/validators/
// schemas.ts) checks the TLD against a real IANA list, and .local isn't on
// it (it's a reserved special-use pseudo-TLD, not real DNS) - login/signup
// would reject it with "must be a valid email". example.com's TLD (.com) is
// real, and the domain itself is RFC 2606-reserved for documentation/testing
// use, so it's still guaranteed to never collide with a real mailbox.
export const TEST_EMAIL_DOMAIN = "rmp-seed-test.example.com";
export const TEST_PASSWORD = "TestPass123!";
export const MANIFEST_PATH = path.join(__dirname, "seed-manifest.json");
export const TESTING_MD_PATH = path.join(__dirname, "..", "..", "testing.md");

type City = {
  name: string;
  region: string;
  lat: number;
  lng: number;
  phonePrefix: string;
  streets: string[];
};

const CITIES: City[] = [
  {
    name: "Kathmandu",
    region: "Bagmati Province, Nepal",
    lat: 27.7172,
    lng: 85.324,
    phonePrefix: "+977 1",
    streets: ["Durbar Marg", "Thamel Road", "New Baneshwor Road", "Lazimpat Marg", "Kalanki Chowk"],
  },
  {
    name: "New York",
    region: "NY, USA",
    lat: 40.7128,
    lng: -74.006,
    phonePrefix: "+1 212",
    streets: ["5th Avenue", "Broadway", "Madison Street", "Lexington Avenue", "Canal Street"],
  },
  {
    name: "London",
    region: "England, UK",
    lat: 51.5074,
    lng: -0.1278,
    phonePrefix: "+44 20",
    streets: ["Baker Street", "Oxford Street", "Camden High Street", "Kings Road", "Fleet Street"],
  },
  {
    name: "Toronto",
    region: "ON, Canada",
    lat: 43.6532,
    lng: -79.3832,
    phonePrefix: "+1 416",
    streets: ["Queen Street West", "Yonge Street", "King Street East", "Bloor Street", "Dundas Street"],
  },
  {
    name: "Sydney",
    region: "NSW, Australia",
    lat: -33.8688,
    lng: 151.2093,
    phonePrefix: "+61 2",
    streets: ["George Street", "Pitt Street", "Oxford Street", "Crown Street", "Harris Street"],
  },
];

const CATEGORY_PLACES: Record<string, string[]> = {
  Restaurants: ["Copper Kettle Bistro", "Firehouse Grill & Tap", "Blue Lotus Thai Kitchen", "Momo Junction", "Harborside Seafood Co."],
  Cafés: ["The Roasted Bean", "Cloud Nine Coffee House", "Willow & Whisk Café", "Sunrise Espresso Bar"],
  Hotels: ["Grandview Suites", "Riverside Boutique Hotel", "The Maple Inn", "Skyline Grand Hotel"],
  Fitness: ["IronCore Fitness Studio", "Pulse CrossFit Box", "Zenith Yoga & Wellness", "PeakForm Gym"],
  Shopping: ["Meridian Boutique", "Thread & Needle Fashion House", "Northgate Electronics", "The Vintage Trunk"],
  Healthcare: ["Sunrise Family Clinic", "CarePoint Medical Center", "Bright Smile Dental Studio", "Riverside Physiotherapy"],
  Education: ["Everest Coding Academy", "Bright Minds Tutoring Center", "Global Language Institute", "Little Learners Preschool"],
  "Beauty & Wellness": ["Serenity Spa & Salon", "Glow Up Beauty Bar", "Tranquil Touch Massage Studio", "The Nail Lounge"],
  Entertainment: ["Starlight Cinema", "Neon Arcade Zone", "Rhythm Live Music Hall", "Puzzle Room Escape Games", "Funland Bowling Alley"],
  "Professional Services": ["Sterling Legal Associates", "Apex Accounting Group", "Bright Path Consulting", "Precision Print & Design"],
  Bar: ["The Rusty Anchor Pub", "Copperhead Brewing Co.", "Velvet Lounge Cocktail Bar", "The Local Tap House"],
  "Housing & Apartments": ["Willowbrook Apartments", "Maple Ridge Residences", "The Harbor Lofts", "Cedar Grove Housing"],
};

const CATEGORY_DESCRIPTIONS: Record<string, string[]> = {
  Restaurants: [
    "{name} serves seasonal, chef-driven plates in a warm dining room - a neighborhood favorite for quick lunches and long dinners alike.",
    "A cozy spot known for generous portions, friendly service, and a menu that changes with what's fresh that week.",
  ],
  Cafés: [
    "{name} roasts its own beans in-house and pairs them with fresh pastries in a relaxed, laptop-friendly space.",
    "A neighborhood coffee stop with a loyal regular crowd, cozy seating, and a menu of espresso classics and seasonal drinks.",
  ],
  Hotels: [
    "{name} offers comfortable rooms, attentive staff, and a convenient location for both business travelers and weekend visitors.",
    "A well-kept, mid-size hotel with modern amenities and a lobby that's become a local meeting spot in its own right.",
  ],
  Fitness: [
    "{name} runs small-group classes and open gym hours with coaches who actually remember your name.",
    "A no-frills training space built around real results - free weights, functional training, and a strong community feel.",
  ],
  Shopping: [
    "{name} curates a tight, well-chosen selection rather than trying to stock everything - staff know the inventory by heart.",
    "A local favorite for browsing on a slow afternoon, with new arrivals rotating in every couple of weeks.",
  ],
  Healthcare: [
    "{name} focuses on unhurried appointments and clear explanations, with same-week booking for most visits.",
    "A trusted local practice known for a friendly front desk and providers who take the time to listen.",
  ],
  Education: [
    "{name} keeps class sizes small and instructors experienced, with a track record locals talk about.",
    "A well-regarded local institute offering both group classes and one-on-one sessions tailored to the student.",
  ],
  "Beauty & Wellness": [
    "{name} is a calm, unhurried space where regulars book the same technician every time.",
    "A relaxing spot known for consistent quality and a genuinely relaxing atmosphere, not just the treatments themselves.",
  ],
  Entertainment: [
    "{name} is a go-to for a fun night out, drawing a mixed crowd of regulars and first-timers alike.",
    "A lively local venue that regularly sells out its weekend slots - worth booking ahead.",
  ],
  "Professional Services": [
    "{name} is known locally for responsive communication and straightforward, jargon-free advice.",
    "A small, established practice that prioritizes long-term client relationships over one-off transactions.",
  ],
  Bar: [
    "{name} pours a serious drink list in a laid-back setting, with regulars who treat it like a second living room.",
    "A neighborhood bar known for its house specials, friendly bartenders, and low-key weeknight crowd.",
  ],
  "Housing & Apartments": [
    "{name} offers well-maintained units with responsive management - a solid option for renters in the area.",
    "A quiet residential community with a reputation for fast maintenance turnaround and fair renewals.",
  ],
};

const OWNER_NAMES = [
  "Amit Sharma", "Priya Rana", "Michael Chen", "Sarah Thompson", "David Kim", "Laura Martinez",
  "James Wilson", "Anjali Gurung", "Robert Johnson", "Emily Davis", "Christopher Lee", "Maria Gonzalez",
  "Daniel Brown", "Sophie Taylor", "Ryan Anderson", "Nisha Thapa", "Kevin White", "Rachel Green",
  "Andrew Clark", "Priyanka Shrestha", "Matthew Hall", "Olivia Baker", "Brian Nelson", "Grace Kim",
  "Justin Carter", "Hannah Mitchell", "Tyler Roberts", "Sunita Adhikari", "Nathan Turner", "Chloe Phillips",
  "Aaron Campbell", "Isabella Parker", "Jason Evans", "Rajesh Poudel", "Eric Edwards", "Natalie Collins",
  "Brandon Stewart", "Megan Morris", "Jonathan Rogers", "Kabita Karki", "Adam Reed", "Samantha Cook",
  "Scott Bailey", "Victoria Cooper", "Gary Richardson", "Bikash Lama", "Patrick Ward", "Amanda Torres",
  "Sean Peterson", "Diane Gray",
];

const REVIEWER_NAMES = [
  "Alex Johnson", "Emma Wilson", "Liam Patel", "Olivia Brown", "Noah Martinez", "Ava Kumar",
  "Ethan Davis", "Sophia Lee", "Mason Rodriguez", "Isabella Nguyen", "William Garcia", "Mia Thompson",
  "James Anderson", "Charlotte Moore", "Benjamin Clark", "Amelia Singh", "Lucas Walker", "Harper Hall",
  "Henry Young", "Evelyn Adams", "Alexander King", "Abigail Scott", "Owen Baker", "Emily Reed",
  "Jack Bennett", "Ella Cooper", "Luke Foster", "Grace Bell", "Gabriel Ross", "Chloe Murphy",
];

// Slot-filled, not identical across all reviews - {place} substituted per
// review so text reads specific to the business, not generic filler.
export const REVIEW_TEMPLATES: Record<5 | 4 | 3 | 2, string[]> = {
  5: [
    "Absolutely loved {place}. Everything about the experience felt thoughtful, from start to finish. Already planning my next visit.",
    "One of the best experiences I've had in a while. {place} clearly cares about getting the details right.",
    "Can't recommend {place} enough - friendly staff, great atmosphere, and genuinely worth the visit.",
    "Went in with average expectations and left really impressed. {place} exceeded what I was hoping for.",
    "This has become my go-to. {place} is consistent every single time, which says a lot.",
    "Exceptional from the moment I walked in. {place} deserves every bit of its reputation.",
    "I've told at least five friends about {place} already. Just a genuinely great find.",
    "Everything felt personal and well cared for at {place}. Will definitely be back soon.",
    "Top-tier experience. {place} nailed both the quality and the service side of things.",
    "Honestly can't find a single complaint. {place} was fantastic from start to finish.",
  ],
  4: [
    "Really solid experience at {place}. A couple of minor things could be better, but overall very happy.",
    "{place} was great - friendly service and good quality. Would visit again without hesitation.",
    "Enjoyed my time at {place}. Nothing life-changing, but consistently good and reliable.",
    "Good experience overall at {place}, just wish a couple of small things were a bit more polished.",
    "{place} delivered on what it promised. Solid choice if you're in the area.",
    "Would recommend {place} to a friend - reliable, friendly, and a fair price for what you get.",
    "Pleasantly surprised by {place}. Not perfect, but definitely above average.",
    "Good visit at {place} overall - staff were attentive and the experience felt worth it.",
  ],
  3: [
    "{place} was fine - nothing wrong exactly, but nothing that stood out either.",
    "An average experience at {place}. Might go back, might not, depends what else is nearby.",
    "{place} met basic expectations but didn't do much beyond that.",
    "Decent enough visit to {place}, though I've had better experiences elsewhere for a similar price.",
    "Mixed feelings about {place} - some parts were good, others felt a bit rushed.",
    "It was okay. {place} isn't bad, just didn't leave much of an impression either way.",
  ],
  2: [
    "Disappointing visit to {place}. Expected more based on what I'd heard beforehand.",
    "{place} has potential but a few things need real attention before I'd go back.",
    "Not a great experience at {place} this time - service felt inattentive throughout.",
    "Wanted to like {place} more than I did. A few issues that shouldn't have happened.",
    "{place} fell short of expectations. Might give it one more chance, but not convinced yet.",
  ],
};

export const REPLY_TEMPLATES: Record<"positive" | "neutral" | "negative", string[]> = {
  positive: [
    "Thank you so much for the kind words - it means a lot to the whole team! Hope to see you again soon.",
    "We're thrilled you had a great experience! Thanks for taking the time to share this.",
    "This made our day - thank you! Looking forward to welcoming you back.",
    "Really appreciate this review. Comments like yours are exactly why we do what we do.",
    "So glad it was a great visit! Thanks again for your support.",
    "Thank you for the wonderful feedback - see you next time!",
  ],
  neutral: [
    "Thanks for the honest feedback - we're always looking for ways to improve and will keep this in mind.",
    "We appreciate you taking the time to share this. Hope we can earn a five-star visit next time!",
    "Thank you for the review - we're working on the details you mentioned.",
    "Really value this feedback. Hope to give you a better experience on your next visit.",
    "Thanks for stopping by and for the honest review - noted for the team.",
  ],
  negative: [
    "We're sorry to hear this - this isn't the experience we aim for. Please reach out directly so we can make it right.",
    "Thank you for flagging this, and apologies for falling short. We're addressing this with the team.",
    "We're genuinely sorry about this experience. We'd love the chance to make it up to you.",
    "This isn't the standard we hold ourselves to, and we apologize. We're taking steps to fix this.",
    "Sorry to disappoint - we take this seriously and are already looking into what went wrong.",
  ],
};

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Avoids two reviews (or two replies) on the SAME place drawing the exact
// same template text - a real risk with only 4-5 draws per place from
// smallish per-tier pools (~6-10 entries). Falls back to the full pool only
// if every entry in it has already been used for this place.
export function pickUnused<T>(arr: T[], used: Set<T>): T {
  const available = arr.filter((item) => !used.has(item));
  const choice = pick(available.length > 0 ? available : arr);
  used.add(choice);
  return choice;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function jitter(base: number, maxDeltaDeg: number): number {
  return base + (Math.random() * 2 - 1) * maxDeltaDeg;
}

export function weightedRating(): 5 | 4 | 3 | 2 {
  const r = Math.random();
  if (r < 0.4) return 5;
  if (r < 0.75) return 4;
  if (r < 0.9) return 3;
  return 2;
}

export function replyToneFor(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

// Category -> a single, high-volume Flickr tag. Picsum Photos' /id/{n}
// endpoint (the original source here) returns arbitrary stock photos with
// zero category awareness - a cafe could end up with a photo of a mountain.
// LoremFlickr (loremflickr.com) instead serves real, hotlinkable photos
// matched against a Flickr tag, so a place's photos actually depict its own
// business type. Deliberately ONE common tag, not an AND-combination of two
// (e.g. "cafe,coffeeshop/all") - LoremFlickr resolves each new lock value
// with a live Flickr search, and requiring two tags to both match narrows
// that search enough to be noticeably slower/flakier, which showed up as
// images intermittently failing to load. A single popular tag has a pool of
// thousands, so it resolves fast and reliably, and is still plenty large
// for a handful of same-category places to land on different photos.
export const CATEGORY_PHOTO_KEYWORDS: Record<string, string> = {
  Restaurants: "restaurant",
  Cafés: "cafe",
  Hotels: "hotel",
  Fitness: "gym",
  Shopping: "boutique",
  Healthcare: "clinic",
  Education: "classroom",
  "Beauty & Wellness": "spa",
  Entertainment: "cinema",
  "Professional Services": "office",
  Bar: "bar",
  "Housing & Apartments": "apartment",
};

// `lock` picks one deterministic photo out of the keyword's pool - same
// index always gets the same photo (stable across reloads/re-runs), and
// distinct indices land on different photos. index is the place's 0-based
// creation order (unique per place, same value used for both the fresh
// seeder below and fixSeedPhotoCategories.ts's backfill of already-seeded
// places, so re-seeding from scratch reproduces identical URLs).
export function photoUrlsFor(categoryLabel: string, index: number): { coverPhotoUrl: string; profilePicture: string } {
  const keyword = CATEGORY_PHOTO_KEYWORDS[categoryLabel] ?? "storefront";
  return {
    coverPhotoUrl: `https://loremflickr.com/800/500/${keyword}?lock=${1000 + index}`,
    profilePicture: `https://loremflickr.com/300/300/${keyword}?lock=${2000 + index}`,
  };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type PlaceSpec = {
  label: string;
  categoryLabel: string;
  city: City;
};

function buildPlaceSpecs(): PlaceSpec[] {
  const specs: PlaceSpec[] = [];
  let cityIndex = 0;
  for (const [categoryLabel, names] of Object.entries(CATEGORY_PLACES)) {
    for (const label of names) {
      specs.push({ label, categoryLabel, city: CITIES[cityIndex % CITIES.length] });
      cityIndex++;
    }
  }
  return specs;
}

async function main() {
  await Database.sequelize.authenticate();
  console.log("Connected to database.");

  const specs = buildPlaceSpecs();
  console.log(`Seeding ${specs.length} places across ${Object.keys(CATEGORY_PLACES).length} categories...`);

  const categories = await Category.findAll({ raw: true });
  const categoryIdByLabel = new Map(categories.map((c: any) => [c.label, c.id]));
  for (const spec of specs) {
    if (!categoryIdByLabel.has(spec.categoryLabel)) {
      throw new Error(`Category "${spec.categoryLabel}" not found in DB - run db:seed first.`);
    }
  }

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, parseInt(process.env.PASSWORD_HASH_CONSTANT!));

  // Reviewer pool created once, shared across all 50 places (a reviewer can
  // review many different places, just never the same place twice - see
  // the shuffle-and-slice below, which guarantees per-place distinctness).
  console.log(`Creating ${REVIEWER_NAMES.length} reviewer accounts...`);
  const reviewers = [];
  for (let i = 0; i < REVIEWER_NAMES.length; i++) {
    const reviewer = await User.create({
      fullName: REVIEWER_NAMES[i],
      email: `reviewer${i + 1}@${TEST_EMAIL_DOMAIN}`,
      passwordHash,
      userType: UserTypeEnum.REGULAR,
    } as any);
    reviewers.push(reviewer);
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    emailDomain: TEST_EMAIL_DOMAIN,
    testPassword: TEST_PASSWORD,
    reviewerIds: reviewers.map((r: any) => r.id),
    ownerIds: [] as number[],
    placeIds: [] as number[],
    reviewIds: [] as number[],
    replyIds: [] as number[],
  };

  const placesSummary: any[] = [];

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const owner = await User.create({
      fullName: OWNER_NAMES[i % OWNER_NAMES.length],
      email: `owner${i + 1}@${TEST_EMAIL_DOMAIN}`,
      passwordHash,
      userType: UserTypeEnum.BUSINESS,
    } as any);
    manifest.ownerIds.push((owner as any).id);

    const city = spec.city;
    const descriptionTemplate = pick(CATEGORY_DESCRIPTIONS[spec.categoryLabel]);
    const { coverPhotoUrl, profilePicture } = photoUrlsFor(spec.categoryLabel, i);

    const place = await Place.create({
      ownerId: (owner as any).id,
      label: spec.label,
      description: descriptionTemplate.replace("{name}", spec.label),
      address: `${randInt(10, 999)} ${pick(city.streets)}, ${city.name}, ${city.region}`,
      phone: `${city.phonePrefix} ${randInt(200, 999)} ${randInt(1000, 9999)}`,
      website: `https://www.${slugify(spec.label)}.example.com`,
      categoryId: categoryIdByLabel.get(spec.categoryLabel),
      latitude: jitter(city.lat, 0.06),
      longitude: jitter(city.lng, 0.06),
      priceRange: pick([PriceRangeEnum.LOW, PriceRangeEnum.MEDIUM, PriceRangeEnum.HIGH]),
      isVerified: Math.random() < 0.3,
      coverPhotoUrl,
      profilePicture,
    } as any);
    manifest.placeIds.push((place as any).id);

    const reviewCount = randInt(4, 5);
    const reviewers4Place = shuffle(reviewers).slice(0, reviewCount);
    let ratingSum = 0;
    // Per-place only - a different place reusing the same template line is
    // fine (a real review site has plenty of similar-sounding reviews across
    // different businesses); it's two reviews on the SAME place reading
    // identically that would look obviously fake.
    const usedReviewTexts = new Set<string>();
    const usedReplyTexts = new Set<string>();

    for (const reviewer of reviewers4Place) {
      const rating = weightedRating();
      ratingSum += rating;
      const review = await Review.create({
        review: pickUnused(REVIEW_TEMPLATES[rating], usedReviewTexts).replace("{place}", spec.label),
        rating,
        placeId: (place as any).id,
        reviewerId: (reviewer as any).id,
        helpfulCount: randInt(0, 20),
      } as any);
      manifest.reviewIds.push((review as any).id);

      const reply = await ReviewReply.create({
        description: pickUnused(REPLY_TEMPLATES[replyToneFor(rating)], usedReplyTexts),
        reviewId: (review as any).id,
        ownerId: (owner as any).id,
      } as any);
      manifest.replyIds.push((reply as any).id);
    }

    await Place.update(
      { averageRating: Math.round((ratingSum / reviewCount) * 10) / 10, reviewCount },
      { where: { id: (place as any).id } }
    );

    placesSummary.push({
      id: (place as any).id,
      label: spec.label,
      category: spec.categoryLabel,
      city: city.name,
      reviews: reviewCount,
      ownerEmail: `owner${i + 1}@${TEST_EMAIL_DOMAIN}`,
    });

    if ((i + 1) % 10 === 0) console.log(`  ...${i + 1}/${specs.length} places done`);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written to ${MANIFEST_PATH}`);

  writeTestingMd(placesSummary, manifest);
  console.log(`testing.md written to ${TESTING_MD_PATH}`);

  console.log("\nDone:");
  console.log(`  ${manifest.placeIds.length} places`);
  console.log(`  ${manifest.ownerIds.length} business owners + ${manifest.reviewerIds.length} reviewers`);
  console.log(`  ${manifest.reviewIds.length} reviews + ${manifest.replyIds.length} owner replies`);

  await Database.sequelize.close();
}

function writeTestingMd(placesSummary: any[], manifest: any) {
  const byCategory = new Map<string, number>();
  const byCity = new Map<string, number>();
  for (const p of placesSummary) {
    byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);
    byCity.set(p.city, (byCity.get(p.city) ?? 0) + 1);
  }

  const lines: string[] = [];
  lines.push("# Testing Data Seed");
  lines.push("");
  lines.push(`Generated ${manifest.createdAt} by \`backend/scripts/seedTestingData.ts\`, for exercising the app against a` );
  lines.push("realistic-sized dataset (Discover/map browsing, place detail, business console, reviews/replies) rather than");
  lines.push("the handful of places that existed before. **This is disposable test fixture data** - see \"How to revert\"");
  lines.push("below when you're done with it.");
  lines.push("");
  lines.push("## What was created");
  lines.push("");
  lines.push(`- **${manifest.placeIds.length} places** across all ${byCategory.size} real categories, ${byCity.size} real cities`);
  lines.push(`  (jittered coordinates near each city center, so Discover's map view has something to show).`);
  lines.push(`- **${manifest.ownerIds.length} BUSINESS accounts** (one owner per place, 1:1 - this app has no multi-place`);
  lines.push(`  ownership) + **${manifest.reviewerIds.length} REGULAR reviewer accounts** (shared across places, same as`);
  lines.push(`  real users reviewing many different businesses).`);
  lines.push(`- **${manifest.reviewIds.length} reviews** (4-5 per place, weighted toward positive: ~40% 5-star, 35% 4-star,`);
  lines.push(`  15% 3-star, 10% 2-star) with **${manifest.replyIds.length} owner replies**, one per review.`);
  lines.push(`- Every place has a **cover photo and a profile picture matched to its own category** (e.g. restaurants`);
  lines.push(`  get restaurant/diner photos, gyms get gym/fitness photos, apartments get apartment-building photos) -`);
  lines.push(`  real, hotlinked photos from [LoremFlickr](https://loremflickr.com), each pinned to a stable per-place`);
  lines.push(`  \`lock\` value so reloads don't re-randomize them.`);
  lines.push(`- Each place's \`averageRating\`/\`reviewCount\` were recomputed from its actual seeded reviews (matching`);
  lines.push(`  how the real app keeps these in sync), so ratings shown in the UI are accurate, not placeholders.`);
  lines.push("");
  lines.push("### Places per category");
  lines.push("");
  for (const [cat, count] of byCategory) lines.push(`- ${cat}: ${count}`);
  lines.push("");
  lines.push("### Places per city");
  lines.push("");
  for (const [city, count] of byCity) lines.push(`- ${city}: ${count}`);
  lines.push("");
  lines.push("## Logging in as seeded accounts");
  lines.push("");
  lines.push(`All seeded accounts share one password: \`${manifest.testPassword}\``);
  lines.push("");
  lines.push(`- Business owners: \`owner1@${manifest.emailDomain}\` through \`owner${manifest.ownerIds.length}@${manifest.emailDomain}\``);
  lines.push(`  (owner*N*'s email corresponds to the *N*th place in the table below, in creation order).`);
  lines.push(`- Reviewers: \`reviewer1@${manifest.emailDomain}\` through \`reviewer${manifest.reviewerIds.length}@${manifest.emailDomain}\``);
  lines.push("");
  lines.push("## Full place list");
  lines.push("");
  lines.push("| # | Place | Category | City | Reviews | Owner login |");
  lines.push("|---|---|---|---|---|---|");
  placesSummary.forEach((p, i) => {
    lines.push(`| ${i + 1} | ${p.label} (id ${p.id}) | ${p.category} | ${p.city} | ${p.reviews} | ${p.ownerEmail} |`);
  });
  lines.push("");
  lines.push("## How to revert this");
  lines.push("");
  lines.push("Everything created here is self-contained and identifiable purely by the fake email domain");
  lines.push(`\`${manifest.emailDomain}\` - no real user, place, or review is touched. From \`backend/\`, run:`);
  lines.push("");
  lines.push("```bash");
  lines.push("npx ts-node --transpile-only scripts/unseedTestingData.ts");
  lines.push("```");
  lines.push("");
  lines.push("This hard-deletes (not soft-delete) every reply, review, place, and user this script created, in FK-safe");
  lines.push(`order, using both \`backend/scripts/seed-manifest.json\` (the exact IDs, written alongside this file) and a`);
  lines.push(`fallback \`WHERE email LIKE '%@${manifest.emailDomain}'\` sweep in case the manifest is missing. After it`);
  lines.push("runs, delete this file and `backend/scripts/seed-manifest.json` too - nothing else in the codebase");
  lines.push("references either.");
  lines.push("");
}

// Guarded so reshapeTestingDataMonths.ts can import this file's shared
// templates/helpers without re-triggering a full re-seed as a side effect.
if (require.main === module) {
  main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
