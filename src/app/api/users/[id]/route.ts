import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/api";

const UpdateSchema = z.object({
  name:           z.string().optional(),
  role:           z.enum(["ADMIN","MANAGER","BROKER","READONLY"]).optional(),
  status:         z.enum(["ACTIVE","INACTIVE"]).optional(),
  businessUnitId: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  const body   = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const user = await prisma.user.findFirst({
    where: { id, organizationId: session!.user.organizationId },
  });
  if (!user) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  const updated = await prisma.user.update({ where: { id }, data: parsed.data });

  // Sincronizar nombre en Firebase si se actualizó
  if (parsed.data.name && user.firebaseUid) {
    await adminAuth.updateUser(user.firebaseUid, { displayName: parsed.data.name }).catch(() => null);
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("SUPER_ADMIN");
  if (error) return error;

  const { id } = await params;
  const user = await prisma.user.findFirst({
    where: { id, organizationId: session!.user.organizationId },
  });
  if (!user) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  if (user.firebaseUid) {
    await adminAuth.deleteUser(user.firebaseUid).catch(() => null);
  }
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
