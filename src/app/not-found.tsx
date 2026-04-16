import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#001a4e] text-center px-4">
      <p className="text-7xl font-bold text-white/10">404</p>
      <h1 className="text-2xl font-bold text-white mt-4">Página no encontrada</h1>
      <p className="text-blue-300 text-sm mt-2">La página que buscás no existe o fue movida.</p>
      <Link
        href="/dashboard"
        className="mt-6 px-5 py-2.5 bg-white text-[#003087] font-semibold rounded-lg hover:bg-blue-50 transition text-sm"
      >
        Volver al dashboard
      </Link>
    </div>
  );
}
