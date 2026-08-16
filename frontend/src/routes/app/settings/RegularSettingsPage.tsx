import { useState } from "react"
import {
  User,
  SlidersHorizontal,
  Bell,
  Shield,
  Lock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  CheckCircle2,
  Save,
  Globe,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { useTheme } from "@/lib/theme/ThemeContext"
import { getStoredRefreshToken, getStoredSessionId } from "@/lib/auth/tokenStorage"
import { formatDate } from "@/lib/formatDate"
import {
  useChangePasswordMutation,
  useUpdateUserMutation,
  useActiveSessionsQuery,
  useRevokeSessionMutation,
} from "@/lib/graphql/generated/graphql"

const fieldClass =
  "w-full rounded-[10px] border border-border bg-input-background px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"

const SECTIONS = ["Account", "Preferences", "Notifications", "Privacy", "Security", "Danger Zone"] as const
type Section = (typeof SECTIONS)[number]

const SECTION_ICONS: Record<Section, React.ReactNode> = {
  Account: <User className="h-4 w-4" />,
  Preferences: <SlidersHorizontal className="h-4 w-4" />,
  Notifications: <Bell className="h-4 w-4" />,
  Privacy: <Shield className="h-4 w-4" />,
  Security: <Lock className="h-4 w-4" />,
  "Danger Zone": <AlertTriangle className="h-4 w-4" />,
}

// REGULAR-only - matches its own Figma source (uecnUKqT4CI7LuIpWo50Pp's
// SettingsScreen()) 1:1: a 6-section left sidebar, not the business console's
// 2-tab layout (BusinessSettingsPage.tsx). See
// docs/specs/phase-7-settings-account-edit.md for why these are two separate
// screens rather than one shared one. Account (name edit, password change)
// and Security's active-sessions list are real; Preferences, Notifications,
// Privacy, 2FA, and Delete Account are labeled previews - same "build the
// whole shell, label what isn't real yet" precedent Phase 6's business
// console used.
export function RegularSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("Account")
  const { data: sessionsData, loading: sessionsLoading, refetch: refetchSessions } = useActiveSessionsQuery()
  const sessions = (sessionsData?.activeSessions?.data ?? []).filter((s): s is NonNullable<typeof s> => s !== null)

  return (
    <div className="flex max-w-5xl gap-6 pb-8">
      <div className="w-48 flex-shrink-0">
        <div className="sticky top-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex w-full cursor-pointer items-center gap-2.5 border-b border-border px-4 py-3 text-sm font-semibold transition-colors last:border-0 ${
                activeSection === section
                  ? "border-l-2 border-l-primary bg-primary/5 text-primary"
                  : section === "Danger Zone"
                    ? "text-destructive hover:bg-slate-50"
                    : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <span className={activeSection === section ? "text-primary" : section === "Danger Zone" ? "text-destructive/70" : "text-slate-400"}>
                {SECTION_ICONS[section]}
              </span>
              {section}
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-5">
        {activeSection === "Account" && <AccountSection />}
        {activeSection === "Preferences" && <PreferencesSection />}
        {activeSection === "Notifications" && <NotificationsSection />}
        {activeSection === "Privacy" && <PrivacySection />}
        {activeSection === "Security" && (
          <SecuritySection sessions={sessions} loading={sessionsLoading} onRevoked={() => refetchSessions()} />
        )}
        {activeSection === "Danger Zone" && (
          <DangerZoneSection sessions={sessions} onSignedOutOthers={() => refetchSessions()} />
        )}
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 border-b border-border pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">{title}</h2>
      {children}
    </div>
  )
}

function PreviewNotice({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs text-slate-400">Preview feature — {children}</p>
}

function ToggleRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-[22px] w-10 flex-shrink-0 cursor-pointer rounded-full transition-colors ${checked ? "bg-primary" : "bg-switch-background"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  )
}

// ── Account (real) ──────────────────────────────────────────────────────────

function AccountSection() {
  const { user, refreshUser } = useAuth()
  const [changePasswordMutation, { loading: pwLoading }] = useChangePasswordMutation()
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
    <>
      <Card title="Account Information">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Full Name</label>
            <input type="text" className={fieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            {nameError && <p className="mt-1.5 text-sm font-medium text-destructive">{nameError}</p>}
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Email Address</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !fullName.trim() || fullName === user?.fullName}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nameSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {nameSaving ? "Saving..." : nameSaved ? "Saved" : "Save Name"}
          </button>
        </div>
        <p className="mt-4 border-t border-border pt-4 text-xs text-slate-400">
          Email can't be changed from here yet — contact support if you need to update it.
        </p>
      </Card>

      <Card title="Password">
        <div className="space-y-4">
          <PasswordField label="Current Password" value={currentPw} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} onChange={setCurrentPw} placeholder="Your current password" />
          <PasswordField label="New Password" value={newPw} show={showNew} onToggle={() => setShowNew((v) => !v)} onChange={setNewPw} placeholder="At least 8 characters" />
          <PasswordField label="Confirm New Password" value={confirmPw} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} onChange={setConfirmPw} placeholder="Repeat new password" />
          {pwError && <p className="text-sm font-medium text-destructive">{pwError}</p>}
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
          <button
            onClick={handleChangePassword}
            disabled={pwLoading || !currentPw || !newPw || !confirmPw}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pwSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {pwLoading ? "Updating..." : pwSaved ? "Password Updated" : "Update Password"}
          </button>
        </div>
      </Card>
    </>
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
      <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} className={fieldClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        <button type="button" onClick={onToggle} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-slate-600">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

// ── Preferences (preview) ───────────────────────────────────────────────────

function StaticPickerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <span className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
        {value} <ChevronDown className="h-3.5 w-3.5" />
      </span>
    </div>
  )
}

