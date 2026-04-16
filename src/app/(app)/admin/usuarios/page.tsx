import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);

  if (!["SUPER_ADMIN", "ADMIN"].includes(session!.user.role)) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: {
      organizationId: session!.user.organizationId,
      ...(session!.user.role === "ADMIN"
        ? { businessUnitId: session!.user.businessUnitId ?? undefined }
        : {}),
    },
    include: { businessUnit: { select: { name: true, country: true } } },
    orderBy: { name: "asc" },
  });

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE:   "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-500",
    INVITED:  "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} usuarios registrados</p>
        </div>
        <button className="bg-[#003087] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#001a4e] transition">
          + Invitar usuario
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Nombre", "Email", "Rol", "Unidad de negocio", "Estado"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{u.role.replace("_", " ").toLowerCase()}</td>
                <td className="px-4 py-3 text-gray-600">
                  {u.businessUnit ? `${u.businessUnit.name} (${u.businessUnit.country})` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[u.status] ?? ""}`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
