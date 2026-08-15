import { useEffect, useState } from "react"
import { AlertCircle, Calendar, CheckCircle2, ChevronDown, Clock, Megaphone, Plus, Star, Tag, X } from "lucide-react"
import { useBusinessDashboardQuery } from "@/lib/graphql/generated/graphql"
import {
  createPromotion,
  deletePromotion,
  getPromotions,
  getPromotionStatus,
  type Promotion,
  type PromotionType,
} from "@/lib/promotionsStore"

const PROMOTION_TYPES: PromotionType[] = ["Discount", "Featured Placement", "Special Offer", "Event"]

const TYPE_ICON: Record<PromotionType, typeof Tag> = {
  Discount: Tag,
  "Featured Placement": Star,
  "Special Offer": Megaphone,
  Event: Calendar,
}

const TYPE_COLOR_CLASS: Record<PromotionType, string> = {
  Discount: "bg-violet-50 text-violet-600",
  "Featured Placement": "bg-amber-50 text-amber-600",
  "Special Offer": "bg-blue-50 text-primary",
  Event: "bg-emerald-50 text-emerald-600",
}

const STATUS_CONFIG = {
  Active: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  Scheduled: { className: "bg-blue-50 text-primary border-blue-200", icon: Clock },
  Ended: { className: "bg-slate-100 text-slate-500 border-slate-200", icon: AlertCircle },
} as const

const fieldClass =
  "field w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"

const emptyForm = { name: "", type: "Discount" as PromotionType, description: "", startDate: "", endDate: "" }

export function PromotionsPage() {
  const { data: dashboardData } = useBusinessDashboardQuery()
  const placeId = dashboardData?.businessDashboard?.data?.placeId

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (placeId) setPromotions(getPromotions(placeId))
  }, [placeId])

  function patchForm(patch: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  function handleCreate() {
    if (!placeId || !form.name.trim() || !form.startDate || !form.endDate) return
    createPromotion(placeId, { ...form, name: form.name.trim() })
    setPromotions(getPromotions(placeId))
    setForm(emptyForm)
    setShowForm(false)
  }

  function handleDelete(id: string) {
    if (!placeId) return
    deletePromotion(placeId, id)
    setPromotions(getPromotions(placeId))
  }

  if (!placeId) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Loading promotions...</p>
  }

  const grouped: { label: string; items: Promotion[] }[] = [
    { label: "Active", items: promotions.filter((p) => getPromotionStatus(p) === "Active") },
    { label: "Scheduled", items: promotions.filter((p) => getPromotionStatus(p) === "Scheduled") },
    { label: "Ended", items: promotions.filter((p) => getPromotionStatus(p) === "Ended") },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Promotions</h1>
          <p className="mt-1 text-sm text-slate-500">Create offers and boost your listing visibility.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex cursor-pointer items-center gap-2 self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-blue-200 transition-all hover:bg-primary/90 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Promotion
        </button>
      </div>

      <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs font-medium text-primary">
        Preview feature — promotions you create here are saved only to this browser, not published anywhere. There's no promotions system on the platform yet.
      </p>

      {showForm && (
        <div className="rounded-2xl border border-blue-200 bg-card p-6 shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">New Promotion</h2>
            <button onClick={() => setShowForm(false)} className="cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Promotion Name</label>
              <input
                className={fieldClass}
                placeholder="e.g. Summer Discount, Holiday Special…"
                value={form.name}
                onChange={(e) => patchForm({ name: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Type</label>
              <div className="relative">
                <select
                  className={`${fieldClass} appearance-none pr-9`}
                  value={form.type}
                  onChange={(e) => patchForm({ type: e.target.value as PromotionType })}
                >
                  {PROMOTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Description <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input className={fieldClass} placeholder="Brief details for your customers" value={form.description} onChange={(e) => patchForm({ description: e.target.value })} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Date</label>
              <input type="date" className={fieldClass} value={form.startDate} onChange={(e) => patchForm({ startDate: e.target.value })} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">End Date</label>
              <input type="date" className={fieldClass} value={form.endDate} onChange={(e) => patchForm({ endDate: e.target.value })} />
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5">
            <button onClick={() => setShowForm(false)} className="cursor-pointer rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!form.name.trim() || !form.startDate || !form.endDate}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              Create Promotion
            </button>
          </div>
        </div>
      )}

      {promotions.length === 0 && !showForm && (
        <div className="rounded-2xl border border-border bg-card p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Megaphone className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-1 font-bold text-slate-900">No promotions yet</p>
          <p className="mx-auto mb-5 max-w-xs text-sm text-slate-500">Create your first promotion to attract new customers and boost your listing.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mx-auto flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-blue-200 transition-all hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create First Promotion
          </button>
        </div>
      )}

      {grouped.length > 0 && (
        <div className="space-y-8">
          {grouped.map(({ label, items }) => (
            <div key={label}>
              <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">{label}</p>
              <div className="space-y-3">
                {items.map((promo) => (
                  <PromotionCard key={promo.id} promo={promo} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PromotionCard({ promo, onDelete }: { promo: Promotion; onDelete: (id: string) => void }) {
  const status = getPromotionStatus(promo)
  const statusConfig = STATUS_CONFIG[status]
  const StatusIcon = statusConfig.icon
  const TypeIcon = TYPE_ICON[promo.type]

  return (
    <div className={`flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm ${status === "Ended" ? "border-border opacity-70" : "border-border transition-shadow hover:shadow-md"}`}>
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${TYPE_COLOR_CLASS[promo.type]}`}>
        <TypeIcon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-bold text-slate-900">{promo.name}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{promo.type}</p>
          </div>
          <span className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status}
          </span>
        </div>

        {promo.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{promo.description}</p>}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {promo.startDate} – {promo.endDate}
        </div>
      </div>

      {status !== "Active" && (
        <button onClick={() => onDelete(promo.id)} className="flex-shrink-0 cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-destructive" title="Delete promotion">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
