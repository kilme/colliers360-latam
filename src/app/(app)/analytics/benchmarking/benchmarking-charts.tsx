"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

type DataItem = { name: string; occupancy: number; rentPerM2: number; mktPerM2: number };

export function BenchmarkingCharts({ data }: { data: DataItem[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-4">Ocupación por propiedad</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ left: 8, right: 8, top: 4, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
            <Tooltip formatter={(v: number) => [`${v}%`, "Ocupación"]} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="occupancy" name="Ocupación" fill="#003087" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-4">Renta actual vs. mercado por m²</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ left: 8, right: 8, top: 4, bottom: 40 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString("es-419")}`, ""]} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="rentPerM2" name="Renta actual/m²"  fill="#003087" radius={[4, 4, 0, 0]} />
            <Bar dataKey="mktPerM2"  name="Renta mercado/m²" fill="#4dabf7" radius={[4, 4, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
