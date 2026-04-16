import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

export type ApiSession = Awaited<ReturnType<typeof getServerSession>> & NonNullable<unknown>;

export async function requireAuth(minRole?: UserRole) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: NextResponse.json({ message: "No autenticado" }, { status: 401 }), session: null };
  }

  const ROLE_RANK: Record<UserRole, number> = {
    SUPER_ADMIN: 5, ADMIN: 4, MANAGER: 3, BROKER: 2, READONLY: 1,
  };

  if (minRole && ROLE_RANK[session.user.role] < ROLE_RANK[minRole]) {
    return { error: NextResponse.json({ message: "Sin permisos suficientes" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}

export function buFilter(session: NonNullable<ApiSession>) {
  if (session.user.role === "SUPER_ADMIN") return {};
  return { businessUnitId: session.user.businessUnitId ?? undefined };
}
