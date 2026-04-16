import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { uploadedBy: { select: { id: true, name: true } } },
  });

  if (!doc) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  // Generar signed URL de descarga (válido 60 min)
  const storage    = new Storage();
  const bucketName = process.env.GCS_BUCKET_NAME!;
  const gcsPath    = doc.url.replace(`https://storage.googleapis.com/${bucketName}/`, "");

  const [signedUrl] = await storage
    .bucket(bucketName)
    .file(gcsPath)
    .getSignedUrl({ action: "read", expires: Date.now() + 60 * 60 * 1000 });

  return NextResponse.json({ ...doc, downloadUrl: signedUrl });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("BROKER");
  if (error) return error;

  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id, organizationId: session!.user.organizationId },
  });
  if (!doc) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  // Solo el autor o ADMIN pueden eliminar
  const canDelete = doc.uploadedById === session!.user.id || ["ADMIN","SUPER_ADMIN"].includes(session!.user.role);
  if (!canDelete) return NextResponse.json({ message: "Sin permisos" }, { status: 403 });

  // Eliminar de GCS
  try {
    const storage    = new Storage();
    const bucketName = process.env.GCS_BUCKET_NAME!;
    const gcsPath    = doc.url.replace(`https://storage.googleapis.com/${bucketName}/`, "");
    await storage.bucket(bucketName).file(gcsPath).delete();
  } catch { /* archivo ya no existe en GCS */ }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
