import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, buFilter } from "@/lib/api";

const CreateSchema = z.object({
  title:          z.string().min(1),
  type:           z.enum(["ARRENDAMIENTO","VENTA","RENOVACION","EXPANSION","DISPOSICION"]),
  businessUnitId: z.string().min(1),
  propertyId:     z.string().optional(),
  assigneeId:     z.string().optional(),
  value:          z.number().nonnegative().optional(),
  currency:       z.string().default("USD"),
  expectedClose:  z.string().datetime().optional(),
  notes:          z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const type   = searchParams.get("type") ?? undefined;

  const transactions = await prisma.transaction.findMany({
    where: {
      ...buFilter(session!),
      ...(status ? { status: status as never } : {}),
      ...(type   ? { type:   type   as never } : {}),
    },
    include: {
      broker:   { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      ...parsed.data,
      brokerId:      session!.user.id,
      expectedClose: parsed.data.expectedClose ? new Date(parsed.data.expectedClose) : undefined,
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
