"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

// بيانات تجريبية
const data = [
  {
    name: "1",
    total: 4000,
  },
  {
    name: "2",
    total: 3000,
  },
  {
    name: "3",
    total: 2000,
  },
  {
    name: "4",
    total: 2780,
  },
  {
    name: "5",
    total: 1890,
  },
  {
    name: "6",
    total: 2390,
  },
  {
    name: "7",
    total: 3490,
  },
  {
    name: "8",
    total: 2000,
  },
  {
    name: "9",
    total: 2500,
  },
  {
    name: "10",
    total: 3000,
  },
  {
    name: "11",
    total: 4000,
  },
  {
    name: "12",
    total: 4500,
  },
  {
    name: "13",
    total: 5000,
  },
  {
    name: "14",
    total: 4200,
  },
  {
    name: "15",
    total: 3800,
  },
]

export function Overview() {
  const { theme } = useTheme()

  // تحديد الألوان بناءً على السمة
  const textColor = theme === "dark" ? "#ffffff" : "#888888"
  const gridColor = theme === "dark" ? "#333333" : "#e5e5e5"
  const barColor = theme === "dark" ? "#3b82f6" : "#2563eb"

  return (
    <div className="w-full h-[350px]">
      {/* محتوى احتياطي في حالة عدم تحميل الرسم البياني */}
      <div className="hidden h-[350px] w-full flex-col items-center justify-center text-muted-foreground">
        <p className="mb-2 text-center">جاري تحميل البيانات...</p>
        <div className="h-2 w-24 rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary"></div>
        </div>
      </div>

      {/* الرسم البياني */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="name"
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} SYP`}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString()} SYP`, "الإيرادات"]}
            labelFormatter={(label) => `اليوم ${label}`}
            contentStyle={{
              backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
              borderColor: theme === "dark" ? "#374151" : "#e5e5e5",
              borderRadius: "0.375rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              color: theme === "dark" ? "#ffffff" : "#000000",
              direction: "rtl",
              textAlign: "right",
            }}
          />
          <Bar
            dataKey="total"
            fill={barColor}
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
