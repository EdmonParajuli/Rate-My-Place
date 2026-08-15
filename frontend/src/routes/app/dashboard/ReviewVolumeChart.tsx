import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { monthLabel } from "./formatMonth"

export function ReviewVolumeChart({ data }: { data: { month: string; reviewCount: number }[] }) {
  const chartData = data.map((d) => ({ label: monthLabel(d.month), reviews: d.reviewCount }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} dy={8} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} allowDecimals={false} />
        <Tooltip formatter={(value: any) => [`${value} reviews`, ""]} />
        <Bar dataKey="reviews" fill="#2563EB" radius={[6, 6, 0, 0]} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  )
}
