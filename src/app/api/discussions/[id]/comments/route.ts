import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const CreateSchema = z.object({ body: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;

  const { id: discussionId } = await params;
  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const comment = await prisma.comment.create({
    data: { body: parsed.data.body, discussionId, authorId: session!.user.id },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  });

  // Actualizar updatedAt de la discusión para que suba al top
  await prisma.discussion.update({ where: { id: discussionId }, data: { updatedAt: new Date() } });

  return NextResponse.json(comment, { status: 201 });
}
