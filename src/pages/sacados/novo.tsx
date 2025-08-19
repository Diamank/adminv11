import { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import Link from 'next/link'
import RiskBadge from '@/components/RiskBadge'
import { sacadosMock } from '@/mocks/sacados' // ajuste se o caminho for outro

// Tipagem de risco usada no sistema
type RiskLevel = 'alto' | 'moderado' | 'baixo' | 'nao_avaliado'

// Utils locais
function normalize(str: string = '') {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
function onlyDigits(str: string = '') {
  return str.replace(/\D/g, '')
}

// Lupa SVG
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

// Retrocompat com storage antigo (se você usou algo similar em cedentes)
const LS_KEY = 'sacados_risco_v1'
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

// Normaliza formatos: boolean | 'risco' | 'sem_risco' | 'moderado' → RiskLevel
function toRiskLevel(r: any): RiskLevel {
  if (r === 'alto' || r === 'moderado' || r === 'baixo' || r === 'nao_avaliado') return r
  if (typeof r === 'boolean') return r ? 'alto' : 'baixo'
  if (r === 'risco') return 'alto'
  if (r === 'moderado') return 'moderado'
  if (r === 'sem_risco') return 'baixo'
  return 'nao_avaliado'
}

export default function Sacados() {
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { getRisk } = useRiskStore()

  useEffect(() => {
    if (showSearch) inputRef.current?.focus()
  }, [showSearch])

  const data = useMemo(() => {
    const q = query.trim()
    if (!q) return sacadosMock
    const hasNumber = /\d/.test(q)

    return sacadosMock.filter((s) => {
      const name = (s as any).razao || (s as any).nome || ''
      const nameMatch = normalize(name).includes(normalize(q))
      // aceita buscar por CNPJ ou CPF (qual campo existir)
      const doc = onlyDigits((s as any).cnpj || (s as any).cpf || '')
      const docMatch = doc.includes(onlyDigits(q))
      return hasNumber ? docMatch || nameMatch : nameMatch
    })
  }, [query])

  const headers = ['Nome/Razão', 'Documento', 'Endereço', 'Contato', 'Risco', 'Criado', 'Ações']
  const rows = data.map((s) => {
    const level = toRiskLevel((s as any).risco ?? getRisk(s.id))
    const doc = (s as any).cnpj || (s as any).cpf || '—'

    return [
      (s as any).razao || (s as any).nome || '—',
      doc,
      (s as any).endereco || '—',
      (s as any).contato || (s as any).email || (s as any).telefone || '—',
      <span key={`risk-${s.id}`} title={level}>
        <RiskBadge level={level} />
      </span>,
      (s as any).criadoEm || '—',
      <Link key={s.id} className="text-blue-600" href={`/sacados/novo?edit=${s.id}`}>
        Editar
      </Link>,
    ]
  })

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3 gap-3">
          <Link href="/sacados/novo" className="px-3 py-2 rounded-lg border bg-white">
            + Novo sacado
          </Link>

          <div className="flex items-center gap-2">
            {!showSearch ? (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                title="Buscar sacado"
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
                  placeholder="Buscar por CNPJ/CPF ou Nome..."
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
          {data.length} {data.length === 1 ? 'sacado' : 'sacados'} encontrados
        </div>

        <Table
          headers={headers}
          rows={rows}
          emptyText={query ? 'Nenhum sacado encontrado para sua busca.' : 'Sem dados'}
        />
      </div>
    </AdminLayout>
  )
}
