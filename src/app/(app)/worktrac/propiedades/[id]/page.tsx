import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Layers, FileText } from "lucide-react";

const STATUS_VARIANT: Record<string, "success" | "warning" | "info" | "neutral"> = {
  DISPONIBLE: "success", OCUPADO: "info", EN_NEGOCIACION: "warning", INACTIVO: "neutral",
};
const LEASE_VARIANT: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  ACTIVO: "success", EN_RENOVACION: "warning", VENCIDO: "neutral", CANCELADO: "danger",
};

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const property = await prisma.property.findFirst({
    where: { id, organizationId: session!.user.organizationId },
    include: {
      broker:       { select: { name: true, email: true } },
      businessUnit: { select: { name: true, country: true } },
      leases:       { orderBy: { startDate: "desc" }, take: 20 },
      documents:    { include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!property) notFound();

  const activeLeases = property.leases.filter(l => l.status === "ACTIVO");
  const totalRent    = activeLeases.reduce((s, l) => s + l.rentAmount, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={20} className="text-[#003087]" />
            <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={13} />
            <span>{property.address}, {property.city}, {property.country}</span>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[property.status]}>{property.status.replace("_"," ")}</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tipo",       value: property.type.toLowerCase() },
          { label: "Área total", value: property.totalAreaM2 ? `${property.totalAreaM2.toLocaleString()} m²` : "—" },
          { label: "Contratos activos", value: String(activeLeases.length) },
          { label: "Renta mensual",     value: activeLeases.length ? formatCurrency(totalRent, activeLeases[0].currency) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-gray-900 mt-0.5 capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* Contratos */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Layers size={15} /> Contratos ({property.leases.length})
          </h2>
        </div>
        {property.leases.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">Sin contratos registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Inquilino","Área m²","Renta","Estado","Inicio","Vencimiento"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {property.leases.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{l.tenant}</td>
                  <td className="px-4 py-3 text-gray-600">{l.areaM2.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(l.rentAmount, l.currency)}</td>
                  <td className="px-4 py-3"><Badge variant={LEASE_VARIANT[l.status]}>{l.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(l.startDate)}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(l.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Documentos */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={15} /> Documentos ({property.documents.length})
          </h2>
        </div>
        {property.documents.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">Sin documentos adjuntos.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {property.documents.map(doc => (
              <li key={doc.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-400">{doc.uploadedBy.name} · {formatDate(doc.createdAt)}</p>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#003087] hover:underline">
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 flex gap-4">
        <span>Broker: {property.broker.name}</span>
        <span>BU: {property.businessUnit.name}</span>
        <span>Creado: {formatDate(property.createdAt)}</span>
      </div>
    </div>
  );
}
