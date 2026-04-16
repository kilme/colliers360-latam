"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DiscussionForm } from "@/components/equipo/discussion-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { Plus, Pin, MessageSquare } from "lucide-react";

type Discussion = {
  id: string; title: string; pinned: boolean;
  updatedAt: string; _count: { comments: number };
};

export default function DiscusionesPage() {
  const { data: session } = useSession();
  const [items, setItems]     = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const buId = session?.user.businessUnitId ?? "";

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/discussions");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discusiones</h1>
          <p className="text-sm text-gray-500 mt-1">Comunicación del equipo</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowForm(true)}>Nueva discusión</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin discusiones"
          description="Iniciá una conversación con tu equipo."
          action={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowForm(true)}>Nueva discusión</Button>}
        />
      ) : (
        <div className="space-y-2">
          {items.map(d => (
            <Link key={d.id} href={`/equipo/discusiones/${d.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {d.pinned && <Pin size={12} className="text-blue-500 shrink-0" />}
                    <h3 className="font-medium text-gray-900 text-sm truncate">{d.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Actualizado {formatDate(d.updatedAt)}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <MessageSquare size={13} />
                  {d._count.comments}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <DiscussionForm
        open={showForm}
        onClose={() => { setShowForm(false); load(); }}
        businessUnitId={buId}
      />
    </div>
  );
}
