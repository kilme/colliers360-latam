"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { Upload, FileText, Trash2 } from "lucide-react";

type Doc = {
  id: string; name: string; mimeType: string; sizeBytes: number;
  uploadedBy: { name: string }; createdAt: string; url: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentosEquipoPage() {
  const { data: session }    = useSession();
  const [docs, setDocs]      = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/documents?context=EQUIPO");
    const data = await res.json();
    setDocs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setUploading(true);

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:      file.name,
        mimeType:  file.type,
        sizeBytes: file.size,
        context:   "EQUIPO",
      }),
    });

    if (res.ok) {
      const { uploadUrl } = await res.json();
      // En producción: hacer PUT a uploadUrl.url con el archivo
      // Por ahora solo refrescamos la lista
      console.log("GCS upload URL:", uploadUrl);
      load();
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await fetch(`/api/documents/${toDelete}`, { method: "DELETE" });
    setDeleting(false);
    setToDelete(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos del equipo</h1>
          <p className="text-sm text-gray-500 mt-1">{docs.length} archivos compartidos</p>
        </div>
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          <Button icon={<Upload size={14} />} loading={uploading} onClick={() => fileRef.current?.click()}>
            Subir archivo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : docs.length === 0 ? (
        <EmptyState
          title="Sin documentos"
          description="Subí archivos para compartir con tu equipo."
          action={<Button size="sm" icon={<Upload size={13} />} onClick={() => fileRef.current?.click()}>Subir archivo</Button>}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Nombre","Tipo","Tamaño","Subido por","Fecha",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <FileText size={14} className="text-gray-400 shrink-0" />
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#003087] hover:underline truncate max-w-xs">
                      {d.name}
                    </a>
                  </td>
                  <td className="px-4 py-3"><Badge variant="neutral">{d.mimeType.split("/")[1] ?? d.mimeType}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{formatBytes(d.sizeBytes)}</td>
                  <td className="px-4 py-3 text-gray-600">{d.uploadedBy.name}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(d.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setToDelete(d.id)} className="text-gray-400 hover:text-red-600 transition">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar documento"
        description="Esta acción es irreversible. El archivo se eliminará de Google Cloud Storage."
        confirmLabel="Eliminar"
      />
    </div>
  );
}
