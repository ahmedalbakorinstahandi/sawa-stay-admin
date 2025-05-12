"use client"

import { useTheme } from "next-themes"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

// بيانات تجريبية
const data = [
  { name: "معتمد", value: 45, color: "#10b981" },
  { name: "قيد المراجعة", value: 20, color: "#f59e0b" },
  { name: "مسودة", value: 15, color: "#6b7280" },
  { name: "متوقف", value: 10, color: "#3b82f6" },
  { name: "مرفوض", value: 10, color: "#ef4444" },
]

export function ListingStatus() {
  const { theme } = useTheme()

  // تحديد الألوان بناءً على السمة
  const textColor = theme === "dark" ? "#ffffff" : "#000000"

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="w-full h-[300px]">
      {/* محتوى احتياطي في حالة عدم تحميل الرسم البياني */}
      <div className="hidden h-[300px] w-full flex-col items-center justify-center text-muted-foreground">
        <p className="mb-2 text-center">جاري تحميل البيانات...</p>
        <div className="h-2 w-24 rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary"></div>
        </div>
      </div>

      {/* الرسم البياني */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1500}
            animationEasing="ease-in-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value}`, "عدد الإعلانات"]}
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
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value, entry, index) => (
              <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
