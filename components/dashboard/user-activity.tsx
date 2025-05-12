"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Mock data
const data = [
  {
    name: "الأحد",
    value: 45,
  },
  {
    name: "الإثنين",
    value: 52,
  },
  {
    name: "الثلاثاء",
    value: 49,
  },
  {
    name: "الأربعاء",
    value: 63,
  },
  {
    name: "الخميس",
    value: 58,
  },
  {
    name: "الجمعة",
    value: 72,
  },
  {
    name: "السبت",
    value: 85,
  },
]

export function UserActivity() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          formatter={(value: number) => [`${value}`, "المستخدمين النشطين"]}
          labelFormatter={(label) => `${label}`}
        />
        <Line type="monotone" dataKey="value" stroke="#ff4d6d" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
