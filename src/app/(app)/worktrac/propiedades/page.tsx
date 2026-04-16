"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PropertyForm } from "@/components/worktrac/property-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { Plus, Building2 } from "lucide-react";

type Property = {
  id: string; name: string; type: string; status: string;
  city: string; country: string; totalAreaM2: number | null;
  broker: { name: string }; businessUnit: { name: string; country: string };
  _count: { leases: number }; createdAt: string;
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "info" | "neutral"> = {
  DISPONIBLE:     "success",
  OCUPADO:        "info",
  EN_NEGOCIACION: "warning",
  INACTIVO:       "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  DISPONIBLE: "Disponible", OCUPADO: "Ocupado",
  EN_NEGOCIACION: "En negociación", INACTIVO: "Inactivo",
};

export default function PropiedadesPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");

  const buId = session?.user.businessUnitId ?? "";

  async function load() {
    setLoading(true);
    const res  = await fetch(`/api/properties${search ? `?q=${encodeURIComponent(search)}` : ""}`);
    const data = await res.json();
    setProperties(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-sm text-gray-500 mt-1">{properties.length} propiedades</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>Nueva propiedad</Button>
      </div>

      <div className="flex gap-3">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre…"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#003087]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : properties.length === 0 ? (
        <EmptyState
          title="Sin propiedades"
          description="Registrá la primera propiedad de tu portafolio."
          action={<Button icon={<Plus size={15} />} size="sm" onClick={() => setShowForm(true)}>Nueva propiedad</Button>}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Nombre","Tipo","Ciudad","Estado","Contratos","Broker","Creado"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <Link href={`/worktrac/propiedades/${p.id}`} className="font-medium text-[#003087] hover:underline">
                      <span className="flex items-center gap-1.5"><Building2 size={13} />{p.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{p.type.toLowerCase()}</td>
                  <td className="px-4 py-3 text-gray-600">{p.city}, {p.country}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p._count.leases}</td>
                  <td className="px-4 py-3 text-gray-600">{p.broker.name}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PropertyForm
        open={showForm}
        onClose={() => { setShowForm(false); load(); }}
        businessUnitId={buId}
      />
    </div>
  );
}
