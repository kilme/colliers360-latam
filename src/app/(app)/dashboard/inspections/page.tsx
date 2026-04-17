import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function InspectionsPage() {
  const session = await getServerSession(authOptions);
  const buId = session!.user.businessUnitId ?? undefined;
  const buFilter = buId ? { businessUnitId: buId } : {};

  const properties = await prisma.property.findMany({
    where: { ...buFilter, organizationId: session!.user.organizationId },
    select: {
      id: true, name: true, city: true, country: true, type: true, status: true,
      totalAreaM2: true, updatedAt: true,
      _count: { select: { leases: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  const MONTHS_CYCLE = 6;
  const now = new Date();

  const rows = properties.map(p => {
    const lastInspection = new Date(p.updatedAt);
    const nextDue = new Date(lastInspection.getTime() + MONTHS_CYCLE * 30 * 24 * 60 * 60 * 1000);
    const daysUntil = Math.ceil((nextDue.getTime() - now.getTime()) / 86400000);
    const status = daysUntil < 0 ? "vencida" : daysUntil <= 30 ? "próxima" : "al_dia";
    return { ...p, nextDue, daysUntil, inspStatus: status };
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  const VARIANT: Record<string, "danger" | "warning" | "success"> = {
    vencida: "danger", próxima: "warning", al_dia: "success",
  };
  const LABEL: Record<string, string> = {
    vencida: "Vencida", próxima: "Próxima", al_dia: "Al día",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck size={22} className="text-[#003087]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspecciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ciclo semestral · {properties.length} propiedades</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Propiedad","Tipo","Ciudad","Área m²","Próxima inspección","Estado"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{p.type.toLowerCase()}</td>
                <td className="px-4 py-3 text-gray-500">{p.city}, {p.country}</td>
                <td className="px-4 py-3 text-gray-500">{p.totalAreaM2?.toLocaleString("es-419") ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.nextDue.toLocaleDateString("es-419", { day: "numeric", month: "short", year: "numeric" })}
                  <span className="ml-2 text-xs text-gray-400">
                    {p.daysUntil < 0 ? `hace ${Math.abs(p.daysUntil)}d` : `en ${p.daysUntil}d`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={VARIANT[p.inspStatus]}>{LABEL[p.inspStatus]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
