"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Building2, TrendingUp, MapPin, Clock, FolderKanban, FileText, AlertCircle } from "lucide-react";
import { ExpiryGroupsChart, ReversionChart, PassingRentByLandlordChart } from "@/components/dashboard/portfolio-charts";

const PropertyMap = dynamic(
  () => import("@/components/dashboard/property-map").then(m => m.PropertyMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" /> }
);

const CURRENCIES: Record<string, { label: string; rate: number }> = {
  USD: { label: "USD", rate: 1 },
  MXN: { label: "MXN", rate: 17.2 },
  COP: { label: "COP", rate: 4080 },
  CLP: { label: "CLP", rate: 950 },
  PEN: { label: "PEN", rate: 3.75 },
  ARS: { label: "ARS", rate: 1050 },
};

function fmt(n: number, currency: string) {
  const rate = CURRENCIES[currency]?.rate ?? 1;
  return new Intl.NumberFormat("es-419", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n * rate);
}

type KPIs = {
  propertyCount: number;
  totalAreaM2: number;
  leasedAreaM2: number;
  occupancyRate: number;
  annualRent: number;
  currency: string;
  wault: number;
  activeLeases: number;
  transactions: number;
  projects: number;
};

type Props = {
  kpis: KPIs;
  mapProperties: { id: string; name: string; lat: number; lng: number; type: string }[];
  expiryData: { band: string; count: number; area: number }[];
  reversionData: { property: string; passing: number; market: number }[];
  landlordData: { landlord: string; rent: number }[];
  expiringSoon: { id: string; tenant: string; property: string; endDate: string; days: number }[];
};

export function DashboardClient({ kpis, mapProperties, expiryData, reversionData, landlordData, expiringSoon }: Props) {
  const [currency, setCurrency] = useState(kpis.currency in CURRENCIES ? kpis.currency : "USD");

  const scaledReversion = reversionData.map(d => ({
    ...d,
    passing: d.passing * (CURRENCIES[currency]?.rate ?? 1),
    market:  d.market  * (CURRENCIES[currency]?.rate ?? 1),
  }));
  const scaledLandlord = landlordData.map(d => ({
    ...d,
    rent: d.rent * (CURRENCIES[currency]?.rate ?? 1),
  }));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen del portafolio LATAM</p>
        </div>
        <div className="flex items-center gap-1.5">
          {Object.keys(CURRENCIES).map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                currency === c ? "bg-[#003087] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Colliers Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <SummaryCard
          label="Propiedades"
          value={kpis.propertyCount.toString()}
          sub={`${Math.round(kpis.totalAreaM2).toLocaleString("es-419")} m² totales`}
          icon={<Building2 size={16} />}
          color="blue"
        />
        <SummaryCard
          label="Ocupación"
          value={`${kpis.occupancyRate}%`}
          sub={`${Math.round(kpis.leasedAreaM2).toLocaleString("es-419")} m² arrendados`}
          icon={<MapPin size={16} />}
          color="green"
        />
        <SummaryCard
          label="Renta Anual"
          value={fmt(kpis.annualRent, currency)}
          sub={`${kpis.activeLeases} contratos activos`}
          icon={<TrendingUp size={16} />}
          color="indigo"
        />
        <SummaryCard
          label="WAULT"
          value={`${kpis.wault} años`}
          sub="Plazo prom. ponderado"
          icon={<Clock size={16} />}
          color="amber"
        />
        <SummaryCard
          label="Pipeline"
          value={`${kpis.transactions} tx`}
          sub={`${kpis.projects} proyectos activos`}
          icon={<FolderKanban size={16} />}
          color="violet"
        />
      </div>

      {/* ── Map + Expiry Groups ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">Mapa de Activos</h2>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {[["INDUSTRIAL","#f59e0b"],["RETAIL","#ef4444"],["OFICINA","#3b82f6"]].map(([t, c]) => (
                <span key={t} className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: c }} />
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </span>
              ))}
            </div>
          </div>
          <div className="h-[320px] p-3">
            <PropertyMap properties={mapProperties} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Grupos de Vencimiento</h2>
            <p className="text-xs text-gray-400 mt-0.5">Contratos por banda temporal</p>
          </div>
          <div className="p-4">
            <ExpiryGroupsChart data={expiryData} />
          </div>
        </div>
      </div>

      {/* ── Reversion + Landlord ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Reversión por Propiedad</h2>
            <p className="text-xs text-gray-400 mt-0.5">Renta actual vs. mercado</p>
          </div>
          <div className="p-4">
            <ReversionChart data={scaledReversion} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Renta por Arrendador</h2>
            <p className="text-xs text-gray-400 mt-0.5">Distribución por propietario</p>
          </div>
          <div className="p-4">
            <PassingRentByLandlordChart data={scaledLandlord} />
          </div>
        </div>
      </div>

      {/* ── Expiring Soon ── */}
      {expiringSoon.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Contratos por vencer (90 días)</h2>
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {expiringSoon.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {expiringSoon.map(l => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{l.tenant}</p>
                  <p className="text-xs text-gray-400">{l.property} · {new Date(l.endDate).toLocaleDateString("es-419")}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  l.days <= 30 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {l.days}d
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label, value, sub, icon, color,
}: { label: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber:  "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className={`p-1.5 rounded-lg ${colorMap[color] ?? colorMap.blue}`}>{icon}</span>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
