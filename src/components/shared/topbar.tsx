"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { LogOut, ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface TopBarProps {
  user: Session["user"];
  businessUnits?: { id: string; name: string; country: string }[];
}

export function TopBar({ user, businessUnits = [] }: TopBarProps) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [buOpen, setBuOpen]       = useState(false);
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();
  const activeBuId   = searchParams.get("bu") ?? "";

  const activeBu = businessUnits.find(b => b.id === activeBuId);

  function selectBu(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("bu", id);
    else params.delete("bu");
    router.push(`${pathname}?${params.toString()}`);
    setBuOpen(false);
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* BU Selector (solo SUPER_ADMIN) */}
      {businessUnits.length > 0 ? (
        <div className="relative">
          <button
            onClick={() => setBuOpen(!buOpen)}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#003087]/40 transition"
          >
            <Globe size={14} className="text-[#003087]" />
            <span className="font-medium">{activeBu ? activeBu.name : "Todas las unidades"}</span>
            <ChevronDown size={13} />
          </button>

          {buOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => selectBu("")}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!activeBuId ? "font-semibold text-[#003087]" : "text-gray-700"}`}
              >
                Todas las unidades
              </button>
              <div className="border-t border-gray-100 my-1" />
              {businessUnits.map(bu => (
                <button
                  key={bu.id}
                  onClick={() => selectBu(bu.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${activeBuId === bu.id ? "font-semibold text-[#003087]" : "text-gray-700"}`}
                >
                  <span>{bu.name}</span>
                  <span className="text-xs text-gray-400">{bu.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div />
      )}

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <span className="w-7 h-7 rounded-full bg-[#003087] text-white flex items-center justify-center text-xs font-bold">
              {user.name?.[0] ?? "U"}
            </span>
          )}
          <span>{user.name}</span>
          <ChevronDown size={14} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 mt-0.5 capitalize">{user.role?.toLowerCase().replace("_"," ")}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
