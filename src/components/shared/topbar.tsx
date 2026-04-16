"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
  user: Session["user"];
}

export function TopBar({ user }: TopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <span className="w-7 h-7 rounded-full bg-[#003087] text-white flex items-center justify-center text-xs font-bold">
              {user.name?.[0] ?? "U"}
            </span>
          )}
          <span>{user.name}</span>
          <ChevronDown size={14} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 mt-0.5 capitalize">{user.role?.toLowerCase()}</p>
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
