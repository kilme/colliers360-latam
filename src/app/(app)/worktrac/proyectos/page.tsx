import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function ProyectosPage() {
  const session = await getServerSession(authOptions);

  const projects = await prisma.project.findMany({
    where: { businessUnitId: session!.user.businessUnitId ?? undefined },
    include: {
      manager: { select: { name: true } },
      _count:  { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const STATUS_COLORS: Record<string, string> = {
    PLANIFICACION: "bg-gray-100 text-gray-700",
    EN_CURSO:      "bg-blue-100 text-blue-700",
    EN_REVISION:   "bg-yellow-100 text-yellow-700",
    COMPLETADO:    "bg-green-100 text-green-700",
    CANCELADO:     "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} proyectos</p>
        </div>
        <button className="bg-[#003087] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#001a4e] transition">
          + Nuevo proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <div className="col-span-3 bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-400">Aún no hay proyectos registrados.</p>
          </div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {p.status.replace("_", " ")}
                </span>
              </div>
              {p.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{p.manager.name}</span>
                <span>{p._count.tasks} tareas</span>
              </div>
              {p.dueDate && (
                <p className="text-xs text-gray-400">Vence: {formatDate(p.dueDate)}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
