import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { monthLabel } from "../dashboard/formatMonth"

// Gradient-filled area chart, matching the regular-user Figma Profile
// screen's own "Review Activity" section exactly - not the business
// dashboard's ReviewVolumeChart bar chart, which this screen wrongly reused
// at first (see docs/specs/phase-7-profile-notifications-persona-fix.md).
export function ProfileActivityChart({ data }: { data: { month: string; reviewCount: number }[] }) {
  const chartData = data.map((d) => ({ label: monthLabel(d.month), reviews: d.reviewCount }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="profileActivityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          formatter={(value: any) => [`${value} reviews`, ""]}
          contentStyle={{ background: "#0F172A", border: "none", borderRadius: "10px", color: "#fff", fontSize: "11px" }}
        />
        <Area type="monotone" dataKey="reviews" stroke="#2563EB" strokeWidth={2} fill="url(#profileActivityGradient)" dot={{ fill: "#2563EB", r: 2.5 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
