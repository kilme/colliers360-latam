import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [propiedades, transacciones, proyectos] = await Promise.all([
    prisma.property.count({ where: { businessUnitId: session!.user.businessUnitId ?? undefined } }),
    prisma.transaction.count({ where: { businessUnitId: session!.user.businessUnitId ?? undefined } }),
    prisma.project.count({ where: { businessUnitId: session!.user.businessUnitId ?? undefined } }),
  ]);

  const stats = [
    { label: "Propiedades",   value: propiedades,   color: "bg-blue-600" },
    { label: "Transacciones", value: transacciones, color: "bg-indigo-600" },
    { label: "Proyectos",     value: proyectos,     color: "bg-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de tu portafolio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{value}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Actividad reciente</h2>
        <p className="text-sm text-gray-400 italic">Sin actividad aún. Comenzá cargando propiedades o transacciones.</p>
      </div>
    </div>
  );
}
