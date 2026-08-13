// Exact per-category accent styling from the Figma Make source
// (src/app/App.tsx's CATEGORIES_DATA), keyed by category label so callers can
// look up by Category.label from the backend rather than by array position.
// These are literal Tailwind utility class names (Tailwind's built-in
// palette), not custom CSS tokens - nothing to wire into index.css for these.
export const CATEGORY_STYLES: Record<string, { gradient: string; bg: string; iconColor: string }> = {
  Restaurants: { gradient: "from-orange-400 to-rose-500", bg: "bg-orange-50", iconColor: "text-orange-500" },
  "Cafés": { gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50", iconColor: "text-amber-600" },
  Hotels: { gradient: "from-sky-400 to-blue-600", bg: "bg-sky-50", iconColor: "text-sky-500" },
  Shopping: { gradient: "from-violet-400 to-purple-600", bg: "bg-violet-50", iconColor: "text-violet-500" },
  Healthcare: { gradient: "from-emerald-400 to-teal-600", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
  Education: { gradient: "from-blue-400 to-indigo-600", bg: "bg-blue-50", iconColor: "text-blue-500" },
  Fitness: { gradient: "from-red-400 to-rose-600", bg: "bg-red-50", iconColor: "text-red-500" },
  "Beauty & Wellness": { gradient: "from-pink-400 to-rose-500", bg: "bg-pink-50", iconColor: "text-pink-500" },
  Entertainment: { gradient: "from-yellow-400 to-amber-600", bg: "bg-yellow-50", iconColor: "text-yellow-600" },
  "Professional Services": { gradient: "from-slate-400 to-slate-600", bg: "bg-slate-50", iconColor: "text-slate-500" },
}
