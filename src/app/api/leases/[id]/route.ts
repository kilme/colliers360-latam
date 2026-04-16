import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const UpdateSchema = z.object({
  tenant:      z.string().optional(),
  startDate:   z.string().datetime().optional(),
  endDate:     z.string().datetime().optional(),
  renewalDate: z.string().datetime().optional().nullable(),
  areaM2:      z.number().positive().optional(),
  rentAmount:  z.number().nonnegative().optional(),
  currency:    z.string().optional(),
  status:      z.enum(["ACTIVO","VENCIDO","EN_RENOVACION","CANCELADO"]).optional(),
  terms:       z.string().optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      property:   { select: { id: true, name: true, city: true } },
      documents:  { orderBy: { createdAt: "desc" } },
      financials: { orderBy: { period: "asc" } },
    },
  });

  if (!lease) return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  return NextResponse.json(lease);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("BROKER");
  if (error) return error;

  const { id } = await params;
  const body   = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startDate) data.startDate = new Date(parsed.data.startDate);
  if (parsed.data.endDate)   data.endDate   = new Date(parsed.data.endDate);
  if (parsed.data.renewalDate) data.renewalDate = new Date(parsed.data.renewalDate);

  const updated = await prisma.lease.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.lease.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
