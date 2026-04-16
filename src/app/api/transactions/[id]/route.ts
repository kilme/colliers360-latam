import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const UpdateSchema = z.object({
  title:         z.string().optional(),
  type:          z.enum(["ARRENDAMIENTO","VENTA","RENOVACION","EXPANSION","DISPOSICION"]).optional(),
  status:        z.enum(["PROSPECTO","EN_NEGOCIACION","EN_REVISION","APROBADO","CERRADO","CANCELADO"]).optional(),
  value:         z.number().nonnegative().optional(),
  currency:      z.string().optional(),
  assigneeId:    z.string().optional().nullable(),
  expectedClose: z.string().datetime().optional().nullable(),
  notes:         z.string().optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: {
      broker:   { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      documents: { orderBy: { createdAt: "desc" } },
      workflow:  {
        include: {
          step: true,
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!tx) return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  return NextResponse.json(tx);
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

  // Cerrar/aprobar requiere MANAGER+
  if (["APROBADO","CERRADO"].includes(parsed.data.status ?? "")) {
    const { error: permErr } = await requireAuth("MANAGER");
    if (permErr) return permErr;
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.expectedClose) data.expectedClose = new Date(parsed.data.expectedClose);
  if (parsed.data.status === "CERRADO") data.closedAt = new Date();

  const updated = await prisma.transaction.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
