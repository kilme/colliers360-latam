import type { UserRole } from "@prisma/client";

// NextAuth session extension
declare module "next-auth" {
  interface Session {
    user: {
      id:             string;
      email:          string;
      name:           string;
      image?:         string | null;
      role:           UserRole;
      organizationId: string;
      businessUnitId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:             string;
    role:           UserRole;
    organizationId: string;
    businessUnitId: string | null;
  }
}

export type { UserRole };

export interface ApiError {
  message: string;
  code?:   string;
}
