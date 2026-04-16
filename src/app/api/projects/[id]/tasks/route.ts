import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const CreateSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
  dueDate:     z.string().datetime().optional(),
  order:       z.number().int().default(0),
});

const UpdateSchema = z.object({
  taskId:      z.string(),
  done:        z.boolean().optional(),
  title:       z.string().optional(),
  description: z.string().optional(),
  dueDate:     z.string().datetime().optional().nullable(),
  order:       z.number().int().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("BROKER");
  if (error) return error;

  const { id: projectId } = await params;
  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const task = await prisma.projectTask.create({
    data: {
      ...parsed.data,
      projectId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
  });

  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("BROKER");
  if (error) return error;

  const body   = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const { taskId, ...data } = parsed.data;
  const updated = await prisma.projectTask.update({
    where: { id: taskId },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });

  return NextResponse.json(updated);
}
