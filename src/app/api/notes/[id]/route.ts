import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, buFilter } from "@/lib/api";

const Schema = z.object({
  title:  z.string().min(1).optional(),
  body:   z.string().min(1).optional(),
  pinned: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  const note = await prisma.note.updateMany({
    where: { id, ...buFilter(session!) },
    data: parsed.data,
  });
  return NextResponse.json(note);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;
  const { id } = await params;
  await prisma.note.deleteMany({ where: { id, ...buFilter(session!) } });
  return new NextResponse(null, { status: 204 });
}
