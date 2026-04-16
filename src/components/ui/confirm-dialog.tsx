"use client";

import * as AlertDialog from "@radix-ui/react-dialog";
import { Spinner } from "./spinner";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel = "Confirmar", loading = false, variant = "danger",
}: ConfirmDialogProps) {
  const btnClass = variant === "danger"
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-amber-500 hover:bg-amber-600 text-white";

  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
          <AlertDialog.Title className="text-base font-semibold text-gray-900">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-gray-500 mt-2">{description}</AlertDialog.Description>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50 ${btnClass}`}
            >
              {loading && <Spinner className="h-4 w-4 text-white" />}
              {confirmLabel}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
