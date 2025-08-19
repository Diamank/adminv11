import React from 'react'

export type RiskLevel = 'alto' | 'moderado' | 'baixo' | 'nao_avaliado'

const label: Record<RiskLevel, string> = {
  alto: 'Risco',
  moderado: 'Risco moderado',
  baixo: 'Sem risco',
  nao_avaliado: 'Não analisado',
}

const colors: Record<RiskLevel, string> = {
  alto: 'bg-red-500',
  moderado: 'bg-yellow-400',
  baixo: 'bg-green-500',
  nao_avaliado: 'bg-gray-300',
}

export default function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className={`h-2.5 w-2.5 rounded-full ${colors[level]}`} />
      <span className="text-gray-700">{label[level]}</span>
    </span>
  )
}
