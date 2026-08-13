import type { LucideIcon } from "lucide-react"

// Shared placeholder for Phase-4 nav destinations not yet built - this
// shell's job is only to prove the nav + top bar work, per
// prototype/authenticated-shell's own framing.
export function ScreenPlaceholder({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
      <Icon className="mx-auto mb-3 h-8 w-8" />
      <p className="text-sm font-medium text-slate-500">{label} content</p>
      <p className="mt-1 text-xs text-slate-400">Built out in its own ticket - this shell only proves the nav + top bar work.</p>
    </div>
  )
}
