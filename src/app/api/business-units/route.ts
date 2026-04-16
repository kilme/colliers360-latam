import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const CreateSchema = z.object({
  name:     z.string().min(1),
  country:  z.string().length(2),
  currency: z.string().length(3).default("USD"),
});

export async function GET(_: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const bus = await prisma.businessUnit.findMany({
    where: {
      organizationId: session!.user.organizationId,
      ...(session!.user.role !== "SUPER_ADMIN"
        ? { id: session!.user.businessUnitId ?? undefined }
        : {}),
    },
    include: { _count: { select: { users: true, properties: true } } },
    orderBy: { country: "asc" },
  });

  return NextResponse.json(bus);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("SUPER_ADMIN");
  if (error) return error;

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const bu = await prisma.businessUnit.create({
    data: { ...parsed.data, organizationId: session!.user.organizationId },
  });

  return NextResponse.json(bu, { status: 201 });
}
