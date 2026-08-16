import { useEffect, useRef, useState } from "react"
import { CheckCircle2, ChevronDown, Globe, MapPin, Phone, Save } from "lucide-react"
import {
  useBusinessDashboardQuery,
  useCategoriesQuery,
  useGetPlaceByIdQuery,
  useSetPlaceHoursMutation,
  useUpdatePlaceMutation,
} from "@/lib/graphql/generated/graphql"
import { Button } from "@/components/ui/button"
import { dayName } from "../placeDetail/formatHours"
import { ListingPreviewCard } from "./ListingPreviewCard"
import { PlacePhotosSection } from "./PlacePhotosSection"

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const PRICE_TIERS: { value: "LOW" | "MEDIUM" | "HIGH"; symbol: string; hint: string }[] = [
  { value: "LOW", symbol: "$", hint: "Budget-friendly — most items under $10" },
  { value: "MEDIUM", symbol: "$$", hint: "Moderate — most items $10–$25" },
  { value: "HIGH", symbol: "$$$", hint: "Upscale — most items over $25" },
]

const fieldClass =
  "field w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"

type ListingForm = {
  label: string
  categoryId: number | null
  description: string
  address: string
  phone: string
  website: string
  priceRange: "LOW" | "MEDIUM" | "HIGH"
}

type DayHours = { open: boolean; opensAt: string; closesAt: string }
type HoursState = Record<number, DayHours>

