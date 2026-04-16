import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const UpdateSchema = z.object({
  name:     z.string().optional(),
  country:  z.string().length(2).optional(),
  currency: z.string().length(3).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("SUPER_ADMIN");
  if (error) return error;

  const { id } = await params;
  const body   = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await prisma.businessUnit.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("SUPER_ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.businessUnit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
