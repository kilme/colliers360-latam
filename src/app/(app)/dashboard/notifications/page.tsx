import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Bell, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const buId = session!.user.businessUnitId ?? undefined;
  const buFilter = buId ? { businessUnitId: buId } : {};

  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [expiringLeases, overdueTasks, pendingTx] = await Promise.all([
    prisma.lease.findMany({
      where: { ...buFilter, status: "ACTIVO", endDate: { gte: now, lte: in90 } },
      include: { property: { select: { name: true } } },
      orderBy: { endDate: "asc" },
    }),
    prisma.projectTask.findMany({
      where: { done: false, dueDate: { lt: now }, project: buFilter },
      include: { project: { select: { title: true } } },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    prisma.transaction.findMany({
      where: { ...buFilter, status: "EN_REVISION" },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  type Notification = { id: string; level: "danger" | "warning" | "info"; title: string; sub: string; ts: Date };
  const notifs: Notification[] = [
    ...expiringLeases.map(l => {
      const days = Math.ceil((l.endDate.getTime() - now.getTime()) / 86400000);
      return {
        id: `lease-${l.id}`, level: (days <= 30 ? "danger" : "warning") as "danger" | "warning",
        title: `Contrato vence en ${days} días`,
        sub: `${l.tenant} · ${l.property.name}`,
        ts: l.endDate,
      };
    }),
    ...overdueTasks.map(t => ({
      id: `task-${t.id}`, level: "danger" as const,
      title: `Tarea vencida: ${t.title}`,
      sub: `Proyecto: ${t.project.title}`,
      ts: t.dueDate!,
    })),
    ...pendingTx.map(t => ({
      id: `tx-${t.id}`, level: "info" as const,
      title: `Transacción en revisión`,
      sub: t.title,
      ts: t.updatedAt,
    })),
  ].sort((a, b) => {
    const rank = { danger: 0, warning: 1, info: 2 };
    return rank[a.level] - rank[b.level];
  });

  const ICON = { danger: AlertCircle, warning: Clock, info: CheckCircle2 };
  const COLOR = {
    danger:  "text-red-500 bg-red-50",
    warning: "text-amber-500 bg-amber-50",
    info:    "text-blue-500 bg-blue-50",
  };
  const BADGE = {
    danger:  "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info:    "bg-blue-100 text-blue-700",
  };
  const BADGE_LABEL = { danger: "Urgente", warning: "Atención", info: "Info" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell size={22} className="text-[#003087]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">{notifs.length} alertas activas</p>
        </div>
      </div>

      {notifs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
          <p className="text-gray-500 font-medium">Todo al día</p>
          <p className="text-gray-400 text-sm mt-1">Sin alertas pendientes.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {notifs.map(n => {
            const Icon = ICON[n.level];
            return (
              <div key={n.id} className="px-5 py-4 flex items-start gap-4">
                <span className={`p-2 rounded-lg shrink-0 mt-0.5 ${COLOR[n.level]}`}>
                  <Icon size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.sub}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${BADGE[n.level]}`}>
                  {BADGE_LABEL[n.level]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
