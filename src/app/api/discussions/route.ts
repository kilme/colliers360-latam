import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, buFilter } from "@/lib/api";

const CreateSchema = z.object({
  title:          z.string().min(1).max(200),
  body:           z.string().min(1),
  businessUnitId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const discussions = await prisma.discussion.findMany({
    where: buFilter(session!),
    include: {
      _count: { select: { comments: true } },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(discussions);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const discussion = await prisma.discussion.create({
    data: { ...parsed.data, authorId: session!.user.id },
  });

  return NextResponse.json(discussion, { status: 201 });
}
