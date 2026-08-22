# Testing Data Seed

Generated 2026-08-22T12:25:55.030Z by `backend/scripts/seedTestingData.ts`, for exercising the app against a
realistic-sized dataset (Discover/map browsing, place detail, business console, reviews/replies) rather than
the handful of places that existed before. **This is disposable test fixture data** - see "How to revert"
below when you're done with it.

## What was created

- **50 places** across all 12 real categories, 5 real cities
  (jittered coordinates near each city center, so Discover's map view has something to show).
- **50 BUSINESS accounts** (one owner per place, 1:1 - this app has no multi-place
  ownership) + **30 REGULAR reviewer accounts** (shared across places, same as
  real users reviewing many different businesses).
- **223 reviews** (4-5 per place, weighted toward positive: ~40% 5-star, 35% 4-star,
  15% 3-star, 10% 2-star) with **223 owner replies**, one per review.
- Every place has a **cover photo and a profile picture**, both real (hotlinked) photos from
  [Picsum Photos](https://picsum.photos) via its stable `/id/{n}` endpoint - 100 distinct photo IDs used
  (50 cover + 50 profile), none repeated.
- Each place's `averageRating`/`reviewCount` were recomputed from its actual seeded reviews (matching
  how the real app keeps these in sync), so ratings shown in the UI are accurate, not placeholders.

### Places per category

- Restaurants: 5
- Cafés: 4
- Hotels: 4
- Fitness: 4
- Shopping: 4
- Healthcare: 4
- Education: 4
- Beauty & Wellness: 4
- Entertainment: 5
- Professional Services: 4
- Bar: 4
- Housing & Apartments: 4

### Places per city

- Kathmandu: 10
- New York: 10
- London: 10
- Toronto: 10
- Sydney: 10

## Logging in as seeded accounts

All seeded accounts share one password: `TestPass123!`

- Business owners: `owner1@rmp-seed-test.local` through `owner50@rmp-seed-test.local`
  (owner*N*'s email corresponds to the *N*th place in the table below, in creation order).
- Reviewers: `reviewer1@rmp-seed-test.local` through `reviewer30@rmp-seed-test.local`

## Full place list

| # | Place | Category | City | Reviews | Owner login |
|---|---|---|---|---|---|
| 1 | Copper Kettle Bistro (id 2238) | Restaurants | Kathmandu | 4 | owner1@rmp-seed-test.local |
| 2 | Firehouse Grill & Tap (id 2239) | Restaurants | New York | 4 | owner2@rmp-seed-test.local |
| 3 | Blue Lotus Thai Kitchen (id 2240) | Restaurants | London | 4 | owner3@rmp-seed-test.local |
| 4 | Momo Junction (id 2241) | Restaurants | Toronto | 5 | owner4@rmp-seed-test.local |
| 5 | Harborside Seafood Co. (id 2242) | Restaurants | Sydney | 4 | owner5@rmp-seed-test.local |
| 6 | The Roasted Bean (id 2243) | Cafés | Kathmandu | 5 | owner6@rmp-seed-test.local |
| 7 | Cloud Nine Coffee House (id 2244) | Cafés | New York | 4 | owner7@rmp-seed-test.local |
| 8 | Willow & Whisk Café (id 2245) | Cafés | London | 5 | owner8@rmp-seed-test.local |
| 9 | Sunrise Espresso Bar (id 2246) | Cafés | Toronto | 4 | owner9@rmp-seed-test.local |
| 10 | Grandview Suites (id 2247) | Hotels | Sydney | 5 | owner10@rmp-seed-test.local |
| 11 | Riverside Boutique Hotel (id 2248) | Hotels | Kathmandu | 4 | owner11@rmp-seed-test.local |
| 12 | The Maple Inn (id 2249) | Hotels | New York | 5 | owner12@rmp-seed-test.local |
| 13 | Skyline Grand Hotel (id 2250) | Hotels | London | 4 | owner13@rmp-seed-test.local |
| 14 | IronCore Fitness Studio (id 2251) | Fitness | Toronto | 5 | owner14@rmp-seed-test.local |
| 15 | Pulse CrossFit Box (id 2252) | Fitness | Sydney | 5 | owner15@rmp-seed-test.local |
| 16 | Zenith Yoga & Wellness (id 2253) | Fitness | Kathmandu | 5 | owner16@rmp-seed-test.local |
| 17 | PeakForm Gym (id 2254) | Fitness | New York | 5 | owner17@rmp-seed-test.local |
| 18 | Meridian Boutique (id 2255) | Shopping | London | 4 | owner18@rmp-seed-test.local |
| 19 | Thread & Needle Fashion House (id 2256) | Shopping | Toronto | 4 | owner19@rmp-seed-test.local |
| 20 | Northgate Electronics (id 2257) | Shopping | Sydney | 5 | owner20@rmp-seed-test.local |
| 21 | The Vintage Trunk (id 2258) | Shopping | Kathmandu | 5 | owner21@rmp-seed-test.local |
| 22 | Sunrise Family Clinic (id 2259) | Healthcare | New York | 5 | owner22@rmp-seed-test.local |
| 23 | CarePoint Medical Center (id 2260) | Healthcare | London | 5 | owner23@rmp-seed-test.local |
| 24 | Bright Smile Dental Studio (id 2261) | Healthcare | Toronto | 4 | owner24@rmp-seed-test.local |
| 25 | Riverside Physiotherapy (id 2262) | Healthcare | Sydney | 4 | owner25@rmp-seed-test.local |
| 26 | Everest Coding Academy (id 2263) | Education | Kathmandu | 4 | owner26@rmp-seed-test.local |
| 27 | Bright Minds Tutoring Center (id 2264) | Education | New York | 5 | owner27@rmp-seed-test.local |
| 28 | Global Language Institute (id 2265) | Education | London | 5 | owner28@rmp-seed-test.local |
| 29 | Little Learners Preschool (id 2266) | Education | Toronto | 4 | owner29@rmp-seed-test.local |
| 30 | Serenity Spa & Salon (id 2267) | Beauty & Wellness | Sydney | 5 | owner30@rmp-seed-test.local |
| 31 | Glow Up Beauty Bar (id 2268) | Beauty & Wellness | Kathmandu | 4 | owner31@rmp-seed-test.local |
| 32 | Tranquil Touch Massage Studio (id 2269) | Beauty & Wellness | New York | 4 | owner32@rmp-seed-test.local |
| 33 | The Nail Lounge (id 2270) | Beauty & Wellness | London | 5 | owner33@rmp-seed-test.local |
| 34 | Starlight Cinema (id 2271) | Entertainment | Toronto | 4 | owner34@rmp-seed-test.local |
| 35 | Neon Arcade Zone (id 2272) | Entertainment | Sydney | 5 | owner35@rmp-seed-test.local |
| 36 | Rhythm Live Music Hall (id 2273) | Entertainment | Kathmandu | 5 | owner36@rmp-seed-test.local |
| 37 | Puzzle Room Escape Games (id 2274) | Entertainment | New York | 4 | owner37@rmp-seed-test.local |
| 38 | Funland Bowling Alley (id 2275) | Entertainment | London | 4 | owner38@rmp-seed-test.local |
| 39 | Sterling Legal Associates (id 2276) | Professional Services | Toronto | 5 | owner39@rmp-seed-test.local |
| 40 | Apex Accounting Group (id 2277) | Professional Services | Sydney | 4 | owner40@rmp-seed-test.local |
| 41 | Bright Path Consulting (id 2278) | Professional Services | Kathmandu | 4 | owner41@rmp-seed-test.local |
| 42 | Precision Print & Design (id 2279) | Professional Services | New York | 4 | owner42@rmp-seed-test.local |
| 43 | The Rusty Anchor Pub (id 2280) | Bar | London | 5 | owner43@rmp-seed-test.local |
| 44 | Copperhead Brewing Co. (id 2281) | Bar | Toronto | 4 | owner44@rmp-seed-test.local |
| 45 | Velvet Lounge Cocktail Bar (id 2282) | Bar | Sydney | 4 | owner45@rmp-seed-test.local |
| 46 | The Local Tap House (id 2283) | Bar | Kathmandu | 4 | owner46@rmp-seed-test.local |
| 47 | Willowbrook Apartments (id 2284) | Housing & Apartments | New York | 4 | owner47@rmp-seed-test.local |
| 48 | Maple Ridge Residences (id 2285) | Housing & Apartments | London | 5 | owner48@rmp-seed-test.local |
| 49 | The Harbor Lofts (id 2286) | Housing & Apartments | Toronto | 5 | owner49@rmp-seed-test.local |
| 50 | Cedar Grove Housing (id 2287) | Housing & Apartments | Sydney | 4 | owner50@rmp-seed-test.local |

## How to revert this

Everything created here is self-contained and identifiable purely by the fake email domain
`rmp-seed-test.local` - no real user, place, or review is touched. From `backend/`, run:

```bash
npx ts-node --transpile-only scripts/unseedTestingData.ts
```

This hard-deletes (not soft-delete) every reply, review, place, and user this script created, in FK-safe
order, using both `backend/scripts/seed-manifest.json` (the exact IDs, written alongside this file) and a
fallback `WHERE email LIKE '%@rmp-seed-test.local'` sweep in case the manifest is missing. After it
runs, delete this file and `backend/scripts/seed-manifest.json` too - nothing else in the codebase
references either.

## Month spread + dashboard boost (reshapeTestingDataMonths.ts)

Ran after the initial seed to make Business Dashboard KPIs/charts show real month-over-month variation instead
of everything dated the same day:

- Every seeded review/reply's `createdAt` was backdated across the past 12 months (weighted toward the current
  month - a growth curve, not a flat spread), so the Rating Trend / Review Volume charts and every trend delta
  (Reputation Score, Average Rating, Review Count, Response Rate) now show real movement on every business
  account, not just the one below.
- **undefined**'s place ("Everest Coding Academy") was topped up to **30 reviews** (using
  previously-unused reviewers from the same 30-person pool) specifically so its own dashboard has enough volume
  to look genuinely full across every KPI and section. Its 2 most-recent reviews were left unreplied on
  purpose, so "Awaiting Reply" has something real to show on this account too.

## Category-matched photos (fixSeedPhotoCategories.ts)

Ran after the initial seed to fix a real bug: the original cover photos/profile pictures came from Picsum
Photos' `/id/{n}` endpoint, which returns arbitrary stock photos with no relationship to a place's actual
category (a cafe could get a photo of a mountain). All 50 places' photos were replaced with category-matched
photos from [LoremFlickr](https://loremflickr.com) instead (e.g. restaurants get restaurant photos, gyms get
gym photos, apartments get apartment photos), each pinned to a stable per-place `lock` value so reloads don't
re-randomize them.

A first pass used two AND-combined tags per category (e.g. "cafe,coffeeshop"), which some places showed as
broken images for - LoremFlickr resolves each new `lock` value with a live Flickr search, and requiring two
tags to both match narrowed that search enough to be slow/flaky. Switched to one high-volume tag per category
(still plenty large for a handful of same-category places to land on different photos) and re-ran the
backfill, which fixed it.
