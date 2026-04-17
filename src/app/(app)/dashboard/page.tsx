import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bu?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { bu: buParam } = await searchParams;

  // SUPER_ADMIN puede filtrar vía ?bu=; otros roles usan su propia BU
  const buId =
    session!.user.role === "SUPER_ADMIN"
      ? buParam || undefined
      : session!.user.businessUnitId ?? undefined;

  const buFilter = buId ? { businessUnitId: buId } : {};
  const orgFilter = { organizationId: session!.user.organizationId };

  const now = new Date();

  const [properties, leases, transactions, projects] = await Promise.all([
    prisma.property.findMany({
      where: { ...buFilter, ...orgFilter },
      select: { id: true, name: true, lat: true, lng: true, type: true, totalAreaM2: true, city: true, country: true },
    }),
    prisma.lease.findMany({
      where: { ...buFilter, status: "ACTIVO" },
      select: {
        id: true, tenant: true, startDate: true, endDate: true,
        areaM2: true, rentAmount: true, marketRent: true, landlord: true,
        currency: true, propertyId: true,
        property: { select: { name: true } },
      },
    }),
    prisma.transaction.count({ where: { ...buFilter, status: { notIn: ["CERRADO","CANCELADO"] } } }),
    prisma.project.count({ where: { ...buFilter, status: { notIn: ["COMPLETADO","CANCELADO"] } } }),
  ]);

  // ─── KPIs ────────────────────────────────────────────────────────────────────
  const totalArea = properties.reduce((s, p) => s + (p.totalAreaM2 ?? 0), 0);
  const leasedArea = leases.reduce((s, l) => s + l.areaM2, 0);
  const occupancyRate = totalArea > 0 ? (leasedArea / totalArea) * 100 : 0;
  const annualRent = leases.reduce((s, l) => s + l.rentAmount * 12, 0);
  const currency = leases[0]?.currency ?? "USD";

  // WAULT – weighted average unexpired lease term (years)
  const wault =
    leases.length > 0
      ? leases.reduce((sum, l) => {
          const unexpiredYears = Math.max(
            0,
            (new Date(l.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          );
          return sum + unexpiredYears * l.rentAmount;
        }, 0) / leases.reduce((s, l) => s + l.rentAmount, 0)
      : 0;

  // ─── EXPIRY GROUPS ───────────────────────────────────────────────────────────
  const expiryBands = [
    { band: "Vencidos",  min: -Infinity, max: 0 },
    { band: "0–1 año",   min: 0, max: 1 },
    { band: "1–3 años",  min: 1, max: 3 },
    { band: "3–5 años",  min: 3, max: 5 },
    { band: "> 5 años",  min: 5, max: Infinity },
  ];
  const expiryData = expiryBands.map(({ band, min, max }) => {
    const group = leases.filter(l => {
      const yrs = (new Date(l.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return yrs > min && yrs <= max;
    });
    return {
      band,
      count: group.length,
      area: Math.round(group.reduce((s, l) => s + l.areaM2, 0)),
    };
  });

  // ─── REVERSION BY PROPERTY ───────────────────────────────────────────────────
  const reversionData = properties
    .map(p => {
      const propLeases = leases.filter(l => l.propertyId === p.id);
      const passing = propLeases.reduce((s, l) => s + l.rentAmount, 0);
      const market = propLeases.reduce((s, l) => s + (l.marketRent ?? l.rentAmount * 1.1), 0);
      return { property: p.name.split(" ").slice(0, 2).join(" "), passing, market };
    })
    .filter(d => d.passing > 0);

  // ─── PASSING RENT BY LANDLORD ────────────────────────────────────────────────
  const landlordMap = new Map<string, number>();
  for (const l of leases) {
    const key = l.landlord ?? "Sin propietario";
    landlordMap.set(key, (landlordMap.get(key) ?? 0) + l.rentAmount);
  }
  const landlordData = Array.from(landlordMap.entries())
    .map(([landlord, rent]) => ({ landlord, rent }))
    .sort((a, b) => b.rent - a.rent)
    .slice(0, 6);

  // ─── EXPIRING SOON ───────────────────────────────────────────────────────────
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiringSoon = leases
    .filter(l => new Date(l.endDate) >= now && new Date(l.endDate) <= in90)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      tenant: l.tenant,
      property: l.property.name,
      endDate: l.endDate.toISOString(),
      days: Math.ceil((new Date(l.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

  const mapProperties = properties
    .filter(p => p.lat && p.lng)
    .map(p => ({ id: p.id, name: p.name, lat: p.lat!, lng: p.lng!, type: p.type }));

  return (
    <DashboardClient
      kpis={{
        propertyCount: properties.length,
        totalAreaM2: totalArea,
        leasedAreaM2: leasedArea,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        annualRent,
        currency,
        wault: Math.round(wault * 100) / 100,
        activeLeases: leases.length,
        transactions,
        projects,
      }}
      mapProperties={mapProperties}
      expiryData={expiryData}
      reversionData={reversionData}
      landlordData={landlordData}
      expiringSoon={expiringSoon}
    />
  );
}
