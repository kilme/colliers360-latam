"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { TransactionForm } from "@/components/worktrac/transaction-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

type Transaction = {
  id: string; title: string; type: string; status: string;
  value: number | null; currency: string;
  broker: { name: string }; assignee: { name: string } | null;
  expectedClose: string | null; createdAt: string;
};

const STATUS_VARIANT: Record<string, "neutral" | "warning" | "info" | "success" | "danger"> = {
  PROSPECTO:      "neutral",
  EN_NEGOCIACION: "warning",
  EN_REVISION:    "info",
  APROBADO:       "info",
  CERRADO:        "success",
  CANCELADO:      "danger",
};

const STATUS_LABEL: Record<string, string> = {
  PROSPECTO: "Prospecto", EN_NEGOCIACION: "Negociación",
  EN_REVISION: "En revisión", APROBADO: "Aprobado",
  CERRADO: "Cerrado", CANCELADO: "Cancelado",
};

const KANBAN_ORDER = ["PROSPECTO","EN_NEGOCIACION","EN_REVISION","APROBADO","CERRADO","CANCELADO"];

export default function TransaccionesPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [view, setView]                 = useState<"tabla" | "kanban">("tabla");

  const buId = session?.user.businessUnitId ?? "";

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-sm text-gray-500 mt-1">{transactions.length} transacciones</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(["tabla","kanban"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 capitalize transition ${view === v ? "bg-[#003087] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>Nueva</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : transactions.length === 0 ? (
        <EmptyState title="Sin transacciones" description="Registrá la primera transacción." action={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>Nueva</Button>} />
      ) : view === "tabla" ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Título","Tipo","Estado","Valor","Broker","Cierre est.","Creado"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize text-xs">{t.type.replace("_"," ").toLowerCase()}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[t.status]}>{STATUS_LABEL[t.status]}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{t.value ? formatCurrency(t.value, t.currency) : "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{t.broker.name}</td>
                  <td className="px-4 py-3 text-gray-400">{t.expectedClose ? formatDate(t.expectedClose) : "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-2">
          {KANBAN_ORDER.map(status => {
            const group = transactions.filter(t => t.status === status);
            return (
              <div key={status} className="min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
                  <span className="text-xs text-gray-400">{group.length}</span>
                </div>
                <div className="space-y-2">
                  {group.map(t => (
                    <div key={t.id} className="bg-white rounded-lg border border-gray-200 p-3 text-xs shadow-sm">
                      <p className="font-medium text-gray-900 line-clamp-2">{t.title}</p>
                      {t.value && <p className="text-gray-400 mt-1">{formatCurrency(t.value, t.currency)}</p>}
                      <p className="text-gray-400 mt-0.5">{t.broker.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TransactionForm
        open={showForm}
        onClose={() => { setShowForm(false); load(); }}
        businessUnitId={buId}
      />
    </div>
  );
}
