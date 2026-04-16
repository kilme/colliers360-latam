import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES_LATAM } from "@/lib/utils";

const countryName = (code: string) =>
  COUNTRIES_LATAM.find(c => c.code === code)?.name ?? code;

export default async function UnidadesPage() {
  const session = await getServerSession(authOptions);

  if (session!.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const units = await prisma.businessUnit.findMany({
    where:   { organizationId: session!.user.organizationId },
    include: { _count: { select: { users: true, properties: true, leases: true } } },
    orderBy: { country: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unidades de negocio</h1>
          <p className="text-sm text-gray-500 mt-1">{units.length} países activos</p>
        </div>
        <button className="bg-[#003087] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#001a4e] transition">
          + Nueva unidad
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {units.map(u => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{u.name}</h3>
              <Badge variant="info">{u.country}</Badge>
            </div>
            <p className="text-sm text-gray-500">{countryName(u.country)} · {u.currency}</p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: "Usuarios",     value: u._count.users },
                { label: "Propiedades",  value: u._count.properties },
                { label: "Contratos",    value: u._count.leases },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-lg font-bold text-[#003087]">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
