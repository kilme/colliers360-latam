import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const UpdateSchema = z.object({
  name:        z.string().min(1).optional(),
  address:     z.string().optional(),
  city:        z.string().optional(),
  country:     z.string().length(2).optional(),
  type:        z.enum(["OFICINA","INDUSTRIAL","RETAIL","BODEGA","MIXTO","OTRO"]).optional(),
  status:      z.enum(["DISPONIBLE","OCUPADO","EN_NEGOCIACION","INACTIVO"]).optional(),
  totalAreaM2: z.number().positive().optional(),
  floors:      z.number().int().positive().optional(),
  lat:         z.number().optional(),
  lng:         z.number().optional(),
  notes:       z.string().optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, organizationId: session!.user.organizationId },
    include: {
      broker:       { select: { id: true, name: true, email: true, avatarUrl: true } },
      businessUnit: { select: { id: true, name: true, country: true } },
      leases:       { orderBy: { startDate: "desc" } },
      documents:    { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!property) return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  return NextResponse.json(property);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;

  const { id } = await params;
  const body   = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await prisma.property.findFirst({
    where: { id, organizationId: session!.user.organizationId },
  });
  if (!existing) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  const updated = await prisma.property.update({
    where: { id },
    data:  parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.property.findFirst({
    where: { id, organizationId: session!.user.organizationId },
  });
  if (!existing) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
