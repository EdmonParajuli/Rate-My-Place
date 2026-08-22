import { useState } from "react"
import { Bell, CheckCircle2, Eye, EyeOff, FileText, MessageSquare, Save, Star } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { getStoredRefreshToken } from "@/lib/auth/tokenStorage"
import { useChangePasswordMutation, useUpdateUserMutation } from "@/lib/graphql/generated/graphql"

const fieldClass =
  "field w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"

// BUSINESS-only - matches its own Figma source
// (oVTXc2TbEHvaGM5mVXL6L1/src/app/components/dashboard/SettingsPage.tsx) 1:1: a
// 2-tab screen (Account/Notifications). The REGULAR persona has a completely
// different Settings design (a 6-section sidebar) - see RegularSettingsPage.tsx.
// These two were briefly, incorrectly merged into one shared component; see
// docs/specs/phase-7-settings-account-edit.md for why they're separate again.
export function BusinessSettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "notifications">("account")

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account and notification preferences.</p>
      </div>

      <div className="flex gap-1 self-start rounded-xl bg-slate-100 p-1">
        {(["account", "notifications"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all ${
              activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "account" ? "Account" : "Notifications"}
          </button>
        ))}
      </div>

      {activeTab === "account" ? <AccountTab /> : <NotificationsTab />}
    </div>
  )
}

function AccountTab() {
  const { user, refreshUser } = useAuth()
  const [changePasswordMutation, { loading }] = useChangePasswordMutation()
  const [updateUserMutation, { loading: nameSaving }] = useUpdateUserMutation()

  const [fullName, setFullName] = useState(user?.fullName ?? "")
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameSaved, setNameSaved] = useState(false)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSaved, setPwSaved] = useState(false)

  async function handleSaveName() {
    setNameError(null)
    try {
      await updateUserMutation({ variables: { input: { fullName } } })
      await refreshUser()
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 3000)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  async function handleChangePassword() {
    setPwError(null)
    try {
      await changePasswordMutation({
        variables: {
          input: {
            previousPassword: currentPw,
            newPassword: newPw,
            confirmNewPassword: confirmPw,
            refreshToken: getStoredRefreshToken() ?? undefined,
          },
        },
      })
      setCurrentPw("")
      setNewPw("")
      setConfirmPw("")
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-5 border-b border-slate-100 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Full Name</label>
            <input
              type="text"
              className={fieldClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
            {nameError && <p className="mt-1.5 text-sm font-medium text-destructive">{nameError}</p>}
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Email Address</p>
            <p className="text-sm font-medium text-slate-800">{user?.email}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Account Type</p>
            <p className="text-sm font-medium text-slate-800">Business owner</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !fullName.trim() || fullName === user?.fullName}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nameSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {nameSaving ? "Saving..." : nameSaved ? "Saved" : "Save Name"}
          </button>
        </div>

        <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
          Email can't be changed from here yet — contact support if you need to update it.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-5 border-b border-slate-100 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Change Password</h2>

        <div className="space-y-4">
          <PasswordField label="Current Password" value={currentPw} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} onChange={setCurrentPw} placeholder="Your current password" />
          <PasswordField label="New Password" value={newPw} show={showNew} onToggle={() => setShowNew((v) => !v)} onChange={setNewPw} placeholder="At least 8 characters" />
          <PasswordField label="Confirm New Password" value={confirmPw} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} onChange={setConfirmPw} placeholder="Repeat new password" />
          {pwError && <p className="text-sm font-medium text-destructive">{pwError}</p>}
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={handleChangePassword}
            disabled={loading || !currentPw || !newPw || !confirmPw}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pwSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {loading ? "Updating..." : pwSaved ? "Password Updated" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  )
}

function PasswordField({
  label,
  value,
  show,
  onToggle,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  show: boolean
  onToggle: () => void
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} className={fieldClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        <button type="button" onClick={onToggle} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-slate-600">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

const NOTIF_ROWS = [
  { id: "new_review", icon: Star, iconBgClass: "bg-amber-50", iconColorClass: "text-accent", label: "New review received", desc: "Get an email when someone leaves a review on your listing.", defaultOn: true },
  { id: "needs_reply", icon: MessageSquare, iconBgClass: "bg-blue-50", iconColorClass: "text-primary", label: "Review needs a reply reminder", desc: "Reminder if a review has gone unanswered for more than 48 hours.", defaultOn: true },
  { id: "weekly_summary", icon: FileText, iconBgClass: "bg-violet-50", iconColorClass: "text-violet-500", label: "Weekly summary email", desc: "A digest of your ratings, review volume, and response rate each Monday.", defaultOn: false },
  { id: "marketing", icon: Bell, iconBgClass: "bg-emerald-50", iconColorClass: "text-emerald-500", label: "Product updates & tips", desc: "Occasional emails about new features and best practices for your listing.", defaultOn: false },
]

function NotificationsTab() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(Object.fromEntries(NOTIF_ROWS.map((r) => [r.id, r.defaultOn])))
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-1 border-b border-slate-100 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Email Notifications</h2>
      <p className="mb-4 text-xs text-slate-400">Preview feature — email notifications aren't sent yet, so these preferences aren't wired up to anything real.</p>

      <div>
        {NOTIF_ROWS.map((row, i) => {
          const Icon = row.icon
          return (
            <div key={row.id} className={`flex items-center justify-between gap-4 py-4 ${i < NOTIF_ROWS.length - 1 ? "border-b border-slate-100" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${row.iconBgClass}`}>
                  <Icon className={`h-4 w-4 ${row.iconColorClass}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{row.label}</p>
                  <p className="mt-0.5 max-w-sm text-xs leading-relaxed text-slate-500">{row.desc}</p>
                </div>
              </div>

              <button
                onClick={() => setToggles((t) => ({ ...t, [row.id]: !t[row.id] }))}
                className={`relative inline-flex h-[22px] w-10 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
                  toggles[row.id] ? "border-primary bg-primary" : "border-slate-200 bg-slate-200"
                }`}
              >
                <span className={`mt-px inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${toggles[row.id] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-5">
        <button
          onClick={handleSave}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Preferences Saved" : "Save Preferences"}
        </button>
      </div>
    </div>
  )
}
