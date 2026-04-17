"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Schema = z.object({
  title:          z.string().min(1, "Requerido"),
  description:    z.string().optional(),
  businessUnitId: z.string().min(1),
  startDate:      z.string().optional(),
  dueDate:        z.string().optional(),
  budget:         z.coerce.number().nonnegative().optional(),
  currency:       z.string().min(1),
});

type FormData = z.infer<typeof Schema>;

const CURRENCIES = ["USD","MXN","COP","CLP","PEN","ARS","UYU","CRC"].map(c => ({ value: c, label: c }));

export function ProjectForm({ open, onClose, businessUnitId }: { open: boolean; onClose: () => void; businessUnitId: string }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { businessUnitId, currency: "USD" },
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        dueDate:   data.dueDate   ? new Date(data.dueDate).toISOString()   : undefined,
      }),
    });
    if (res.ok) { router.refresh(); onClose(); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo proyecto" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Título" required error={errors.title?.message} {...register("title")} />
        <Textarea label="Descripción" {...register("description")} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Inicio" type="date" {...register("startDate")} />
          <Input label="Vencimiento" type="date" {...register("dueDate")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Presupuesto" type="number" step="0.01" {...register("budget")} />
          <Select label="Moneda" options={CURRENCIES} {...register("currency")} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>Crear proyecto</Button>
        </div>
      </form>
    </Modal>
  );
}
