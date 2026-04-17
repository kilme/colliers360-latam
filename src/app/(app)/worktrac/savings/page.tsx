import { PiggyBank } from "lucide-react";
import { ComingSoon } from "@/components/ui/coming-soon";

export default function SavingsPage() {
  return (
    <ComingSoon
      icon={PiggyBank}
      title="Savings"
      description="Tracking de ahorros e iniciativas de optimización de costos"
      features={[
        "Registro de iniciativas de ahorro por activo",
        "Comparativa antes / después de intervenciones",
        "Dashboard de ahorro acumulado anual",
        "Clasificación por categoría: energía, agua, operación",
        "Reporte para presentación a clientes",
      ]}
    />
  );
}