function PreferencesSection() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Card title="Preferences">
      <ToggleRow checked={theme === "dark"} onChange={toggleTheme} label="Dark Mode" />
      <PreviewNotice>language and time zone aren't wired up to anything real yet.</PreviewNotice>
      <StaticPickerRow label="Language" value="English (US)" />
      <StaticPickerRow label="Time Zone" value="EST (UTC -5)" />
    </Card>
  )
}

// ── Notifications (preview) ─────────────────────────────────────────────────

const NOTIF_ROWS = [
  { id: "email", label: "Email Notifications", defaultOn: true },
  { id: "push", label: "Push Notifications", defaultOn: true },
  { id: "review_reminders", label: "Review Reminders", defaultOn: false },
  { id: "recommendations", label: "Business Recommendations", defaultOn: true },
]

function NotificationsSection() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(Object.fromEntries(NOTIF_ROWS.map((r) => [r.id, r.defaultOn])))

  return (
    <Card title="Notification Preferences">
      <PreviewNotice>real per-type notifications (in-app) are on My Reviews' bell icon - these email/push toggles aren't sent anywhere yet.</PreviewNotice>
      {NOTIF_ROWS.map((row) => (
        <ToggleRow key={row.id} checked={toggles[row.id]} onChange={(v) => setToggles((t) => ({ ...t, [row.id]: v }))} label={row.label} />
      ))}
    </Card>
  )
}

// ── Privacy (preview) ───────────────────────────────────────────────────────

function PrivacySection() {
  const [publicProfile, setPublicProfile] = useState(true)
  const [hideActivity, setHideActivity] = useState(false)

  return (
    <Card title="Privacy Settings">
      <PreviewNotice>blocked users and data export have no backend yet.</PreviewNotice>
      <ToggleRow checked={publicProfile} onChange={setPublicProfile} label="Public Profile" />
      <ToggleRow checked={hideActivity} onChange={setHideActivity} label="Hide Activity from Feed" />
      <div className="flex items-center justify-between border-b border-border py-3">
        <span className="text-sm text-foreground">Blocked Users</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          Manage <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Download className="h-4 w-4" /> Download My Data
        </span>
      </div>
    </Card>
  )
}

// ── Security (2FA preview, Active Sessions real) ────────────────────────────

type ActiveSession = {
  id?: number | null
  deviceLabel?: string | null
  ipAddress?: string | null
  createdAt?: string | null
  lastUsedAt?: string | null
}

function SecuritySection({ sessions, loading, onRevoked }: { sessions: ActiveSession[]; loading: boolean; onRevoked: () => void }) {
  const [twoFA, setTwoFA] = useState(false)
  const [revokeSessionMutation] = useRevokeSessionMutation()
  const currentSessionId = getStoredSessionId()

  async function handleRevoke(sessionId: number) {
    await revokeSessionMutation({ variables: { sessionId } })
    onRevoked()
  }

  return (
    <>
      <Card title="Security">
        <PreviewNotice>two-factor authentication isn't implemented yet.</PreviewNotice>
        <ToggleRow checked={twoFA} onChange={setTwoFA} label="Two-Factor Authentication" />
      </Card>

      <Card title="Active Sessions">
        {loading ? (
          <p className="py-4 text-sm text-muted-foreground">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No active sessions.</p>
        ) : (
          sessions.map((session) => {
            const isCurrent = currentSessionId != null && String(session.id) === currentSessionId
            return (
              <div key={session.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{session.deviceLabel ?? "Unknown device"}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.ipAddress ?? "Unknown IP"} · Last used {formatDate(session.lastUsedAt)}
                  </p>
                </div>
                {isCurrent ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    This device
                  </span>
                ) : (
                  <button
                    onClick={() => session.id != null && handleRevoke(session.id)}
                    className="cursor-pointer text-xs font-semibold text-destructive hover:underline"
                  >
                    Revoke
                  </button>
                )}
              </div>
            )
          })
        )}
      </Card>
    </>
  )
}

// ── Danger Zone (sign-out-others real, delete preview) ──────────────────────

function DangerZoneSection({ sessions, onSignedOutOthers }: { sessions: ActiveSession[]; onSignedOutOthers: () => void }) {
  const [revokeSessionMutation] = useRevokeSessionMutation()
  const [signingOut, setSigningOut] = useState(false)
  const currentSessionId = getStoredSessionId()
  const otherSessions = sessions.filter((s) => !(currentSessionId != null && String(s.id) === currentSessionId))

  async function handleSignOutOthers() {
    setSigningOut(true)
    try {
      await Promise.all(otherSessions.filter((s) => s.id != null).map((s) => revokeSessionMutation({ variables: { sessionId: s.id! } })))
      onSignedOutOthers()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <>
      <Card title="Sessions">
        <button
          onClick={handleSignOutOthers}
          disabled={signingOut || otherSessions.length === 0}
          className="flex w-full cursor-pointer items-center gap-3 py-2 text-sm font-semibold text-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          {signingOut ? "Signing out..." : `Sign out of all other devices${otherSessions.length ? ` (${otherSessions.length})` : ""}`}
        </button>
      </Card>

      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500" />
          <div>
            <h3 className="mb-1 font-bold text-rose-800">Delete Account</h3>
            <p className="text-sm leading-relaxed text-rose-600">
              Permanently delete your account and all associated data including reviews, saved places, and badges. This action cannot be undone.
            </p>
          </div>
        </div>
        <button disabled className="cursor-not-allowed rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white opacity-40">
          Delete My Account
        </button>
        <p className="mt-2 text-xs text-rose-500">Preview feature — account deletion isn't implemented yet.</p>
      </div>
    </>
  )
}
