export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/(app)/:path*",
    "/dashboard/:path*",
    "/worktrac/:path*",
    "/equipo/:path*",
    "/admin/:path*",
  ],
};
