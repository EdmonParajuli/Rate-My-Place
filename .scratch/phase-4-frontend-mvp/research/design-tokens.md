# Design tokens — extracted from the Figma Make source

Source: `get_design_context` on the Figma Make file
`https://www.figma.com/make/uecnUKqT4CI7LuIpWo50Pp/Rate-My-Business-UI-UX-Design`
(fileKey `uecnUKqT4CI7LuIpWo50Pp`, nodeId `0:1`), which returns the file's **actual
generated source** (not a screenshot to eyeball) — a Vite + React + Tailwind v4 +
shadcn/ui app. Every value below is quoted or line-cited from that source; nothing
here is read off a screenshot.

**Caveat surfaced while pulling this**: the fetched source's `Screen` union type is
`"discover" | "categories" | "category-detail" | "my-reviews" | "saved" |
"notifications" | "profile" | "settings"` — the authenticated "core app" only. No
marketing/landing, login/signup, or place-detail screen exists in this particular
source tree. Per `01-vision-and-scope.md`, the Figma Make project has two versions
("Version 1" = this app, "Version 2" = marketing + dashboards) — the marketing
landing page ticket and auth screens ticket will likely need a different fetch (a
different node, or the file may not expose Version 2 source the same way). Flagging
for whoever picks up those tickets rather than guessing here.

## Stack facts worth knowing (from `package.json`)

Cross-validates `05-frontend-plan.md`'s stack picks — these are what the actual
design file was built with, not just recommendations derived independently:

- **Tailwind v4** (`4.1.12`, `@tailwindcss/vite`) — CSS-first config via `@theme
  inline` in `theme.css` (see below), not a `tailwind.config.js`. Vite plugin, not
  PostCSS-only.
- **react-router 7.13.0** — matches doc 5's React Router recommendation.
- **react-hook-form 7.55.0** — matches doc 5's React Hook Form recommendation.
- **recharts 2.15.2** — matches doc 5's Recharts recommendation.
- **lucide-react** — icon set used throughout (`Star`, `Search`, `MapPin`,
  `TrendingUp`, `Bookmark`, `Heart`, etc.) — doc 5 didn't pick an icon library;
  this is a reasonable default to adopt for consistency with the source design.
- **embla-carousel-react** — powers the carousels (recent-reviews, testimonials).
- **next-themes** — dark-mode toggling; relevant later for Phase 7's "dark mode as
  a real theme" item, not Phase 4.
- `@mui/material`/`@emotion` are also listed but appear to be unused Figma Make
  template boilerplate — no MUI usage found in the screens read. Don't take this as
  a real recommendation to add MUI.

## Colors

Full CSS custom-property set from `src/styles/theme.css` (`:root` = light,
`.dark` = dark). This is the **default shadcn/ui theme** — a light UI with a blue
primary — not a globally-dark app shell. The "dark-gradient" look the design docs
describe is achieved with one-off gradient utility classes on specific sections
(hero banners), not a dark theme swap. Both matter: use the light tokens below for
the app chrome, and the hero gradient (next section) for hero sections specifically.

| Token | Light value | Dark value |
|---|---|---|
| `--background` | `#F8FAFC` | `oklch(0.145 0 0)` (near-black) |
| `--foreground` | `#0F172A` | `oklch(0.985 0 0)` (near-white) |
| `--card` | `#ffffff` | `oklch(0.145 0 0)` |
| `--primary` | `#2563EB` (blue) | `oklch(0.985 0 0)` |
| `--primary-foreground` | `#ffffff` | `oklch(0.205 0 0)` |
| `--secondary` | `#EFF6FF` | `oklch(0.269 0 0)` |
| `--accent` | `#F59E0B` (amber) | `oklch(0.269 0 0)` |
| `--destructive` | `#EF4444` (red) | `oklch(0.396 0.141 25.723)` |
| `--muted` | `#E2E8F0` | `oklch(0.269 0 0)` |
| `--muted-foreground` | `#64748B` | `oklch(0.708 0 0)` |
| `--border` | `rgba(15,23,42,0.08)` | `oklch(0.269 0 0)` |
| `--switch-background` (unchecked) | `#CBD5E1` | `oklch` via `--input` |
| `--ring` | `#2563EB` | `oklch(0.439 0 0)` |
| `--chart-1..5` | `#2563EB #F59E0B #10B981 #8B5CF6 #EC4899` | oklch equivalents |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `--sidebar-primary` | `#030213` | `oklch(0.488 0.243 264.376)` |

Full variable list (border/input/popover/etc.) is in the theme.css dump this file's
findings are based on — copy directly into `frontend`'s token source rather than
retyping, to avoid transcription drift.

### Hero gradient (the "dark-gradient" look)

Exact, from `App.tsx` line 460-461 (a "Browse by Interest" hero section):

```css
/* base */
bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900

/* overlay, inline style */
background-image: radial-gradient(circle at 30% 50%, #F59E0B, transparent 50%),
                   radial-gradient(circle at 70% 30%, #2563EB, transparent 40%);
opacity: 0.2;
```

I.e.: a diagonal near-black→navy→near-black base (`slate-900`/`blue-950`), with two
soft radial accent blooms at 20% opacity using the same primary (`#2563EB`) and
accent (`#F59E0B`) colors as the rest of the palette — not arbitrary new hues.

