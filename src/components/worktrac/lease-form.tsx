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
  tenant:         z.string().min(1, "Requerido"),
  startDate:      z.string().min(1, "Requerido"),
  endDate:        z.string().min(1, "Requerido"),
  renewalDate:    z.string().optional(),
  areaM2:         z.coerce.number().positive("Requerido"),
  rentAmount:     z.coerce.number().nonnegative("Requerido"),
  currency:       z.string().default("USD"),
  terms:          z.string().optional(),
});

type FormData = z.infer<typeof Schema>;

const CURRENCIES = ["USD","MXN","COP","CLP","PEN","ARS","UYU","CRC"].map(c => ({ value: c, label: c }));

interface LeaseFormProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  businessUnitId: string;
}

export function LeaseForm({ open, onClose, propertyId, businessUnitId }: LeaseFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { currency: "USD" },
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/leases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        propertyId,
        businessUnitId,
        startDate:   new Date(data.startDate).toISOString(),
        endDate:     new Date(data.endDate).toISOString(),
        renewalDate: data.renewalDate ? new Date(data.renewalDate).toISOString() : undefined,
      }),
    });
    if (res.ok) { router.refresh(); onClose(); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo contrato" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Inquilino / Empresa" required error={errors.tenant?.message} {...register("tenant")} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Inicio" type="date" required error={errors.startDate?.message} {...register("startDate")} />
          <Input label="Vencimiento" type="date" required error={errors.endDate?.message} {...register("endDate")} />
        </div>
        <Input label="Opción de renovación" type="date" {...register("renewalDate")} />
        <div className="grid grid-cols-3 gap-3">
          <Input label="Área (m²)" type="number" step="0.01" required error={errors.areaM2?.message} {...register("areaM2")} />
          <Input label="Renta mensual" type="number" step="0.01" required error={errors.rentAmount?.message} {...register("rentAmount")} />
          <Select label="Moneda" options={CURRENCIES} {...register("currency")} />
        </div>
        <Textarea label="Términos del contrato" {...register("terms")} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>Crear contrato</Button>
        </div>
      </form>
    </Modal>
  );
}
