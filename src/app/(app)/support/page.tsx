import { HelpCircle, Mail, BookOpen, MessageCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <HelpCircle size={22} className="text-[#003087]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soporte</h1>
          <p className="text-sm text-gray-500 mt-0.5">Centro de ayuda Colliers360 LATAM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Mail,
            title: "Contacto directo",
            body: "Escríbenos para reportar un problema o solicitar una nueva funcionalidad.",
            action: "soporte@colliers.com",
            href: "mailto:soporte@colliers.com",
          },
          {
            icon: BookOpen,
            title: "Documentación",
            body: "Guías de uso, tutoriales en video y preguntas frecuentes.",
            action: "Ver documentación",
            href: "#",
          },
          {
            icon: MessageCircle,
            title: "Chat en vivo",
            body: "Lun–Vie 9am–6pm (hora CDMX). Tiempo de respuesta: &lt;2 horas.",
            action: "Iniciar chat",
            href: "#",
          },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <span className="inline-flex p-2 bg-[#003087]/5 rounded-lg w-fit">
              <c.icon size={18} className="text-[#003087]" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">{c.title}</h2>
              <p className="text-xs text-gray-500 mt-1" dangerouslySetInnerHTML={{ __html: c.body }} />
            </div>
            <a href={c.href} className="mt-auto text-xs font-medium text-[#003087] hover:underline">{c.action} →</a>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-4">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {[
            ["¿Cómo agrego una nueva propiedad?", "Ir a WorkTrac → Propiedades → botón \"Nueva propiedad\". Completá los datos del activo y asigná un broker responsable."],
            ["¿Cómo invito a un usuario?", "Ir a Admin → Usuarios → \"Invitar usuario\". El sistema enviará un email de bienvenida con las credenciales."],
            ["¿Los datos están aislados por país?", "Sí. Cada Unidad de Negocio (país) tiene sus propios datos. El Super Admin puede ver todo el portafolio LATAM."],
            ["¿Cómo exporto el portafolio?", "La exportación a Excel/PDF está disponible desde el Dashboard → ícono de descarga. Próximamente en todas las tablas."],
          ].map(([q, a]) => (
            <div key={q} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <p className="font-medium text-gray-800 text-sm">{q}</p>
              <p className="text-sm text-gray-500 mt-1">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
