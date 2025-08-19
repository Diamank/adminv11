import { useMemo, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import { cedentesMock } from '@/mocks/cedentes'
import Link from 'next/link'
import { Search } from 'lucide-react'

function normalize(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function onlyDigits(str: string) {
  return str.replace(/\D/g, '')
}

export default function Cedentes() {
  const [query, setQuery] = useState('')

  const data = useMemo(() => {
    const q = query.trim()
    if (!q) return cedentesMock

    const hasNumber = /\d/.test(q)

    return cedentesMock.filter((c) => {
      // tente com c.razao ou c.nome (depende do seu mock)
      const name = c.razao || c.nome
      const nameMatch = normalize(name).includes(normalize(q))

      const cnpjMatch = onlyDigits(c.cnpj).includes(onlyDigits(q))

      return hasNumber ? cnpjMatch || nameMatch : nameMatch
    })
  }, [query])

  const headers = ['Razão Social', 'CNPJ', 'Endereço', 'Conta bancária', 'Criado', 'Ações']
  const rows = data.map((c) => [
    c.razao || c.nome,
    c.cnpj,
    c.endereco,
    c.contaBancaria,
    c.criadoEm,
    <Link key={c.id} className="text-blue-600" href={`/cedentes/novo?edit=${c.id}`}>
      Editar
    </Link>,
  ])

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3 gap-3">
          <Link href="/cedentes/novo" className="px-3 py-2 rounded-lg border bg-white">
            + Novo cedente
          </Link>

          <div className="relative w-full max-w-md">
            {/* Ícone lupa à esquerda */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

            <input
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
