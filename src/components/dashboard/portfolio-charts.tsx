"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

type ExpiryBand = { band: string; count: number; area: number };
type ReversionItem = { property: string; passing: number; market: number };
type LandlordItem = { landlord: string; rent: number };

const COLORS = ["#003087", "#0057b8", "#0080ff", "#4dabf7", "#a5d8ff"];

export function ExpiryGroupsChart({ data }: { data: ExpiryBand[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}`} />
        <YAxis type="category" dataKey="band" width={90} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value, name) => [value, name === "area" ? "m²" : "contratos"]}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="count" name="Contratos" fill="#003087" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReversionChart({ data }: { data: ReversionItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 40 }}>
        <XAxis dataKey="property" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v: number) => [`$${v.toLocaleString("es-419")}`, ""]}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="passing" name="Renta actual" fill="#003087" radius={[4, 4, 0, 0]} />
        <Bar dataKey="market"  name="Renta mercado" fill="#4dabf7" radius={[4, 4, 0, 0]} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PassingRentByLandlordChart({ data }: { data: LandlordItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="rent"
          nameKey="landlord"
          cx="50%"
          cy="45%"
          outerRadius={80}
          label={({ landlord, percent }) => `${landlord} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: "#9ca3af" }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => [`$${v.toLocaleString("es-419")}`, "Renta"]}
          contentStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
