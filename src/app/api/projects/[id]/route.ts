import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const UpdateSchema = z.object({
  title:       z.string().optional(),
  description: z.string().optional(),
  status:      z.enum(["PLANIFICACION","EN_CURSO","EN_REVISION","COMPLETADO","CANCELADO"]).optional(),
  startDate:   z.string().datetime().optional().nullable(),
  dueDate:     z.string().datetime().optional().nullable(),
  budget:      z.number().nonnegative().optional(),
  currency:    z.string().optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      manager:  { select: { id: true, name: true, avatarUrl: true } },
      tasks:    { orderBy: { order: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("MANAGER");
  if (error) return error;

  const { id } = await params;
  const body   = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startDate) data.startDate = new Date(parsed.data.startDate);
  if (parsed.data.dueDate)   data.dueDate   = new Date(parsed.data.dueDate);
  if (parsed.data.status === "COMPLETADO") data.completedAt = new Date();

  const updated = await prisma.project.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
