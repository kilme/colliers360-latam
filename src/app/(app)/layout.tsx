import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/shared/sidebar";
import { TopBar } from "@/components/shared/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const businessUnits =
    session.user.role === "SUPER_ADMIN"
      ? await prisma.businessUnit.findMany({
          where: { organizationId: session.user.organizationId },
          select: { id: true, name: true, country: true },
          orderBy: { country: "asc" },
        })
      : [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={session.user} businessUnits={businessUnits} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
