"use client";

import { useState, createContext, useContext, ReactNode } from "react";

const CURRENCIES = [
  { code: "USD", label: "USD", rate: 1 },
  { code: "MXN", label: "MXN", rate: 17.2 },
  { code: "COP", label: "COP", rate: 4080 },
  { code: "CLP", label: "CLP", rate: 950 },
  { code: "PEN", label: "PEN", rate: 3.75 },
  { code: "ARS", label: "ARS", rate: 1050 },
];

type CurrencyCtx = { currency: string; rate: number; convert: (usd: number) => number };
const CurrencyContext = createContext<CurrencyCtx>({ currency: "USD", rate: 1, convert: x => x });
export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState(CURRENCIES[0]);

  return (
    <CurrencyContext.Provider
      value={{ currency: selected.code, rate: selected.rate, convert: (usd) => usd * selected.rate }}
    >
      <div className="flex items-center gap-1">
        {CURRENCIES.map(c => (
          <button
            key={c.code}
            onClick={() => setSelected(c)}
            className={`px-2 py-0.5 text-xs rounded font-medium transition ${
              selected.code === c.code
                ? "bg-[#003087] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {children}
    </CurrencyContext.Provider>
  );
}
