"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  FileText,
  FolderKanban,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/worktrac/propiedades",  label: "Propiedades",  icon: Building2 },
  { href: "/worktrac/transacciones",label: "Transacciones",icon: FolderKanban },
  { href: "/worktrac/proyectos",    label: "Proyectos",    icon: FileText },
  { href: "/equipo/discusiones",    label: "Equipo",       icon: Users },
  { href: "/admin/usuarios",        label: "Administrar",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#001a4e] flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-[#003087]">
        <span className="text-white font-bold text-lg tracking-tight">
          Colliers<span className="text-blue-400">360</span>
        </span>
        <span className="block text-xs text-blue-300 mt-0.5">LATAM</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
              pathname.startsWith(href)
                ? "bg-[#003087] text-white"
                : "text-blue-200 hover:bg-[#003087]/60 hover:text-white"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
