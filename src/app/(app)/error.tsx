"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-2xl">⚠️</div>
      <h2 className="text-lg font-semibold text-gray-900">Ocurrió un error</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">{error.message}</p>
      <button
        onClick={reset}
        className="mt-5 px-4 py-2 text-sm font-medium bg-[#003087] text-white rounded-lg hover:bg-[#001a4e] transition"
      >
        Reintentar
      </button>
    </div>
  );
}
