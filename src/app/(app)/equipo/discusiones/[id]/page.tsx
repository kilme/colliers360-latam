"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Send, Pin } from "lucide-react";

type Comment = {
  id: string; body: string; createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
};

type Discussion = {
  id: string; title: string; body: string; pinned: boolean;
  updatedAt: string; comments: Comment[];
};

export default function DiscussionDetailPage() {
  const { id }             = useParams<{ id: string }>();
  const { data: session }  = useSession();
  const [data, setData]    = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/discussions/${id}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [data?.comments]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    const res = await fetch(`/api/discussions/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: comment }),
    });
    if (res.ok) { setComment(""); load(); }
    setSending(false);
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!data)   return <p className="text-gray-400">Discusión no encontrada.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          {data.pinned && <Pin size={14} className="text-blue-500" />}
          <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">Actualizado {formatDate(data.updatedAt)}</p>
      </div>

      {/* Post original */}
      <div className="bg-[#003087]/5 rounded-xl p-5 border border-[#003087]/10">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{data.body}</p>
      </div>

      {/* Comentarios */}
      <div className="space-y-3">
        {data.comments.map(c => {
          const isMe = c.author.id === session?.user.id;
          return (
            <div key={c.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className="w-7 h-7 rounded-full bg-[#003087] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {c.author.name[0]}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-[#003087] text-white" : "bg-white border border-gray-200 text-gray-800"}`}>
                {!isMe && <p className="text-xs font-semibold mb-1 text-gray-500">{c.author.name}</p>}
                <p className="whitespace-pre-wrap">{c.body}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>{formatDate(c.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleComment} className="flex gap-2 sticky bottom-4">
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Escribí un comentario…"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] bg-white shadow-sm"
        />
        <Button type="submit" loading={sending} icon={<Send size={14} />} size="md">Enviar</Button>
      </form>
    </div>
  );
}
