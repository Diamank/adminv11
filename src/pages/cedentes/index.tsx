import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import { cedentesMock } from '@/mocks/cedentes'
import Link from 'next/link'

export default function Cedentes() {
  const [search, setSearch] = useState("")

  const headers = [
    'Razão Social',
    'CNPJ',
    'Endereço',
    'Conta bancária',
    'Criado',
    'Ações'
  ]

  // Filtragem por CNPJ ou Razão Social
  const filteredCedentes = cedentesMock.filter(c => {
    const term = search.toLowerCase()
    return (
      c.razao.toLowerCase().includes(term) ||
      c.cnpj.replace(/\D/g, "").includes(term.replace(/\D/g, ""))
    )
  })

  const rows = filteredCedentes.map(c => [
    c.razao,
    c.cnpj,
    c.endereco,
    c.contaBancaria,
    c.criadoEm,
    <Link
      key={c.id}
      className="text-blue-600 hover:underline"
      href={`/cedentes/novo?edit=${c.id}`}
    >
      Editar
    </Link>
  ])

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/cedentes/novo"
          className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50"
        >
          + Novo cedente
        </Link>

        <input
          type="text"
          placeholder="Pesquisar por CNPJ ou Nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 w-80 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Table headers={headers} rows={rows} />
    </AdminLayout>
  )
}
