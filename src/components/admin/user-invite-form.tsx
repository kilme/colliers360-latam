"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const Schema = z.object({
  email:          z.string().email("Email inválido"),
  name:           z.string().min(1, "Requerido"),
  role:           z.enum(["ADMIN","MANAGER","BROKER","READONLY"]),
  businessUnitId: z.string().optional(),
});

type FormData = z.infer<typeof Schema>;

interface UserInviteFormProps {
  open: boolean;
  onClose: () => void;
  businessUnits: { id: string; name: string; country: string }[];
}

export function UserInviteForm({ open, onClose, businessUnits }: UserInviteFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { role: "BROKER" },
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { router.refresh(); onClose(); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invitar usuario" description="Se enviará un email con instrucciones para crear contraseña.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nombre completo" required error={errors.name?.message} {...register("name")} />
        <Input label="Email corporativo" type="email" required error={errors.email?.message} {...register("email")} />
        <Select
          label="Rol"
          required
          error={errors.role?.message}
          options={[
            { value: "ADMIN",    label: "Admin (país)" },
            { value: "MANAGER",  label: "Gerente" },
            { value: "BROKER",   label: "Broker" },
            { value: "READONLY", label: "Solo lectura" },
          ]}
          {...register("role")}
        />
        <Select
          label="Unidad de negocio"
          placeholder="Seleccionar país"
          options={businessUnits.map(bu => ({
            value: bu.id,
            label: `${bu.name} (${bu.country})`,
          }))}
          {...register("businessUnitId")}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>Enviar invitación</Button>
        </div>
      </form>
    </Modal>
  );
}
