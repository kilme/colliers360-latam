import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default async function FinanzasPage() {
  const session = await getServerSession(authOptions);
  const buId = session!.user.businessUnitId ?? undefined;
  const buFilter = buId ? { businessUnitId: buId } : {};

  const [leases, financials] = await Promise.all([
    prisma.lease.findMany({
      where: { ...buFilter, status: "ACTIVO" },
      select: { rentAmount: true, currency: true },
    }),
    prisma.financial.findMany({
      where: { lease: buFilter },
      include: { lease: { select: { tenant: true, property: { select: { name: true } } } } },
      orderBy: { period: "desc" },
      take: 50,
    }),
  ]);

  const totalMRR     = leases.reduce((s, l) => s + l.rentAmount, 0);
  const totalFacturado = financials.reduce((s, f) => s + f.amount, 0);
  const totalPagado    = financials.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);
  const totalPendiente = totalFacturado - totalPagado;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
        <p className="text-sm text-gray-500 mt-1">Control de pagos y facturación del portafolio</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Renta mensual (MRR)" value={`$${totalMRR.toLocaleString()}`}         icon={TrendingUp}  color="blue" />
        <StatCard label="Total facturado"     value={`$${totalFacturado.toLocaleString()}`}    icon={DollarSign}  color="indigo" />
        <StatCard label="Cobrado"             value={`$${totalPagado.toLocaleString()}`}       icon={CheckCircle} color="green" />
        <StatCard label="Pendiente"           value={`$${totalPendiente.toLocaleString()}`}    icon={AlertCircle} color="amber" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Registros de pago</h2>
        </div>
        {financials.length === 0 ? (
          <p className="text-sm text-gray-400 p-5">Sin registros financieros.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Propiedad","Inquilino","Período","Monto","Estado","Fecha pago"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {financials.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{f.lease.property.name}</td>
                  <td className="px-4 py-3 text-gray-600">{f.lease.tenant}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(f.period)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(f.amount, f.currency)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={f.paid ? "success" : "warning"}>{f.paid ? "Pagado" : "Pendiente"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{f.paidAt ? formatDate(f.paidAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