### Category accent colors (10 categories, exact — `App.tsx` lines 49-58)

Each category has its own two-stop gradient + light background + icon color. This is
the literal source data array, directly usable:

| Category | Gradient | Background | Icon color |
|---|---|---|---|
| Restaurants | `from-orange-400 to-rose-500` | `bg-orange-50` | `text-orange-500` |
| Cafés | `from-amber-400 to-orange-500` | `bg-amber-50` | `text-amber-600` |
| Hotels | `from-sky-400 to-blue-600` | `bg-sky-50` | `text-sky-500` |
| Shopping | `from-violet-400 to-purple-600` | `bg-violet-50` | `text-violet-500` |
| Healthcare | `from-emerald-400 to-teal-600` | `bg-emerald-50` | `text-emerald-500` |
| Education | `from-blue-400 to-indigo-600` | `bg-blue-50` | `text-blue-500` |
| Fitness | `from-red-400 to-rose-600` | `bg-red-50` | `text-red-500` |
| Beauty & Wellness | `from-pink-400 to-rose-500` | `bg-pink-50` | `text-pink-500` |
| Entertainment | `from-yellow-400 to-amber-600` | `bg-yellow-50` | `text-yellow-600` |
| Professional Services | `from-slate-400 to-slate-600` | `bg-slate-50` | `text-slate-500` |

These 10 names/colors match doc 1's "10 categories" claim exactly — worth using as
the actual seed data for the `providers_category` table if it isn't already.

## Typography

`src/styles/fonts.css`:

```css
@import url('...family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
```

Two font families loaded: **Plus Jakarta Sans** (400/500/600/700/800) and
**Manrope** (400/500/600/700). Confirmed exact: the main content wrapper sets
`style={{ fontFamily: "'Manrope', sans-serif" }}` explicitly (`App.tsx` line 458) —
Manrope is the body font. Plus Jakarta Sans's specific role (likely display/heading,
given the wider weight range up to 800) isn't pinned down by a similarly explicit
usage in the code read so far — reasonable default, not fully confirmed.

Base `html { font-size: var(--font-size) }` = `16px`. Heading sizes come from
Tailwind's default type scale (`--text-2xl`/`--text-xl`/etc. referenced in
`theme.css`'s `@layer base`), not custom values.

## Spacing / radius

`--radius: 0.75rem` (12px) is the single source value; everything else derives from
it in `theme.css`'s `@theme inline` block:

```css
--radius-sm: calc(var(--radius) - 4px);  /* 8px */
--radius-md: calc(var(--radius) - 2px);  /* 10px */
--radius-lg: var(--radius);              /* 12px */
--radius-xl: calc(var(--radius) + 4px);  /* 16px */
```

Actual usage frequency across the app (`App.tsx`, class-name grep): `rounded-xl`
(34×) and `rounded-2xl` (32×) dominate — cards and hero/section containers lean
toward the larger end (`2xl` ≈ 16px+, beyond even `--radius-xl`, so some elements use
literal Tailwind `rounded-2xl` rather than the semantic radius scale). `rounded-full`
(21×, avatars/pills/icons) and `rounded-lg` (16×, smaller elements) round out the set.

## Shadows

`shadow-sm` is by far the most common (22×) — the default resting elevation for
cards. `shadow-md`/`shadow-lg` (5×/4×) appear on emphasized elements (modals,
hover states). One custom, non-default class `shadow-blue` appears twice — likely a
colored shadow for a primary CTA button; its exact box-shadow value wasn't resolved
in this pass (not present in the theme.css / tailwind.css / component files read) —
worth a targeted look if a primary-button prototype needs it exactly.

## Component primitives confirmed as stock shadcn/ui (not custom-styled)

Read directly, not inferred:

- **Card** (`card.tsx`): `rounded-xl border`, `bg-card`/`text-card-foreground`. Base
  primitive is the smaller `xl` radius even though many hand-built card-like
  elements elsewhere use `2xl` — treat business-card/review-card as custom
  compositions, not the raw `<Card>` primitive, when radius matters.
- **Badge** (`badge.tsx`): `rounded-md`, `px-2 py-0.5`, `text-xs font-medium`, 4
  variants (`default`/`secondary`/`destructive`/`outline`) via `class-variance-
  authority`. Business-card badges ("Top Rated", price range) weren't traced to
  confirm whether they reuse this primitive or are bespoke `<span>`s — resolve
  per-screen in the relevant prototype ticket, don't assume.
- **Switch** (`switch.tsx`): checked → `bg-primary`; unchecked → `bg-switch-
  background` (`#CBD5E1` light); thumb is `bg-card`, `size-4`, `rounded-full`.
- **Sidebar** (`sidebar.tsx`): the app uses shadcn/ui's full `Sidebar` primitive
  set, not a hand-rolled nav. `SIDEBAR_WIDTH = 16rem` expanded, `SIDEBAR_WIDTH_ICON
  = 3rem` collapsed, `SIDEBAR_WIDTH_MOBILE = 18rem` (renders as a `Sheet` on
  mobile). Directly reusable for the "Authenticated shell layout" ticket — no need
  to design a sidebar from scratch, just configure this primitive.
