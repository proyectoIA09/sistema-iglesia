"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS_INGRESO = ["#2f8f6b", "#4dab84", "#6cc39c", "#8bd6b4"];
const COLORS_GASTO = ["#c1483f", "#d16b62", "#e08e86", "#efb1aa"];

export default function CategoriaChart({
  data,
  tipo,
}: {
  data: { categoria: string; total: number }[];
  tipo: "ingreso" | "gasto";
}) {
  const colores = tipo === "ingreso" ? COLORS_INGRESO : COLORS_GASTO;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2eaf6" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: "#618ec4" }} />
        <YAxis dataKey="categoria" type="category" width={130} tick={{ fontSize: 12, fill: "#33415c" }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e2eaf6", fontSize: 13 }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Total"]}
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={colores[i % colores.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
