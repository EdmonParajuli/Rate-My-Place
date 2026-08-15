import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { monthLabel } from "./formatMonth"

export function RatingTrendChart({ data }: { data: { month: string; averageRating: number | null }[] }) {
  const chartData = data.map((d) => ({ label: monthLabel(d.month), rating: d.averageRating }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} dy={8} />
        <YAxis
          domain={[0, 5]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          tickFormatter={(v: number) => v.toFixed(1)}
        />
        <Tooltip
          formatter={(value: any) => (value == null ? ["No reviews", ""] : [`${Number(value).toFixed(1)} ★`, "Avg rating"])}
        />
        <Area
          type="monotone"
          dataKey="rating"
          stroke="#2563EB"
          strokeWidth={2.5}
          fill="url(#ratingGrad)"
          connectNulls
          dot={false}
          activeDot={{ r: 5, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
