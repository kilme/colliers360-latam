import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, buFilter } from "@/lib/api";

const CreateSchema = z.object({
  name:          z.string().min(1),
  address:       z.string().min(1),
  city:          z.string().min(1),
  country:       z.string().length(2),
  type:          z.enum(["OFICINA","INDUSTRIAL","RETAIL","BODEGA","MIXTO","OTRO"]),
  status:        z.enum(["DISPONIBLE","OCUPADO","EN_NEGOCIACION","INACTIVO"]).optional(),
  totalAreaM2:   z.number().positive().optional(),
  floors:        z.number().int().positive().optional(),
  lat:           z.number().optional(),
  lng:           z.number().optional(),
  notes:         z.string().optional(),
  businessUnitId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const type    = searchParams.get("type") ?? undefined;
  const status  = searchParams.get("status") ?? undefined;
  const search  = searchParams.get("q") ?? undefined;

  const properties = await prisma.property.findMany({
    where: {
      ...buFilter(session!),
      organizationId: session!.user.organizationId,
      ...(type   ? { type:   type   as never } : {}),
      ...(status ? { status: status as never } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    include: {
      broker:      { select: { id: true, name: true, avatarUrl: true } },
      businessUnit: { select: { id: true, name: true, country: true } },
      _count:      { select: { leases: true, documents: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(properties);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const property = await prisma.property.create({
    data: {
      ...parsed.data,
      organizationId: session!.user.organizationId,
      brokerId:       session!.user.id,
    },
  });

  return NextResponse.json(property, { status: 201 });
}
