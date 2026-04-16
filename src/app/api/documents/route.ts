import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Storage } from "@google-cloud/storage";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

const UploadSchema = z.object({
  name:          z.string().min(1),
  mimeType:      z.string(),
  sizeBytes:     z.number().int().positive(),
  context:       z.enum(["PROPIEDAD","CONTRATO","TRANSACCION","PROYECTO","EQUIPO","OTRO"]).default("OTRO"),
  propertyId:    z.string().optional(),
  leaseId:       z.string().optional(),
  transactionId: z.string().optional(),
  projectId:     z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const context     = searchParams.get("context") ?? undefined;
  const propertyId  = searchParams.get("propertyId") ?? undefined;
  const leaseId     = searchParams.get("leaseId") ?? undefined;
  const transactionId = searchParams.get("transactionId") ?? undefined;
  const projectId   = searchParams.get("projectId") ?? undefined;

  const documents = await prisma.document.findMany({
    where: {
      organizationId: session!.user.organizationId,
      ...(context     ? { context: context as never } : {}),
      ...(propertyId  ? { propertyId } : {}),
      ...(leaseId     ? { leaseId } : {}),
      ...(transactionId ? { transactionId } : {}),
      ...(projectId   ? { projectId } : {}),
    },
    include: {
      uploadedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;

  const body   = await req.json();
  const parsed = UploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Datos inválidos", errors: parsed.error.flatten() }, { status: 422 });
  }

  const bucketName  = process.env.GCS_BUCKET_NAME!;
  const storage     = new Storage();
  const bucket      = storage.bucket(bucketName);
  const gcsPath     = `${session!.user.organizationId}/${Date.now()}-${parsed.data.name.replace(/\s+/g, "_")}`;
  const file        = bucket.file(gcsPath);

  // Generar signed URL para que el cliente haga PUT directamente a GCS
  const [signedUrl] = await file.generateSignedPostPolicyV4({
    expires: Date.now() + 15 * 60 * 1000, // 15 min
    conditions: [
      ["content-length-range", 0, 100 * 1024 * 1024], // max 100 MB
    ],
    fields: { "Content-Type": parsed.data.mimeType },
  });

  // Guardar metadatos en BD (la URL pública se construye con gcsPath)
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsPath}`;
  const document  = await prisma.document.create({
    data: {
      name:           parsed.data.name,
      url:            publicUrl,
      mimeType:       parsed.data.mimeType,
      sizeBytes:      parsed.data.sizeBytes,
      context:        parsed.data.context,
      organizationId: session!.user.organizationId,
      uploadedById:   session!.user.id,
      propertyId:     parsed.data.propertyId,
      leaseId:        parsed.data.leaseId,
      transactionId:  parsed.data.transactionId,
      projectId:      parsed.data.projectId,
    },
  });

  return NextResponse.json({ document, uploadUrl: signedUrl }, { status: 201 });
}
