"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CheckSquare, Square, Plus } from "lucide-react";

type Task  = { id: string; title: string; done: boolean; dueDate: string | null; order: number };
type Project = {
  id: string; title: string; description: string | null;
  status: string; budget: number | null; currency: string;
  startDate: string | null; dueDate: string | null;
  manager: { name: string }; tasks: Task[];
};

const STATUS_VARIANT: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  PLANIFICACION: "neutral", EN_CURSO: "info", EN_REVISION: "warning",
  COMPLETADO: "success", CANCELADO: "danger",
};

export default function ProjectDetailPage() {
  const { id }            = useParams<{ id: string }>();
  const [data, setData]   = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  async function load() {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function toggleTask(task: Task) {
    await fetch(`/api/projects/${id}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, done: !task.done }),
    });
    load();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    setAddingTask(true);
    await fetch(`/api/projects/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask }),
    });
    setNewTask("");
    setAddingTask(false);
    load();
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!data)   return <p className="text-gray-400">Proyecto no encontrado.</p>;

  const done  = data.tasks.filter(t => t.done).length;
  const total = data.tasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Responsable: {data.manager.name}</p>
        </div>
        <Badge variant={STATUS_VARIANT[data.status]}>{data.status.replace("_"," ")}</Badge>
      </div>

      {data.description && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 border border-gray-200">{data.description}</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Inicio",       value: data.startDate ? formatDate(data.startDate) : "—" },
          { label: "Vencimiento",  value: data.dueDate   ? formatDate(data.dueDate)   : "—" },
          { label: "Presupuesto",  value: data.budget    ? formatCurrency(data.budget, data.currency) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Progreso */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Tareas ({done}/{total})</h2>
          <span className="text-sm font-medium text-[#003087]">{pct}%</span>
        </div>
        {total > 0 && (
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-[#003087] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}

        <ul className="space-y-2 mt-2">
          {data.tasks.map(t => (
            <li key={t.id} className="flex items-center gap-3">
              <button onClick={() => toggleTask(t)} className="shrink-0 text-gray-400 hover:text-[#003087] transition">
                {t.done ? <CheckSquare size={18} className="text-[#003087]" /> : <Square size={18} />}
              </button>
              <span className={`text-sm ${t.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                {t.title}
              </span>
              {t.dueDate && <span className="text-xs text-gray-400 ml-auto">{formatDate(t.dueDate)}</span>}
            </li>
          ))}
        </ul>

        <form onSubmit={addTask} className="flex gap-2 mt-3">
          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Nueva tarea…"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
          />
          <Button type="submit" size="sm" loading={addingTask} icon={<Plus size={13} />}>Agregar</Button>
        </form>
      </div>
    </div>
  );
}
