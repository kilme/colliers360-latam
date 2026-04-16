export { default as proxy } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/worktrac/:path*",
    "/equipo/:path*",
    "/admin/:path*",
  ],
};
