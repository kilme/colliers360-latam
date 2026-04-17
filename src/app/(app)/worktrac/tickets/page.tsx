import { Ticket } from "lucide-react";
import { ComingSoon } from "@/components/ui/coming-soon";

export default function TicketsPage() {
  return (
    <ComingSoon
      icon={Ticket}
      title="Tickets"
      description="Mesa de ayuda y soporte interno"
      features={[
        "Apertura de tickets por inquilinos o brokers",
        "Priorización y asignación a responsables",
        "SLA configurable por categoría",
        "Notificaciones automáticas de estado",
        "Historial de tickets por propiedad",
      ]}
    />
  );
}
