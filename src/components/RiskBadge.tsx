// src/components/RiskBadge.tsx
export type RiskLevel = 'alto' | 'moderado' | 'baixo' | 'nao_avaliado'

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const map = {
    alto: { dot: 'bg-red-500', label: 'Risco' },
    moderado: { dot: 'bg-yellow-500', label: 'Risco moderado' },
    baixo: { dot: 'bg-green-500', label: 'Sem risco' },
    nao_avaliado: { dot: 'bg-gray-300', label: 'Não analisado' },
  } as const

  const v = map[level] ?? map.nao_avaliado
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${v.dot}`} />
      {/* sem texto na lista; se quiser label, renderize aqui */}
    </span>
  )
}
