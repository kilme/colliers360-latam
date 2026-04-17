import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BarChart2 } from "lucide-react";
import { BenchmarkingCharts } from "./benchmarking-charts";

export default async function BenchmarkingPage() {
  const session = await getServerSession(authOptions);
  const buId = session!.user.businessUnitId ?? undefined;
  const buFilter = buId ? { businessUnitId: buId } : {};

  const properties = await prisma.property.findMany({
    where: { ...buFilter, organizationId: session!.user.organizationId },
    include: {
      leases: {
        where: { status: "ACTIVO" },
        select: { rentAmount: true, marketRent: true, areaM2: true, currency: true },
      },
    },
  });

  const data = properties
    .filter(p => p.totalAreaM2 && p.totalAreaM2 > 0)
    .map(p => {
      const totalLeased = p.leases.reduce((s, l) => s + l.areaM2, 0);
      const totalRent   = p.leases.reduce((s, l) => s + l.rentAmount, 0);
      const totalMarket = p.leases.reduce((s, l) => s + (l.marketRent ?? l.rentAmount), 0);
      const occupancy   = p.totalAreaM2 ? (totalLeased / p.totalAreaM2) * 100 : 0;
      const rentPerM2   = totalLeased > 0 ? totalRent / totalLeased : 0;
      const mktPerM2    = totalLeased > 0 ? totalMarket / totalLeased : 0;
      return {
        name: p.name.split(" ").slice(0, 3).join(" "),
        occupancy: Math.round(occupancy),
        rentPerM2: Math.round(rentPerM2),
        mktPerM2:  Math.round(mktPerM2),
        type: p.type,
        city: p.city,
      };
    });

  const avgOccupancy = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.occupancy, 0) / data.length) : 0;
  const avgRentM2    = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.rentPerM2, 0) / data.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 size={22} className="text-[#003087]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benchmarking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Comparativa de rendimiento por propiedad</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Propiedades analizadas", value: data.length },
          { label: "Ocupación promedio",     value: `${avgOccupancy}%` },
          { label: "Renta promedio / m²",    value: `$${avgRentM2.toLocaleString("es-419")}` },
          { label: "Tipos de activo",        value: new Set(data.map(d => d.type)).size },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3.5">
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <BenchmarkingCharts data={data} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Detalle por propiedad</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Propiedad","Ciudad","Tipo","Ocupación","Renta/m²","Mercado/m²","Reversión"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map(d => {
              const rev = d.mktPerM2 > 0 ? ((d.mktPerM2 - d.rentPerM2) / d.mktPerM2 * 100).toFixed(1) : "—";
              const revNum = typeof rev === "string" && rev !== "—" ? parseFloat(rev) : null;
              return (
                <tr key={d.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                  <td className="px-4 py-3 text-gray-500">{d.city}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{d.type.toLowerCase()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-[#003087] h-1.5 rounded-full" style={{ width: `${d.occupancy}%` }} />
                      </div>
                      <span className="text-gray-700">{d.occupancy}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">${d.rentPerM2.toLocaleString("es-419")}</td>
                  <td className="px-4 py-3 text-gray-500">${d.mktPerM2.toLocaleString("es-419")}</td>
                  <td className="px-4 py-3">
                    {revNum !== null ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${revNum > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {revNum > 0 ? "+" : ""}{rev}%
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
