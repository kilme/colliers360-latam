import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, buFilter } from "@/lib/api";

const CreateSchema = z.object({
  title:          z.string().min(1),
  description:    z.string().optional(),
  businessUnitId: z.string().min(1),
  startDate:      z.string().datetime().optional(),
  dueDate:        z.string().datetime().optional(),
  budget:         z.number().nonnegative().optional(),
  currency:       z.string().default("USD"),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const projects = await prisma.project.findMany({
    where: {
      ...buFilter(session!),
      ...(status ? { status: status as never } : {}),
    },
    include: {
      manager: { select: { id: true, name: true } },
      _count:  { select: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("MANAGER");
  if (error) return error;

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      managerId:  session!.user.id,
      startDate:  parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      dueDate:    parsed.data.dueDate   ? new Date(parsed.data.dueDate)   : undefined,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
