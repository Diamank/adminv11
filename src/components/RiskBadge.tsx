// src/components/RiskDot.tsx
type Risco = "sem_risco" | "risco" | null | boolean

export default function RiskDot({ risco, withLabel = false }: { risco: Risco; withLabel?: boolean }) {
  // Aceita string ("risco"/"sem_risco") ou boolean (true=risco, false=sem risco)
  const normalized: "risco" | "sem_risco" =
    (typeof risco === "boolean" ? (risco ? "risco" : "sem_risco") : (risco || "sem_risco")) as any

  const map = {
    risco: { color: "bg-red-500", label: "Risco" },
    sem_risco: { color: "bg-green-500", label: "Sem risco" },
  } as const

  const item = map[normalized]

  return (
    <span className="inline-flex items-center gap-2" title={item.label}>
      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
      {withLabel && <span className="text-sm text-gray-600">{item.label}</span>}
    </span>
  )
}
