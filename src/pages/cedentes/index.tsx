import { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import { cedentesMock } from '@/mocks/cedentes'
import Link from 'next/link'
import RiskBadge, { RiskLevel } from '@/components/RiskBadge'

// ... normalize / onlyDigits / SearchIcon iguais ...

const LS_KEY = 'cedentes_risco_v1'

// lê risco salvo (retrocompat)
function useRiskStore() {
  const [map, setMap] = useState<Record<string, RiskLevel>>({})
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setMap(JSON.parse(raw))
    } catch {}
  }, [])
  const getRisk = (id: string): RiskLevel => map[id] ?? 'nao_avaliado'
  return { getRisk }
}

// mapeia formatos diferentes de risco para RiskLevel do badge
function toRiskLevel(r: any): RiskLevel {
  if (r === 'alto' || r === 'moderado' || r === 'baixo' || r === 'nao_avaliado') return r
  if (typeof r === 'boolean') return r ? 'alto' : 'baixo' // true = risco, false = sem risco
  if (r === 'risco') return 'alto'
  if (r === 'sem_risco') return 'baixo'
  return 'nao_avaliado'
}

export default function Cedentes() {
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { getRisk } = useRiskStore() // ⬅️ só leitura

  useEffect(() => {
    if (showSearch) inputRef.current?.focus()
  }, [showSearch])

  const data = useMemo(() => {
    const q = query.trim()
    if (!q) return cedentesMock
    const hasNumber = /\d/.test(q)
    return cedentesMock.filter((c) => {
      const name = (c as any).razao || (c as any).nome || ''
      const nameMatch = normalize(name).includes(normalize(q))
      const cnpjMatch = onlyDigits(c.cnpj).includes(onlyDigits(q))
      return hasNumber ? cnpjMatch || nameMatch : nameMatch
    })
  }, [query])

  const headers = ['Razão Social', 'CNPJ', 'Endereço', 'Conta bancária', 'Risco', 'Criado', 'Ações']
  const rows = data.map((c) => {
    // prioridade: risco vindo do cadastro (c.risco) → fallback: storage antigo
    const level = toRiskLevel((c as any).risco ?? getRisk(c.id))

    return [
      (c as any).razao || (c as any).nome || '—',
      c.cnpj,
      c.endereco || '—',
      c.contaBancaria || '—',
      // ⬇️ SOMENTE a bolinha (com title de acessibilidade)
      <span key={`risk-${c.id}`} title={level === 'alto' ? 'Risco' : level === 'baixo' ? 'Sem risco' : 'Risco moderado'}>
        <RiskBadge level={level} />
      </span>,
      c.criadoEm || '—',
      <Link key={c.id} className="text-blue-600" href={`/cedentes/novo?edit=${c.id}`}>
        Editar
      </Link>,
    ]
  })

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* topo e busca — inalterados */}
        <div className="flex items-center justify-between mb-3 gap-3">
          <Link href="/cedentes/novo" className="px-3 py-2 rounded-lg border bg-white">
            + Novo cedente
          </Link>
          {/* ... busca ... */}
        </div>

        <div className="text-xs text-gray-500 mb-2">
          {data.length} {data.length === 1 ? 'cedente' : 'cedentes'} encontrados
        </div>

        <Table headers={headers} rows={rows} emptyText={query ? 'Nenhum cedente encontrado para sua busca.' : 'Sem dados'} />
      </div>
    </AdminLayout>
  )
}
