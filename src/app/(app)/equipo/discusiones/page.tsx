import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DiscusionesPage() {
  const session = await getServerSession(authOptions);

  const discussions = await prisma.discussion.findMany({
    where: { businessUnitId: session!.user.businessUnitId ?? undefined },
    include: {
      _count: { select: { comments: true } },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discusiones del equipo</h1>
          <p className="text-sm text-gray-500 mt-1">{discussions.length} discusiones activas</p>
        </div>
        <button className="bg-[#003087] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#001a4e] transition">
          + Nueva discusión
        </button>
      </div>

      {discussions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-400">Aún no hay discusiones. ¡Empezá una conversación con tu equipo!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {discussions.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {d.pinned && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Fijado
                    </span>
                  )}
                  <h3 className="font-medium text-gray-900 text-sm truncate">{d.title}</h3>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(d.updatedAt)} · {d._count.comments} respuestas
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
