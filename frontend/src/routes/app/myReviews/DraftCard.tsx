import { useState } from "react"
import { Link } from "react-router-dom"
import { MapPin, Star, Trash2 } from "lucide-react"
import type { ReviewDraft } from "@/lib/drafts"

export function DraftCard({ draft, onContinue, onDelete }: { draft: ReviewDraft; onContinue: (rating: number, text: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(draft.rating)
  const [text, setText] = useState(draft.text)

  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-amber-300 bg-card shadow-sm">
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
          <MapPin className="h-5 w-5 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/app/places/${draft.placeId}`} className="text-sm font-bold hover:text-primary">
                {draft.placeName}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`} />
                  ))}
                </div>
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 uppercase">Draft</span>
              </div>
            </div>
            <button onClick={onDelete} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {editing ? (
            <div className="mt-3">
              <div className="mb-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)}>
                    <Star className={`h-5 w-5 cursor-pointer ${n <= rating ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`} />
                  </button>
                ))}
              </div>
              <textarea
                className="w-full rounded-[10px] border border-border p-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onContinue(rating, text)}
                  disabled={!rating || !text.trim()}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-blue-700 disabled:opacity-50"
                >
                  Save draft
                </button>
                <button onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              <button onClick={() => setEditing(true)} className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-blue-700">
                Continue writing
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
