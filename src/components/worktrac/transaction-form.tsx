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
  type:           z.enum(["ARRENDAMIENTO","VENTA","RENOVACION","EXPANSION","DISPOSICION"]),
  businessUnitId: z.string().min(1),
  value:          z.coerce.number().nonnegative().optional(),
  currency:       z.string().min(1),
  expectedClose:  z.string().optional(),
  notes:          z.string().optional(),
});

type FormData = z.infer<typeof Schema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  businessUnitId: string;
}

const CURRENCIES = ["USD","MXN","COP","CLP","PEN","ARS","UYU","CRC"].map(c => ({ value: c, label: c }));

export function TransactionForm({ open, onClose, businessUnitId }: TransactionFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { businessUnitId, currency: "USD" },
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        expectedClose: data.expectedClose ? new Date(data.expectedClose).toISOString() : undefined,
      }),
    });
    if (res.ok) { router.refresh(); onClose(); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva transacción" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Título" required error={errors.title?.message} {...register("title")} />
        <Select
          label="Tipo"
          required
          error={errors.type?.message}
          options={[
            { value: "ARRENDAMIENTO", label: "Arrendamiento" },
            { value: "VENTA",         label: "Venta" },
            { value: "RENOVACION",    label: "Renovación" },
            { value: "EXPANSION",     label: "Expansión" },
            { value: "DISPOSICION",   label: "Disposición" },
          ]}
          {...register("type")}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Valor" type="number" step="0.01" {...register("value")} />
          <Select label="Moneda" options={CURRENCIES} {...register("currency")} />
        </div>
        <Input label="Cierre estimado" type="date" {...register("expectedClose")} />
        <Textarea label="Notas" {...register("notes")} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>Crear transacción</Button>
        </div>
      </form>
    </Modal>
  );
}