export function MyListingPage() {
  const { data: dashboardData } = useBusinessDashboardQuery()
  const placeId = dashboardData?.businessDashboard?.data?.placeId

  const { data: placeData, refetch } = useGetPlaceByIdQuery({ variables: { id: placeId ?? 0 }, skip: !placeId })
  const place = placeData?.getPlaceById?.data

  const { data: categoriesData } = useCategoriesQuery()
  const categories = (categoriesData?.categories?.data ?? []).filter((c): c is NonNullable<typeof c> => c !== null)

  const [updatePlaceMutation, { loading: savingPlace }] = useUpdatePlaceMutation()
  const [setPlaceHoursMutation, { loading: savingHours }] = useSetPlaceHoursMutation()

  const seededRef = useRef(false)
  const [form, setForm] = useState<ListingForm | null>(null)
  const [baseline, setBaseline] = useState<ListingForm | null>(null)
  const [hours, setHours] = useState<HoursState | null>(null)
  const [hoursBaseline, setHoursBaseline] = useState<HoursState | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (seededRef.current || !place) return
    seededRef.current = true

    const seededForm: ListingForm = {
      label: place.label ?? "",
      categoryId: place.category?.id ?? categories[0]?.id ?? null,
      description: place.description ?? "",
      address: place.address ?? "",
      phone: place.phone ?? "",
      website: place.website ?? "",
      priceRange: (place.priceRange as ListingForm["priceRange"]) ?? "MEDIUM",
    }
    const seededHours: HoursState = {}
    for (let day = 0; day < 7; day++) {
      const match = (place.hours ?? []).find((h) => h?.dayOfWeek === day)
      seededHours[day] = match
        ? { open: true, opensAt: (match.opensAt ?? "09:00").slice(0, 5), closesAt: (match.closesAt ?? "17:00").slice(0, 5) }
        : { open: false, opensAt: "09:00", closesAt: "17:00" }
    }

    setForm(seededForm)
    setBaseline(seededForm)
    setHours(seededHours)
    setHoursBaseline(seededHours)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place])

  const isDirty = Boolean(form && baseline && hours && hoursBaseline) && (
    JSON.stringify(form) !== JSON.stringify(baseline) || JSON.stringify(hours) !== JSON.stringify(hoursBaseline)
  )
  const saving = savingPlace || savingHours

  function patchForm(patch: Partial<ListingForm>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev))
    setJustSaved(false)
  }

  function patchDay(day: number, patch: Partial<DayHours>) {
    setHours((prev) => (prev ? { ...prev, [day]: { ...prev[day], ...patch } } : prev))
    setJustSaved(false)
  }

  async function handleSave() {
    if (!place?.id || !form || !hours || !form.categoryId) return
    setError(null)
    try {
      await updatePlaceMutation({
        variables: {
          placeId: place.id,
          input: {
            label: form.label.trim(),
            description: form.description.trim() || undefined,
            address: form.address.trim(),
            phone: form.phone.trim(),
            website: form.website.trim() || undefined,
            categoryId: form.categoryId,
            priceRange: form.priceRange,
          },
        },
      })
      await setPlaceHoursMutation({
        variables: {
          placeId: place.id,
          hours: Object.entries(hours)
            .filter(([, d]) => d.open)
            .map(([dayOfWeek, d]) => ({ dayOfWeek: Number(dayOfWeek), opensAt: d.opensAt, closesAt: d.closesAt })),
        },
      })
      await refetch()
      setBaseline(form)
      setHoursBaseline(hours)
      setSavedAt(new Date())
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while saving.")
    }
  }

  if (!place || !form || !hours) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Loading your listing...</p>
  }

  const todayHours = hours[new Date().getDay()]
  const selectedCategory = categories.find((c) => c.id === form.categoryId)

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Listing</h1>
          <p className="mt-1 text-sm text-slate-500">Edit how your business appears to visitors.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-xs text-slate-400">Last saved: {savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}
          <Button type="button" disabled={!isDirty || saving} onClick={handleSave}>
            {justSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : justSaved ? "Saved" : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isDirty && !error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          You have unsaved changes
        </div>
      )}

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <PlacePhotosSection
            placeId={place.id ?? 0}
            coverPhotoUrl={place.coverPhotoUrl}
            photos={(place.photos ?? []).filter((p): p is NonNullable<typeof p> => p !== null)}
            onChanged={() => refetch()}
          />

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-5 border-b border-slate-100 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Basics</h3>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Business Name</label>
                <input className={fieldClass} value={form.label} onChange={(e) => patchForm({ label: e.target.value })} placeholder="Your business name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category</label>
                <div className="relative">
                  <select
                    className={`${fieldClass} appearance-none pr-9`}
                    value={form.categoryId ?? ""}
                    onChange={(e) => patchForm({ categoryId: Number(e.target.value) })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id ?? undefined}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Short Description</label>
                <textarea
                  className={`${fieldClass} resize-none`}
                  rows={4}
                  value={form.description}
                  onChange={(e) => patchForm({ description: e.target.value })}
                  placeholder="Tell visitors what makes your business special… (leave blank, or 10–255 characters)"
                />
                <p className="mt-1 text-right text-xs text-slate-400">{form.description.length} / 255</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-5 border-b border-slate-100 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Contact &amp; Location</h3>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Address</label>
                <div className="relative">
                  <MapPin className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${fieldClass} pl-9`}
                    value={form.address}
                    onChange={(e) => patchForm({ address: e.target.value })}
                    placeholder="Street, city, state, zip"
                    maxLength={25}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-400">{form.address.length} / 25 characters</p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</label>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input className={`${fieldClass} pl-9`} value={form.phone} onChange={(e) => patchForm({ phone: e.target.value })} placeholder="+15035550182" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Website</label>
                  <div className="relative">
                    <Globe className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input className={`${fieldClass} pl-9`} value={form.website} onChange={(e) => patchForm({ website: e.target.value })} placeholder="www.yoursite.com" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-5 border-b border-slate-100 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Pricing</h3>
            <div className="flex gap-3">
              {PRICE_TIERS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => patchForm({ priceRange: tier.value })}
                  className={`flex-1 cursor-pointer rounded-xl border py-3 text-sm font-bold transition-all ${
                    form.priceRange === tier.value
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-blue-200"
                      : "border-border bg-white text-slate-600 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {tier.symbol}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">{PRICE_TIERS.find((t) => t.value === form.priceRange)?.hint}</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-5 border-b border-slate-100 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Hours</h3>
            <div className="space-y-3">
              {DAY_ORDER.map((day) => {
                const d = hours[day]
                return (
                  <div key={day} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => patchDay(day, { open: !d.open })}
                      className={`relative inline-flex h-[22px] w-10 flex-shrink-0 rounded-full border-2 transition-colors ${
                        d.open ? "border-primary bg-primary" : "border-slate-200 bg-slate-200"
                      }`}
                    >
                      <span className={`mt-px inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${d.open ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <span className={`w-24 flex-shrink-0 text-sm font-semibold ${d.open ? "text-slate-800" : "text-slate-400"}`}>{dayName(day).slice(0, 3)}</span>
                    {d.open ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="time"
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-primary"
                          value={d.opensAt}
                          onChange={(e) => patchDay(day, { opensAt: e.target.value })}
                        />
                        <span className="flex-shrink-0 text-xs text-slate-400">to</span>
                        <input
                          type="time"
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-primary"
                          value={d.closesAt}
                          onChange={(e) => patchDay(day, { closesAt: e.target.value })}
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Closed</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-8">
            <p className="mb-3 px-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Live Preview</p>
            <ListingPreviewCard
              categoryLabel={selectedCategory?.label ?? null}
              label={form.label}
              priceRange={form.priceRange}
              averageRating={place.averageRating ?? 0}
              reviewCount={place.reviewCount ?? 0}
              description={form.description}
              address={form.address}
              phone={form.phone}
              website={form.website}
              coverPhotoUrl={place.coverPhotoUrl}
              todayHours={todayHours}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
