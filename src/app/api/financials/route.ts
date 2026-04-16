import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const CreateSchema = z.object({
  leaseId:  z.string().min(1),
  period:   z.string().datetime(),
  amount:   z.number().positive(),
  currency: z.string().default("USD"),
  notes:    z.string().optional(),
});

const MarkPaidSchema = z.object({
  id:     z.string(),
  paid:   z.boolean(),
  paidAt: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const leaseId = searchParams.get("leaseId") ?? undefined;
  const buId    = searchParams.get("businessUnitId") ?? undefined;
  const paid    = searchParams.get("paid");

  const financials = await prisma.financial.findMany({
    where: {
      ...(leaseId ? { leaseId } : {}),
      ...(buId    ? { lease: { businessUnitId: buId } } : {}),
      ...(paid !== null ? { paid: paid === "true" } : {}),
    },
    include: {
      lease: { select: { id: true, tenant: true, property: { select: { name: true } } } },
    },
    orderBy: { period: "desc" },
  });

  return NextResponse.json(financials);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("MANAGER");
  if (error) return error;

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const financial = await prisma.financial.create({
    data: { ...parsed.data, period: new Date(parsed.data.period) },
  });

  return NextResponse.json(financial, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAuth("MANAGER");
  if (error) return error;

  const body   = await req.json();
  const parsed = MarkPaidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await prisma.financial.update({
    where: { id: parsed.data.id },
    data: {
      paid:   parsed.data.paid,
      paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : (parsed.data.paid ? new Date() : null),
    },
  });

  return NextResponse.json(updated);
}
