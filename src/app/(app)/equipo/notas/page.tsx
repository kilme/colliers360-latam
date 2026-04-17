"use client";

import { useState, useEffect } from "react";
import { StickyNote, Pin, PinOff, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

type Note = { id: string; title: string; body: string; pinned: boolean; author: { name: string }; updatedAt: string };

export default function NotasPage() {
  const [notes, setNotes]       = useState<Note[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle]       = useState("");
  const [body, setBody]         = useState("");
  const [saving, setSaving]     = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/notes");
    setNotes(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setTitle(""); setBody(""); setShowForm(false);
    await load();
    setSaving(false);
  }

  async function togglePin(note: Note) {
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !note.pinned }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StickyNote size={22} className="text-[#003087]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
            <p className="text-sm text-gray-500 mt-0.5">{notes.length} notas</p>
          </div>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>Nueva nota</Button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-800 text-sm">Nueva nota</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Escribe tu nota…"
            rows={4}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm" loading={saving}>Guardar</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <StickyNote size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">Sin notas. Crea una para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => (
            <div key={n.id} className={`bg-white rounded-xl border p-4 space-y-2 relative ${n.pinned ? "border-[#003087]/40 ring-1 ring-[#003087]/20" : "border-gray-200"}`}>
              {n.pinned && (
                <span className="absolute top-3 right-10 text-[#003087]"><Pin size={12} /></span>
              )}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-8">{n.title}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePin(n)} className="text-gray-400 hover:text-[#003087] transition p-0.5">
                    {n.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                  </button>
                  <button onClick={() => remove(n.id)} className="text-gray-400 hover:text-red-500 transition p-0.5">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{n.body}</p>
              <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">{n.author.name} · {formatDate(n.updatedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
