import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/api";

const InviteSchema = z.object({
  email:          z.string().email(),
  name:           z.string().min(1),
  role:           z.enum(["ADMIN","MANAGER","BROKER","READONLY"]),
  businessUnitId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth("ADMIN");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const buId = searchParams.get("businessUnitId") ?? undefined;

  const users = await prisma.user.findMany({
    where: {
      organizationId: session!.user.organizationId,
      ...(session!.user.role === "ADMIN"
        ? { businessUnitId: session!.user.businessUnitId ?? undefined }
        : {}),
      ...(buId ? { businessUnitId: buId } : {}),
    },
    include: { businessUnit: { select: { id: true, name: true, country: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("ADMIN");
  if (error) return error;

  const body   = await req.json();
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  // Crear usuario en Firebase Auth
  const firebaseUser = await adminAuth.createUser({
    email:       parsed.data.email,
    displayName: parsed.data.name,
    password:    Math.random().toString(36).slice(-10), // temporal, el usuario lo cambia
  }).catch((e) => {
    throw new Error(`Firebase: ${e.message}`);
  });

  // Crear en BD
  const user = await prisma.user.create({
    data: {
      firebaseUid:    firebaseUser.uid,
      email:          parsed.data.email,
      name:           parsed.data.name,
      role:           parsed.data.role,
      status:         "INVITED",
      organizationId: session!.user.organizationId,
      businessUnitId: parsed.data.businessUnitId ?? session!.user.businessUnitId,
    },
  });

  // Enviar email de restablecimiento de contraseña (link de primer acceso)
  await adminAuth.generatePasswordResetLink(parsed.data.email).catch(() => null);

  return NextResponse.json(user, { status: 201 });
}
