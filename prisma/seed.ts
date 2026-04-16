import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Colliers360 LATAM...");

  // ─── ORGANIZACIÓN ─────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where:  { slug: "colliers-latam" },
    update: {},
    create: {
      name:    "Colliers International LATAM",
      slug:    "colliers-latam",
      logoUrl: "https://storage.googleapis.com/colliers360-latam-docs/logo.png",
    },
  });
  console.log("✓ Organization:", org.name);

  // ─── UNIDADES DE NEGOCIO ──────────────────────────────────────────────────
  const countries = [
    { name: "Colliers México",   country: "MX", currency: "MXN" },
    { name: "Colliers Colombia", country: "CO", currency: "COP" },
    { name: "Colliers Chile",    country: "CL", currency: "CLP" },
    { name: "Colliers Perú",     country: "PE", currency: "PEN" },
    { name: "Colliers Argentina",country: "AR", currency: "ARS" },
  ];

  const bus: Record<string, string> = {};
  for (const c of countries) {
    const bu = await prisma.businessUnit.upsert({
      where:  { id: `seed-bu-${c.country}` },
      update: { name: c.name, country: c.country, currency: c.currency },
      create: { id: `seed-bu-${c.country}`, ...c, organizationId: org.id },
    });
    bus[c.country] = bu.id;
    console.log(`  ✓ BU: ${bu.name}`);
  }

  // ─── USUARIOS ─────────────────────────────────────────────────────────────
  const users = [
    { id: "seed-user-sa",  email: "admin@colliers.com",      name: "Admin LATAM",       role: "SUPER_ADMIN" as const, buId: null },
    { id: "seed-user-mx1", email: "gerente.mx@colliers.com", name: "Carlos Mendoza",    role: "MANAGER"     as const, buId: bus["MX"] },
    { id: "seed-user-mx2", email: "broker.mx@colliers.com",  name: "Sofía Ramírez",     role: "BROKER"      as const, buId: bus["MX"] },
    { id: "seed-user-co1", email: "gerente.co@colliers.com", name: "Valentina Torres",  role: "MANAGER"     as const, buId: bus["CO"] },
    { id: "seed-user-co2", email: "broker.co@colliers.com",  name: "Andrés Gómez",      role: "BROKER"      as const, buId: bus["CO"] },
    { id: "seed-user-cl1", email: "broker.cl@colliers.com",  name: "Francisca Vargas",  role: "BROKER"      as const, buId: bus["CL"] },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: {
        id:             u.id,
        email:          u.email,
        name:           u.name,
        role:           u.role,
        status:         "ACTIVE",
        organizationId: org.id,
        businessUnitId: u.buId,
      },
    });
  }
  console.log(`✓ Users: ${users.length} creados`);

  // ─── PROPIEDADES ──────────────────────────────────────────────────────────
  const properties = [
    {
      id: "seed-prop-1", name: "Torre Reforma 265", address: "Paseo de la Reforma 265",
      city: "Ciudad de México", country: "MX", type: "OFICINA" as const,
      status: "OCUPADO" as const, totalAreaM2: 12000, floors: 22,
      businessUnitId: bus["MX"], brokerId: "seed-user-mx2",
    },
    {
      id: "seed-prop-2", name: "Parque Industrial Lerma", address: "Blvd. Miguel Hidalgo Km 23",
      city: "Toluca", country: "MX", type: "INDUSTRIAL" as const,
      status: "DISPONIBLE" as const, totalAreaM2: 35000, floors: 1,
      businessUnitId: bus["MX"], brokerId: "seed-user-mx2",
    },
    {
      id: "seed-prop-3", name: "Centro Empresarial El Dorado", address: "Calle 50 #10-45",
      city: "Bogotá", country: "CO", type: "OFICINA" as const,
      status: "EN_NEGOCIACION" as const, totalAreaM2: 8500, floors: 15,
      businessUnitId: bus["CO"], brokerId: "seed-user-co2",
    },
    {
      id: "seed-prop-4", name: "Parque Araucano Office", address: "Av. Manquehue Norte 1500",
      city: "Santiago", country: "CL", type: "OFICINA" as const,
      status: "DISPONIBLE" as const, totalAreaM2: 6200, floors: 10,
      businessUnitId: bus["CL"], brokerId: "seed-user-cl1",
    },
  ];

  for (const p of properties) {
    await prisma.property.upsert({
      where:  { id: p.id },
      update: {},
      create: { ...p, organizationId: org.id },
    });
  }
  console.log(`✓ Properties: ${properties.length} creadas`);

  // ─── CONTRATOS ────────────────────────────────────────────────────────────
  const now = new Date();
  const leases = [
    {
      id: "seed-lease-1", propertyId: "seed-prop-1", businessUnitId: bus["MX"],
      tenant: "Grupo Financiero Banorte", startDate: new Date("2023-01-01"),
      endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // vence en 45 días
      areaM2: 5000, rentAmount: 850000, currency: "MXN", status: "ACTIVO" as const,
    },
    {
      id: "seed-lease-2", propertyId: "seed-prop-1", businessUnitId: bus["MX"],
      tenant: "Deloitte México", startDate: new Date("2022-06-01"),
      endDate: new Date("2027-05-31"),
      areaM2: 4500, rentAmount: 765000, currency: "MXN", status: "ACTIVO" as const,
    },
    {
      id: "seed-lease-3", propertyId: "seed-prop-3", businessUnitId: bus["CO"],
      tenant: "PwC Colombia", startDate: new Date("2024-03-01"),
      endDate: new Date("2026-02-28"),
      areaM2: 3200, rentAmount: 45000000, currency: "COP", status: "ACTIVO" as const,
    },
  ];

  for (const l of leases) {
    await prisma.lease.upsert({
      where:  { id: l.id },
      update: {},
      create: l,
    });
  }
  console.log(`✓ Leases: ${leases.length} creados`);

  // ─── TRANSACCIONES ────────────────────────────────────────────────────────
  const transactions = [
    {
      id: "seed-tx-1", title: "Arrendamiento Torre Reforma Piso 8",
      type: "ARRENDAMIENTO" as const, status: "EN_NEGOCIACION" as const,
      businessUnitId: bus["MX"], brokerId: "seed-user-mx2",
      value: 12000000, currency: "MXN", expectedClose: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: "seed-tx-2", title: "Venta Parque Industrial Lerma - Nave A",
      type: "VENTA" as const, status: "EN_REVISION" as const,
      businessUnitId: bus["MX"], brokerId: "seed-user-mx2", assigneeId: "seed-user-mx1",
      value: 250000000, currency: "MXN",
    },
    {
      id: "seed-tx-3", title: "Renovación PwC Colombia",
      type: "RENOVACION" as const, status: "PROSPECTO" as const,
      businessUnitId: bus["CO"], brokerId: "seed-user-co2",
      value: 180000000, currency: "COP",
    },
    {
      id: "seed-tx-4", title: "Expansión Deloitte Piso 5-6",
      type: "EXPANSION" as const, status: "CERRADO" as const,
      businessUnitId: bus["MX"], brokerId: "seed-user-mx2",
      value: 8500000, currency: "MXN", closedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const t of transactions) {
    await prisma.transaction.upsert({
      where:  { id: t.id },
      update: {},
      create: t,
    });
  }
  console.log(`✓ Transactions: ${transactions.length} creadas`);

  // ─── PROYECTOS ────────────────────────────────────────────────────────────
  const proj = await prisma.project.upsert({
    where:  { id: "seed-proj-1" },
    update: {},
    create: {
      id: "seed-proj-1",
      title: "Refitting Piso 8 Torre Reforma",
      description: "Adecuación de espacio para nuevo inquilino. Incluye demolición de tabiques, instalación eléctrica y acabados.",
      status: "EN_CURSO",
      businessUnitId: bus["MX"], managerId: "seed-user-mx1",
      startDate: new Date("2026-03-01"), dueDate: new Date("2026-05-31"),
      budget: 3500000, currency: "MXN",
    },
  });

  const tasks = [
    { title: "Planos de distribución aprobados", done: true  },
    { title: "Demolición de tabiques",           done: true  },
    { title: "Instalación sistema eléctrico",    done: false },
    { title: "Climatización y AC",               done: false },
    { title: "Acabados y pintura",               done: false },
    { title: "Inspección final y entrega",       done: false },
  ];

  for (let i = 0; i < tasks.length; i++) {
    await prisma.projectTask.upsert({
      where:  { id: `seed-task-${i + 1}` },
      update: {},
      create: { id: `seed-task-${i + 1}`, projectId: proj.id, ...tasks[i], order: i },
    });
  }
  console.log(`✓ Project: ${proj.title}`);

  // ─── DISCUSIONES ──────────────────────────────────────────────────────────
  const disc = await prisma.discussion.upsert({
    where:  { id: "seed-disc-1" },
    update: {},
    create: {
      id: "seed-disc-1",
      title:  "Estrategia Q2 2026 – Portafolio MX",
      body:   "Comparto el análisis de oportunidades identificadas para el Q2. La demanda de oficinas clase A en CDMX se mantiene estable con absorción positiva en Reforma y Polanco. Propongo priorizar el seguimiento a los prospectos de Torre Reforma y avanzar en la negociación del Piso 8.",
      businessUnitId: bus["MX"], authorId: "seed-user-mx1", pinned: true,
    },
  });

  await prisma.comment.upsert({
    where:  { id: "seed-comment-1" },
    update: {},
    create: {
      id: "seed-comment-1",
      body:        "Totalmente de acuerdo. Además, el inquilino de Piso 8 ya confirmó que quiere avanzar esta semana. Los mando el term sheet para revisión.",
      discussionId: disc.id, authorId: "seed-user-mx2",
    },
  });
  console.log(`✓ Discussion: ${disc.title}`);

  console.log("\n✅ Seed completo.");
  console.log("   Super Admin: admin@colliers.com");
  console.log("   Gerente MX:  gerente.mx@colliers.com");
  console.log("   Broker MX:   broker.mx@colliers.com");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
