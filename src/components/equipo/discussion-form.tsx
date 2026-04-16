"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Schema = z.object({
  title: z.string().min(1, "Requerido").max(200, "Máximo 200 caracteres"),
  body:  z.string().min(1, "Requerido"),
});

type FormData = z.infer<typeof Schema>;

export function DiscussionForm({ open, onClose, businessUnitId }: { open: boolean; onClose: () => void; businessUnitId: string }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(Schema),
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, businessUnitId }),
    });
    if (res.ok) { router.refresh(); onClose(); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva discusión" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Título" required error={errors.title?.message} {...register("title")} />
        <Textarea label="Mensaje inicial" rows={5} required error={errors.body?.message} {...register("body")} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>Publicar</Button>
        </div>
      </form>
    </Modal>
  );
}
