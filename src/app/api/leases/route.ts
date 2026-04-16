import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, buFilter } from "@/lib/api";

const CreateSchema = z.object({
  propertyId:    z.string().min(1),
  businessUnitId: z.string().min(1),
  tenant:        z.string().min(1),
  startDate:     z.string().datetime(),
  endDate:       z.string().datetime(),
  renewalDate:   z.string().datetime().optional(),
  areaM2:        z.number().positive(),
  rentAmount:    z.number().nonnegative(),
  currency:      z.string().default("USD"),
  status:        z.enum(["ACTIVO","VENCIDO","EN_RENOVACION","CANCELADO"]).optional(),
  terms:         z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId") ?? undefined;
  const expiring   = searchParams.get("expiring") === "true";

  const now    = new Date();
  const in90   = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const leases = await prisma.lease.findMany({
    where: {
      ...buFilter(session!),
      ...(propertyId ? { propertyId } : {}),
      ...(expiring   ? { endDate: { gte: now, lte: in90 }, status: "ACTIVO" } : {}),
    },
    include: {
      property: { select: { id: true, name: true, city: true } },
    },
    orderBy: { endDate: "asc" },
  });

  return NextResponse.json(leases);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const lease = await prisma.lease.create({
    data: {
      ...parsed.data,
      startDate:   new Date(parsed.data.startDate),
      endDate:     new Date(parsed.data.endDate),
      renewalDate: parsed.data.renewalDate ? new Date(parsed.data.renewalDate) : undefined,
    },
  });

  return NextResponse.json(lease, { status: 201 });
}
