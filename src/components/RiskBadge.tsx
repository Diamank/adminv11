// src/lib/riskStore.ts
export type RiskLevel = 'alto' | 'moderado' | 'baixo' | 'nao_avaliado'
const KEY = 'cedentes_risco_por_cnpj_v1'

function onlyDigits(s: string = '') {
  return s.replace(/\D/g, '')
}

function safeGet(): Record<string, RiskLevel> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function safeSet(map: Record<string, RiskLevel>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {}
}

export function getRiskByCNPJ(cnpj: string): RiskLevel {
  const map = safeGet()
  return map[onlyDigits(cnpj)] ?? 'nao_avaliado'
}

export function setRiskByCNPJ(cnpj: string, level: RiskLevel) {
  const map = safeGet()
  map[onlyDigits(cnpj)] = level
  safeSet(map)
}
