import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarDays, FileText, FolderKanban, Clock } from "lucide-react";

type EventItem = {
  id: string;
  type: "lease" | "project" | "transaction";
  title: string;
  sub: string;
  date: Date;
  daysAway: number;
};

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  const buId = session!.user.businessUnitId ?? undefined;
  const buFilter = buId ? { businessUnitId: buId } : {};

  const now = new Date();
  const in180 = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  const [leases, projects, transactions] = await Promise.all([
    prisma.lease.findMany({
      where: { ...buFilter, status: "ACTIVO", endDate: { gte: now, lte: in180 } },
      include: { property: { select: { name: true } } },
      orderBy: { endDate: "asc" },
    }),
    prisma.project.findMany({
      where: { ...buFilter, status: { notIn: ["COMPLETADO","CANCELADO"] }, dueDate: { gte: now, lte: in180 } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.transaction.findMany({
      where: { ...buFilter, status: { notIn: ["CERRADO","CANCELADO"] }, expectedClose: { gte: now, lte: in180 } },
      orderBy: { expectedClose: "asc" },
    }),
  ]);

  const events: EventItem[] = [
    ...leases.map(l => ({
      id: l.id, type: "lease" as const,
      title: `Vencimiento: ${l.tenant}`,
      sub: l.property.name,
      date: l.endDate,
      daysAway: Math.ceil((l.endDate.getTime() - now.getTime()) / 86400000),
    })),
    ...projects.map(p => ({
      id: p.id, type: "project" as const,
      title: p.title,
      sub: `Proyecto · ${p.status.replace("_"," ")}`,
      date: p.dueDate!,
      daysAway: Math.ceil((p.dueDate!.getTime() - now.getTime()) / 86400000),
    })),
    ...transactions.map(t => ({
      id: t.id, type: "transaction" as const,
      title: t.title,
      sub: `Transacción · cierre estimado`,
      date: t.expectedClose!,
      daysAway: Math.ceil((t.expectedClose!.getTime() - now.getTime()) / 86400000),
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const ICON = { lease: FileText, project: FolderKanban, transaction: Clock };
  const COLOR = { lease: "text-amber-500 bg-amber-50", project: "text-blue-500 bg-blue-50", transaction: "text-emerald-500 bg-emerald-50" };
  const LABEL = { lease: "Contrato", project: "Proyecto", transaction: "Transacción" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays size={22} className="text-[#003087]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Próximos 180 días · {events.length} eventos</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">Sin eventos en los próximos 180 días.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {events.map(ev => {
            const Icon = ICON[ev.type];
            const urgency = ev.daysAway <= 30 ? "bg-red-50 text-red-700" : ev.daysAway <= 60 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500";
            return (
              <div key={ev.id} className="px-5 py-4 flex items-center gap-4">
                <span className={`p-2 rounded-lg ${COLOR[ev.type]}`}>
                  <Icon size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{LABEL[ev.type]} · {ev.sub}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-600">{ev.date.toLocaleDateString("es-419", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgency}`}>{ev.daysAway}d</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
