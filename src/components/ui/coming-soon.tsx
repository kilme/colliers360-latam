import type { LucideIcon } from "lucide-react";

export function ComingSoon({ icon: Icon, title, description, features }: {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Icon size={22} className="text-[#003087]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-xl mx-auto">
        <div className="inline-flex p-4 bg-[#003087]/5 rounded-2xl mb-4">
          <Icon size={32} className="text-[#003087]" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Próximamente</h2>
        <p className="text-gray-500 text-sm mb-6">Este módulo está en desarrollo y estará disponible en la próxima versión de Colliers360 LATAM.</p>
        {features && (
          <ul className="text-left space-y-2 inline-block">
            {features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#003087] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
