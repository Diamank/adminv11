import { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import Link from 'next/link'
import RiskBadge from '@/components/RiskBadge'
import { supabase } from '@/lib/supabase' // ajuste se estiver como supabaseClient

type Cedente = {
  id: string
  razao_social: string
  nome_fantasia?: string
  cnpj: string
  email?: string
  telefone?: string
  endereco?: string
  risco: 'sem_risco' | 'moderado' | 'risco'
  created_at: string
  conta_bancaria?: string
}

// Utils
function normalize(str: string = '') {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
function onlyDigits(str: string = '') {
  return str.replace(/\D/g, '')
}

// Ícone lupa
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export default function Cedentes() {
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [data, setData] = useState<Cedente[]>([])

  // Buscar cedentes do Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('cedentes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setData(data || [])
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (showSearch) inputRef.current?.focus()
  }, [showSearch])

  // Filtro de busca
  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return data
    const hasNumber = /\d/.test(q)

    return data.filter((c) => {
      const name = c.razao_social || c.nome_fantasia || ''
      const nameMatch = normalize(name).includes(normalize(q))
      const doc = onlyDigits(c.cnpj || '')
      const docMatch = doc.includes(onlyDigits(q))
      return hasNumber ? docMatch || nameMatch : nameMatch
    })
  }, [query, data])

  const headers = ['Nome/Razão', 'Documento', 'Endereço', 'Contato', 'Risco', 'Criado', 'Ações']
  const rows = filtered.map((c) => [
    c.razao_social || c.nome_fantasia || '—',
    c.cnpj,
    c.endereco || '—',
    c.email || c.telefone || '—',
    <span key={`risk-${c.id}`} title={c.risco}>
      <RiskBadge level={c.risco as any} />
    </span>,
    new Date(c.created_at).toLocaleDateString('pt-BR'),
    <div key={`actions-${c.id}`} className="flex gap-2">
      <Link
        href={`/cedentes/novo?edit=${c.id}`}
        className="px-2 py-1 rounded-lg text-sm border border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        Editar
      </Link>
      <button
        onClick={async () => {
          if (confirm('Tem certeza que deseja excluir este cedente?')) {
            const { error } = await supabase.from('cedentes').delete().eq('id', c.id)
            if (error) {
              alert('❌ Erro ao excluir')
              console.error(error)
            } else {
              alert('✅ Cedente excluído com sucesso!')
              setData((prev) => prev.filter((item) => item.id !== c.id))
            }
          }
        }}
        className="px-2 py-1 rounded-lg text-sm border border-red-500 text-red-600 hover:bg-red-50"
      >
        Excluir
      </button>
    </div>,
  ])

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
          {filtered.length} {filtered.length === 1 ? 'cedente' : 'cedentes'} encontrados
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
