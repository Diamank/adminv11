import { useMemo, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import { contasPagarMock } from '@/mocks/contasPagar' // ajuste o caminho se o mock estiver em outro local

type Item = {
  id: string
  descricao: string
  data?: string            // data de criação/emissão
  valor: number
  status: 'pendente' | 'pago' | 'atrasado'
  cedenteId?: string
  cedenteNome?: string
  vencimento?: string      // <- preferido
  nota?: { vencimento?: string } // <- fallback: vencimento da NF na operação
}

function toDate(s?: string) {
  if (!s) return null
  const d = new Date(s)
  return isNaN(+d) ? null : d
}
function fmtDate(s?: string) {
  const d = toDate(s)
  if (!d) return '—'
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}` // ISO curto (casadinho com input[type=date])
}
function fmtMoney(v: number) {
  try {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  } catch {
    return `R$ ${Number(v || 0).toFixed(2)}`
  }
}
function getVencimento(i: Item) {
  return i.vencimento ?? i.nota?.vencimento ?? i.data // último recurso
}

export default function ContasAPagar() {
  const [cedente, setCedente] = useState<string>('') // '' = todos
  const [from, setFrom] = useState<string>('')       // yyyy-mm-dd
  const [to, setTo] = useState<string>('')

  // opções do select de cedentes
  const cedentesOpts = useMemo(() => {
    const set = new Map<string, string>()
    ;(contasPagarMock as Item[]).forEach((i) => {
      const id = i.cedenteId ?? i.cedenteNome ?? ''
      const nome = i.cedenteNome ?? i.cedenteId ?? ''
      if (id) set.set(id, nome || String(id))
    })
    return Array.from(set, ([value, label]) => ({ value, label }))
  }, [])

  // aplica filtros
  const data = useMemo(() => {
    const list = (contasPagarMock as Item[]).slice()

    const fromD = from ? new Date(from + 'T00:00:00') : null
    const toD = to ? new Date(to + 'T23:59:59') : null

    return list.filter((i) => {
      // filtro por cedente
      if (cedente) {
        const key = i.cedenteId ?? i.cedenteNome ?? ''
        if (key !== cedente) return false
      }

      // filtro por data (usa VENCIMENTO)
      const venc = getVencimento(i)
      const d = venc ? new Date(venc) : null

      if (fromD && d && d < fromD) return false
      if (toD && d && d > toD) return false

      return true
    })
  }, [cedente, from, to])

  const headers = ['Descrição', 'Cedente', 'Emissão', 'Vencimento', 'Valor (R$)', 'Status']
  const rows = data.map((i) => {
    const emissao = fmtDate(i.data)
    const venc = fmtDate(getVencimento(i) || undefined)

    // badge de status
    const badge =
      i.status === 'pago' ? (
        <span className="px-2 py-1 rounded-md text-xs bg-green-50 text-green-700 border border-green-200">pago</span>
      ) : i.status === 'atrasado' ? (
        <span className="px-2 py-1 rounded-md text-xs bg-red-50 text-red-700 border border-red-200">atrasado</span>
      ) : (
        <span className="px-2 py-1 rounded-md text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">pendente</span>
      )

    return [
      i.descricao,
      i.cedenteNome || '—',
      emissao,
      venc,
      fmtMoney(i.valor),
      badge,
    ]
  })

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Filtros */}
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div className="flex flex-col">
            <label className="text-sm mb-1">Cedente</label>
            <select
              className="border rounded-lg bg-white px-3 py-2 min-w-[16rem]"
              value={cedente}
              onChange={(e) => setCedente(e.target.value)}
            >
              <option value="">Todos</option>
              {cedentesOpts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label || o.value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Data inicial (vencimento)</label>
            <input
              type="date"
              className="border rounded-lg bg-white px-3 py-2"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Data final (vencimento)</label>
            <input
              type="date"
              className="border rounded-lg bg-white px-3 py-2"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="ml-auto px-3 py-2 rounded-lg border bg-white"
            onClick={() => {
              setCedente('')
              setFrom('')
              setTo('')
            }}
          >
            Limpar filtros
          </button>
        </div>

        <Table
          headers={headers}
          rows={rows}
          emptyText="Nenhum lançamento encontrado para os filtros aplicados."
        />
      </div>
    </AdminLayout>
  )
}
