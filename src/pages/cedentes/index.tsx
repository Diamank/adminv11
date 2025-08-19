import { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import { cedentesMock } from '@/mocks/cedentes'
import Link from 'next/link'
import RiskBadge, { RiskLevel } from '@/components/RiskBadge'

function normalize(str: string = '') {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
function onlyDigits(str: string = '') {
  return str.replace(/\D/g, '')
}

// Lupa SVG inline (sem libs)
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

// chave para localStorage
const LS_KEY = 'cedentes_risco_v1'

// lê/salva risco no localStorage
function useRiskStore() {
  const [map, setMap] = useState<Record<string, RiskLevel>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setMap(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(map))
    } catch {}
  }, [map])

  const setRisk = (id: string, level: RiskLevel) =>
    setMap((m) => ({ ...m, [id]: level }))

  const getRisk = (id: string): RiskLevel => map[id] ?? 'nao_avaliado'

  return { getRisk, setRisk }
}

export default function Cedentes() {
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { getRisk, setRisk } = useRiskStore()

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
    const current = getRisk(c.id)
    return [
      (c as any).razao || (c as any).nome || '—',
      c.cnpj,
      c.endereco || '—',
      c.contaBancaria || '—',
      <div key={`risk-${c.id}`} className="flex items-center gap-3">
        <RiskBadge level={current} />
        {/* seletor simples para marcar a análise */}
        <select
          value={current}
          onChange={(e) => setRisk(c.id, e.target.value as RiskLevel)}
          className="text-xs border rounded-lg px-2 py-1 bg-white"
          title="Atualizar avaliação de risco"
        >
          <option value="nao_avaliado">Não analisado</option>
          <option value="alto">Risco</option>
          <option value="moderado">Risco moderado</option>
          <option value="baixo">Sem risco</option>
        </select>
      </div>,
      c.criadoEm || '—',
      <Link key={c.id} className="text-blue-600" href={`/cedentes/novo?edit=${c.id}`}>
        Editar
      </Link>,
    ]
  })

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3 gap-3">
          <Link href="/cedentes/novo" className="px-3 py-2 rounded-lg border bg-white">
            + Novo cedente
          </Link>

          <div className="flex items-center gap-2">
            {!showSearch ? (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                title="Buscar cedente"
              >
                <SearchIcon className="h-4 w-4 text-gray-600" />
                Buscar
              </button>
            ) : (
              <div className="relative w-[min(100%,26rem)]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por CNPJ ou Nome..."
                  className="w-full rounded-xl border bg-white pl-9 pr-9 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Limpar"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-2">
          {data.length} {data.length === 1 ? 'cedente' : 'cedentes'} encontrados
        </div>

        <Table
          headers={headers}
          rows={rows}
          emptyText={query ? 'Nenhum cedente encontrado para sua busca.' : 'Sem dados'}
        />
      </div>
    </AdminLayout>
  )
}
