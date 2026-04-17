import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, buFilter } from "@/lib/api";

const Schema = z.object({
  title:  z.string().min(1),
  body:   z.string().min(1),
  pinned: z.boolean().optional(),
});

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;
  const filter = buFilter(session!);
  const notes = await prisma.note.findMany({
    where: filter,
    include: { author: { select: { name: true } } },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  const note = await prisma.note.create({
    data: {
      ...parsed.data,
      authorId:      session!.user.id,
      businessUnitId: session!.user.businessUnitId ?? "",
    },
  });
  return NextResponse.json(note, { status: 201 });
}
