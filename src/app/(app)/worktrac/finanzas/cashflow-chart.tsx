"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Month = { mes: string; facturado: number; cobrado: number };

export function CashflowChart({ data }: { data: Month[] }) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 text-sm mb-4">Flujo de caja mensual</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="gFact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#003087" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#003087" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gCob" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(v: number) => [`$${v.toLocaleString("es-419")}`, ""]}
            contentStyle={{ fontSize: 12 }}
          />
          <Area type="monotone" dataKey="facturado" name="Facturado" stroke="#003087" fill="url(#gFact)" strokeWidth={2} />
          <Area type="monotone" dataKey="cobrado"   name="Cobrado"   stroke="#10b981" fill="url(#gCob)"  strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
