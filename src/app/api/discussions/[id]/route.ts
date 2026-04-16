import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const UpdateSchema = z.object({
  title:  z.string().optional(),
  body:   z.string().optional(),
  pinned: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const discussion = await prisma.discussion.findUnique({
    where: { id },
    include: {
      comments: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!discussion) return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  return NextResponse.json(discussion);
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

  // Solo ADMIN puede fijar/desfijar discusiones
  if (typeof parsed.data.pinned !== "undefined") {
    const { error: adminErr } = await requireAuth("ADMIN");
    if (adminErr) return adminErr;
  }

  const discussion = await prisma.discussion.findUnique({ where: { id } });
  if (!discussion) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  // Solo el autor o ADMIN puede editar contenido
  const canEdit = discussion.authorId === session!.user.id || ["ADMIN","SUPER_ADMIN"].includes(session!.user.role);
  if (!canEdit) return NextResponse.json({ message: "Sin permisos" }, { status: 403 });

  const updated = await prisma.discussion.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.discussion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
