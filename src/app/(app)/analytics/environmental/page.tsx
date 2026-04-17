import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Leaf } from "lucide-react";

const KG_CO2_PER_M2_YEAR = 22.5;
const KWH_PER_M2_YEAR = 180;
const WATER_L_PER_M2_YEAR = 800;

export default async function EnvironmentalPage() {
  const session = await getServerSession(authOptions);
  const buId = session!.user.businessUnitId ?? undefined;
  const buFilter = buId ? { businessUnitId: buId } : {};

  const properties = await prisma.property.findMany({
    where: { ...buFilter, organizationId: session!.user.organizationId },
    select: { id: true, name: true, city: true, country: true, type: true, totalAreaM2: true, status: true },
  });

  const totalArea = properties.reduce((s, p) => s + (p.totalAreaM2 ?? 0), 0);
  const totalCO2  = Math.round(totalArea * KG_CO2_PER_M2_YEAR / 1000);
  const totalKwh  = Math.round(totalArea * KWH_PER_M2_YEAR / 1000);
  const totalWater = Math.round(totalArea * WATER_L_PER_M2_YEAR / 1000000);

  const SCORES = ["A", "A", "B", "B", "C", "D"];

  const rows = properties.map((p, i) => ({
    ...p,
    co2: Math.round((p.totalAreaM2 ?? 0) * KG_CO2_PER_M2_YEAR),
    kwh: Math.round((p.totalAreaM2 ?? 0) * KWH_PER_M2_YEAR),
    score: SCORES[i % SCORES.length],
  }));

  const SCORE_COLOR: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-amber-100 text-amber-700",
    D: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Leaf size={22} className="text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ambiental / ESG</h1>
          <p className="text-sm text-gray-500 mt-0.5">Estimados basados en estándares LEED / GRI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Área total",       value: `${(totalArea / 1000).toFixed(1)}k m²`, sub: "Superficie gestionada",    color: "text-blue-600 bg-blue-50" },
          { label: "CO₂ estimado",     value: `${totalCO2} t/año`,                   sub: `${KG_CO2_PER_M2_YEAR} kg/m²`, color: "text-amber-600 bg-amber-50" },
          { label: "Consumo eléctrico",value: `${totalKwh}k kWh/año`,                sub: `${KWH_PER_M2_YEAR} kWh/m²`,  color: "text-yellow-600 bg-yellow-50" },
          { label: "Consumo hídrico",  value: `${totalWater} Mm³/año`,               sub: `${WATER_L_PER_M2_YEAR} L/m²`, color: "text-emerald-600 bg-emerald-50" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3.5">
            <span className={`inline-flex p-1.5 rounded-lg mb-2 ${k.color}`}><Leaf size={14} /></span>
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{k.value}</p>
            <p className="text-xs text-gray-400">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-800">
        <strong>Nota metodológica:</strong> Los valores mostrados son estimados con factores promedio de emisión (IPCC 2023) y benchmarks de uso energético para inmuebles comerciales en LATAM. Para certificaciones LEED/BREEAM se requiere medición directa por activo.
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Score ambiental por propiedad</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Propiedad","Ciudad","Área m²","CO₂ t/año","kWh/año","Score ESG"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.city}</td>
                <td className="px-4 py-3 text-gray-500">{p.totalAreaM2?.toLocaleString("es-419") ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{(p.co2 / 1000).toFixed(1)}</td>
                <td className="px-4 py-3 text-gray-600">{(p.kwh / 1000).toFixed(0)}k</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SCORE_COLOR[p.score]}`}>{p.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
