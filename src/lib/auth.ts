import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";
import type { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) return null;

        const decoded = await adminAuth
          .verifyIdToken(credentials.idToken)
          .catch(() => null);

        if (!decoded) return null;

        const user = await prisma.user.findUnique({
          where: { firebaseUid: decoded.uid },
          include: { businessUnit: true, organization: true },
        });

        if (!user || user.status === "INACTIVE") return null;

        return {
          id:             user.id,
          email:          user.email,
          name:           user.name,
          image:          user.avatarUrl,
          role:           user.role,
          organizationId: user.organizationId,
          businessUnitId: user.businessUnitId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id             = user.id;
        token.role           = (user as typeof user & { role: UserRole }).role;
        token.organizationId = (user as typeof user & { organizationId: string }).organizationId;
        token.businessUnitId = (user as typeof user & { businessUnitId: string | null }).businessUnitId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id             = token.id as string;
        session.user.role           = token.role as UserRole;
        session.user.organizationId = token.organizationId as string;
        session.user.businessUnitId = token.businessUnitId as string | null;
      }
      return session;
    },
  },
};
