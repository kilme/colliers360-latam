import { Briefcase } from "lucide-react";
import { ComingSoon } from "@/components/ui/coming-soon";

export default function JobsPage() {
  return (
    <ComingSoon
      icon={Briefcase}
      title="Jobs"
      description="Gestión de órdenes de trabajo y mantenimiento"
      features={[
        "Creación y asignación de órdenes de trabajo",
        "Seguimiento de mantenimiento preventivo y correctivo",
        "Integración con proveedores externos",
        "Historial de intervenciones por activo",
        "Reportes de costo por propiedad",
      ]}
    />
  );
}
