"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#3f70ac", "#d4a93f", "#618ec4", "#b98a2c"];

export function AsistenciaPorZonaChart({ data }: { data: { zona: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf6" />
        <XAxis dataKey="zona" tick={{ fontSize: 12, fill: "#618ec4" }} />
        <YAxis tick={{ fontSize: 12, fill: "#618ec4" }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e2eaf6", fontSize: 13 }}
        />
        <Bar dataKey="total" fill="#3f70ac" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EdadesPieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2eaf6", fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function OfrendaPorZonaChart({ data }: { data: { zona: string; ofrenda: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf6" />
        <XAxis dataKey="zona" tick={{ fontSize: 12, fill: "#618ec4" }} />
        <YAxis tick={{ fontSize: 12, fill: "#618ec4" }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e2eaf6", fontSize: 13 }}
          formatter={(value: number) => [`Q${value.toFixed(2)}`, "Ofrenda"]}
        />
        <Bar dataKey="ofrenda" fill="#d4a93f" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
