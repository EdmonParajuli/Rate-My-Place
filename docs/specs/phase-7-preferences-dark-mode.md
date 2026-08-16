# Phase 7 Spec: Preferences — Real Dark Mode

**Status: ✅ Built (mechanism), ⚠️ partial (visual coverage).** Third of Phase 7's
sequenced tickets, after Account edit and Security/active sessions.

## Context

`04-roadmap.md` explicitly flagged this one differently from every other Preferences
item: **"dark mode needs to exist as a real frontend theme, not just a design
mockup."** `RegularSettingsPage.tsx`'s Preferences section (from the Settings
correction ticket) had a Dark Mode toggle that only flipped local component state —
exactly the mockup the roadmap called out.

**Turned out to be mostly wiring, not building.** `index.css` already had a
complete `.dark { ... }` CSS variable block (every shadcn color token — background,
foreground, card, primary, border, sidebar colors, chart colors) from the original
scaffold, plus `@custom-variant dark (&:is(.dark *));` already configured for
Tailwind v4. None of it was ever applied to anything — no code ever added a `.dark`
class anywhere. The real gap was a state/persistence mechanism and wiring the
existing toggle to it, not designing a theme from scratch.

## Decisions

**Simple on/off, not light/dark/system.** Matches the Figma source's toggle
exactly — no 3-way picker was ever in the design or asked for. The *only* place
"system" matters is as the fallback default the very first time a browser loads the
site with no stored preference; after that, whatever the user picks via the toggle
is an explicit, persisted choice that wins.

**Device-level preference, not an account setting.** No backend field, no
mutation — `localStorage` only, same as every other row in this Preferences
section staying client-side (Language, Time Zone). Dark mode isn't gated behind
login and isn't part of the `User` model; it's a browser/device preference, matching
how dark-mode toggles work almost everywhere else.

**Pre-render inline script in `index.html`, not a React effect.** A theme decided
after React mounts and paints would cause a visible flash of the wrong theme on
every load — the inline script in `<body>` runs before the stylesheet takes visual
effect, reads `localStorage` (falling back to `prefers-color-scheme`), and adds the
`.dark` class synchronously. `ThemeContext`'s `useState` initializer then just reads
whatever class is already on `<html>` rather than deciding it itself, so React and
the pre-mount script never disagree.

**Visual coverage is deliberately partial in this pass — flagged, not silently
shipped as complete.** The app's screens were built across many earlier tickets
directly translating the Figma source's literal Tailwind colors (`bg-white`,
`text-slate-900`, `border-slate-100`, etc.) rather than this project's own semantic,
theme-aware tokens (`bg-card`, `text-foreground`, `border-border`) — a grep across
`frontend/src` turns up **44 files** using at least one of these hardcoded literals.
Every one of those will look inconsistent in dark mode (some elements flip, some
stay stuck light) until a dedicated follow-up sweep. Fixing all 44 was out of scope
for "wire up the toggle" — but shipping a toggle whose own home screen looked
half-broken the moment someone tried it would undercut the point, so this ticket
also fixed the two most load-bearing surfaces:
- `AppLayout.tsx`'s persistent top header (`bg-white/95` → `bg-card/95`) — visible
  on every authenticated screen, not just Settings.
- `RegularSettingsPage.tsx` in full — the screen the toggle itself lives on. Text
  colors (`text-slate-700/800/900` → `text-foreground`) were a real legibility bug,
  not just cosmetic: dark-gray-on-near-black is close to unreadable. Also swapped
  form-input/switch backgrounds to the tokens already defined for exactly this
  purpose (`--input-background`, `--switch-background` — both already existed in
  `index.css`, just unused) and dividers (`border-slate-100` → `border-border`).

The remaining 42+ files (Discover, Categories, Place Detail, My Reviews, Saved,
Notifications, Profile, the entire business console) are unaudited for dark mode —
a real, scoped follow-up ticket if full visual consistency is wanted, not attempted
here.

## Frontend

1. **`index.html`**: pre-mount inline script (see Decisions above).
2. **`lib/theme/ThemeContext.tsx`** (new): `ThemeProvider`/`useTheme()` —
   `theme: "light" | "dark"`, `toggleTheme()`. Initializes from the already-applied
   DOM class (set by the inline script), toggles the class + `localStorage` on
   change.
3. **`App.tsx`**: wrapped with `<ThemeProvider>`, outermost after `ApolloProvider`
   (theme has no dependency on auth or GraphQL, so it doesn't need to be inside
   `AuthProvider`).
4. **`routes/app/settings/RegularSettingsPage.tsx`**: `PreferencesSection`'s Dark
   Mode `ToggleRow` now reads/writes `useTheme()` instead of local state. Plus the
   legibility/token fixes described above.
5. **`routes/app/AppLayout.tsx`**: top header background token fix (see above).

## Verification

`npm run build` (typecheck) passes clean in `frontend/`. Per explicit user
direction, this repo's UI work does not additionally require driving a browser to
click-test — see the root `CLAUDE.md`'s verification section. (This one is worth
noting explicitly: a visual feature like theming is exactly the kind of change
where browser verification would normally be the instinct — skipped here per that
same standing direction, not an oversight.)

## Non-goals (explicitly out of scope)

- Auditing/fixing the other ~42 files using hardcoded literal colors — flagged
  above as a real, scoped follow-up, not attempted here.
- Real language/timezone functionality — Preferences' other two rows stay labeled
  previews; this ticket was scoped to dark mode specifically, per explicit
  direction ("Preferences with dark mode next").
- A light/dark/system 3-way picker — the design only ever called for on/off.
- Per-account theme persistence (a backend field) — this is a device preference,
  not a `User` column.
