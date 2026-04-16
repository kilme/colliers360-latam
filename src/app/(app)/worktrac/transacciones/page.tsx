import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function TransaccionesPage() {
  const session = await getServerSession(authOptions);

  const transactions = await prisma.transaction.findMany({
    where: { businessUnitId: session!.user.businessUnitId ?? undefined },
    include: {
      broker:   { select: { name: true } },
      assignee: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const STATUS_COLORS: Record<string, string> = {
    PROSPECTO:       "bg-gray-100 text-gray-700",
    EN_NEGOCIACION:  "bg-yellow-100 text-yellow-700",
    EN_REVISION:     "bg-blue-100 text-blue-700",
    APROBADO:        "bg-indigo-100 text-indigo-700",
    CERRADO:         "bg-green-100 text-green-700",
    CANCELADO:       "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-sm text-gray-500 mt-1">{transactions.length} transacciones activas</p>
        </div>
        <button className="bg-[#003087] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#001a4e] transition">
          + Nueva transacción
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-400">Aún no hay transacciones registradas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Título", "Tipo", "Estado", "Valor", "Broker", "Cierre est.", "Creado"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{t.type.replace("_", " ").toLowerCase()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.value ? formatCurrency(t.value, t.currency) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.broker.name}</td>
                  <td className="px-4 py-3 text-gray-400">{t.expectedClose ? formatDate(t.expectedClose) : "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
