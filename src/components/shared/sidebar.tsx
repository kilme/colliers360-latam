"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, FolderKanban, FileText, Users, DollarSign,
  MessageSquare, Paperclip, Globe, CalendarDays, ClipboardCheck,
  Briefcase, Ticket, Leaf, BarChart2, StickyNote, Bell, HelpCircle,
  PiggyBank,
} from "lucide-react";

const NAV = [
  {
    group: "Principal",
    items: [
      { href: "/dashboard",             label: "Portfolio",       icon: LayoutDashboard },
      { href: "/dashboard/events",      label: "Eventos",         icon: CalendarDays },
      { href: "/dashboard/inspections", label: "Inspecciones",    icon: ClipboardCheck },
      { href: "/dashboard/notifications",label: "Notificaciones", icon: Bell },
    ],
  },
  {
    group: "WorkTrac",
    items: [
      { href: "/worktrac/propiedades",   label: "Propiedades",   icon: Building2 },
      { href: "/worktrac/transacciones", label: "Transacciones", icon: FolderKanban },
      { href: "/worktrac/proyectos",     label: "Proyectos",     icon: FileText },
      { href: "/worktrac/finanzas",      label: "Finanzas",      icon: DollarSign },
      { href: "/worktrac/jobs",          label: "Jobs",          icon: Briefcase },
      { href: "/worktrac/tickets",       label: "Tickets",       icon: Ticket },
      { href: "/worktrac/savings",       label: "Savings",       icon: PiggyBank },
    ],
  },
  {
    group: "Análisis",
    items: [
      { href: "/analytics/benchmarking", label: "Benchmarking",  icon: BarChart2 },
      { href: "/analytics/environmental",label: "Ambiental",     icon: Leaf },
    ],
  },
  {
    group: "Equipo",
    items: [
      { href: "/equipo/discusiones",     label: "Discusiones",   icon: MessageSquare },
      { href: "/equipo/documentos",      label: "Documentos",    icon: Paperclip },
      { href: "/equipo/notas",           label: "Notas",         icon: StickyNote },
    ],
  },
  {
    group: "Administración",
    items: [
      { href: "/admin/usuarios",         label: "Usuarios",      icon: Users },
      { href: "/admin/unidades",         label: "Países",        icon: Globe },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#001a4e] flex flex-col shrink-0 overflow-y-auto">
      <div className="px-6 py-5 border-b border-[#003087]/60 shrink-0">
        <span className="text-white font-bold text-lg tracking-tight">
          Colliers<span className="text-blue-400">360</span>
        </span>
        <span className="block text-xs text-blue-300 mt-0.5">LATAM Platform</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="px-3 mb-1 text-[10px] uppercase tracking-widest font-semibold text-blue-400/60">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                      active
                        ? "bg-[#003087] text-white shadow-sm"
                        : "text-blue-200/80 hover:bg-[#003087]/50 hover:text-white"
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-[#003087]/60 shrink-0">
        <Link
          href="/support"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-blue-300/70 hover:text-white hover:bg-[#003087]/50 transition"
        >
          <HelpCircle size={13} />
          Soporte
        </Link>
      </div>
    </aside>
  );
}
