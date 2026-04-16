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
import { COUNTRIES_LATAM } from "@/lib/utils";

const Schema = z.object({
  name:          z.string().min(1, "Requerido"),
  address:       z.string().min(1, "Requerido"),
  city:          z.string().min(1, "Requerido"),
  country:       z.string().length(2, "Seleccionar país"),
  type:          z.enum(["OFICINA","INDUSTRIAL","RETAIL","BODEGA","MIXTO","OTRO"]),
  status:        z.enum(["DISPONIBLE","OCUPADO","EN_NEGOCIACION","INACTIVO"]).optional(),
  totalAreaM2:   z.coerce.number().positive().optional(),
  floors:        z.coerce.number().int().positive().optional(),
  notes:         z.string().optional(),
  businessUnitId: z.string().min(1, "Requerido"),
});

type FormData = z.infer<typeof Schema>;

interface PropertyFormProps {
  open: boolean;
  onClose: () => void;
  businessUnitId: string;
  defaultValues?: Partial<FormData>;
  propertyId?: string;
}

export function PropertyForm({ open, onClose, businessUnitId, defaultValues, propertyId }: PropertyFormProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { businessUnitId, ...defaultValues },
  });

  async function onSubmit(data: FormData) {
    const url    = propertyId ? `/api/properties/${propertyId}` : "/api/properties";
    const method = propertyId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.refresh();
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={propertyId ? "Editar propiedad" : "Nueva propiedad"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre" required error={errors.name?.message} {...register("name")} />
          </div>
          <div className="col-span-2">
            <Input label="Dirección" required error={errors.address?.message} {...register("address")} />
          </div>
          <Input label="Ciudad" required error={errors.city?.message} {...register("city")} />
          <Select
            label="País"
            required
            error={errors.country?.message}
            placeholder="Seleccionar"
            options={COUNTRIES_LATAM.map(c => ({ value: c.code, label: c.name }))}
            {...register("country")}
          />
          <Select
            label="Tipo"
            required
            error={errors.type?.message}
            options={[
              { value: "OFICINA",     label: "Oficina" },
              { value: "INDUSTRIAL",  label: "Industrial" },
              { value: "RETAIL",      label: "Retail" },
              { value: "BODEGA",      label: "Bodega" },
              { value: "MIXTO",       label: "Mixto" },
              { value: "OTRO",        label: "Otro" },
            ]}
            {...register("type")}
          />
          <Select
            label="Estado"
            options={[
              { value: "DISPONIBLE",     label: "Disponible" },
              { value: "OCUPADO",        label: "Ocupado" },
              { value: "EN_NEGOCIACION", label: "En negociación" },
              { value: "INACTIVO",       label: "Inactivo" },
            ]}
            {...register("status")}
          />
          <Input
            label="Área total (m²)"
            type="number"
            step="0.01"
            error={errors.totalAreaM2?.message}
            {...register("totalAreaM2")}
          />
          <Input
            label="Pisos"
            type="number"
            error={errors.floors?.message}
            {...register("floors")}
          />
          <div className="col-span-2">
            <Textarea label="Notas" rows={3} {...register("notes")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>
            {propertyId ? "Guardar cambios" : "Crear propiedad"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
