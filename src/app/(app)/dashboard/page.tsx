import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Building2, FolderKanban, FileText, TrendingUp, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const buId = session!.user.businessUnitId ?? undefined;
  const buFilter = buId ? { businessUnitId: buId } : {};

  const now   = new Date();
  const in30  = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in90  = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [
    propCount,
    txCount,
    projCount,
    activeLeases,
    expiringLeases,
    recentTx,
  ] = await Promise.all([
    prisma.property.count({ where: { ...buFilter, organizationId: session!.user.organizationId } }),
    prisma.transaction.count({ where: { ...buFilter, status: { notIn: ["CERRADO","CANCELADO"] } } }),
    prisma.project.count({ where: { ...buFilter, status: { notIn: ["COMPLETADO","CANCELADO"] } } }),
    prisma.lease.findMany({
      where: { ...buFilter, status: "ACTIVO" },
      select: { rentAmount: true, currency: true },
    }),
    prisma.lease.findMany({
      where: { ...buFilter, status: "ACTIVO", endDate: { gte: now, lte: in90 } },
      include: { property: { select: { name: true, city: true } } },
      orderBy: { endDate: "asc" },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: { ...buFilter },
      include: { broker: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const totalMRR = activeLeases.reduce((s, l) => s + l.rentAmount, 0);
  const currency = activeLeases[0]?.currency ?? "USD";

  const daysUntil = (d: Date) => Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen del portafolio</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Propiedades"     value={propCount}                          icon={Building2}     color="blue" />
        <StatCard label="MRR activo"      value={formatCurrency(totalMRR, currency)} icon={TrendingUp}    color="green" />
        <StatCard label="Transacciones"   value={txCount}                            icon={FolderKanban}  color="indigo" />
        <StatCard label="Proyectos"       value={projCount}                          icon={FileText}      color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contratos por vencer */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-500" />
            <h2 className="font-semibold text-gray-800">Contratos por vencer (90 días)</h2>
            <span className="ml-auto text-xs text-gray-400">{expiringLeases.length}</span>
          </div>
          {expiringLeases.length === 0 ? (
            <p className="text-sm text-gray-400 p-5">Sin contratos próximos a vencer.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {expiringLeases.map(l => {
                const days = daysUntil(l.endDate);
                return (
                  <li key={l.id} className="px-5 py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{l.property.name}</p>
                      <p className="text-xs text-gray-400">{l.property.city} · {formatDate(l.endDate)}</p>
                    </div>
                    <Badge variant={days <= 30 ? "danger" : "warning"}>{days}d</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Actividad reciente</h2>
          </div>
          {recentTx.length === 0 ? (
            <p className="text-sm text-gray-400 p-5">Sin actividad reciente.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentTx.map(t => (
                <li key={t.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.broker.name} · {formatDate(t.updatedAt)}</p>
                  </div>
                  <Badge
                    variant={t.status === "CERRADO" ? "success" : t.status === "CANCELADO" ? "danger" : "neutral"}
                  >
                    {t.status.replace("_"," ")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
