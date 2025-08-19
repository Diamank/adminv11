import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import type { ContaPagarItem } from '@/mocks/contasPagar'
import { contasPagarSeed } from '@/mocks/contasPagar'

type Item = ContaPagarItem

const LS_KEY = 'contas_a_pagar_v1'

// --- utils ---
function getVencimento(i: Item) {
  return i.vencimento ?? i.nota?.vencimento ?? i.data
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
  return `${yyyy}-${mm}-${dd}`
}
function fmtMoney(v: number) {
  try {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  } catch {
    return `R$ ${Number(v || 0).toFixed(2)}`
  }
}

// --- storage local ---
function useContasStore() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        setItems(JSON.parse(raw))
      } else {
        setItems(contasPagarSeed)
        localStorage.setItem(LS_KEY, JSON.stringify(contasPagarSeed))
      }
    } catch {
      setItems(contasPagarSeed)
    }
  }, [])

  const persist = (next: Item[]) => {
    setItems(next)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next))
    } catch {}
  }

  const updateStatus = (id: string, status: Item['status']) => {
    const next = items.map((i) => (i.id === id ? { ...i, status } : i))
    persist(next)
  }

  return { items, updateStatus }
}

// --- ícone lupa ---
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export default function ContasAPagar() {
  const { items, updateStatus } = useContasStore()

  const [cedente, setCedente] = useState<string>('') // '' = todos
  const [from, setFrom] = useState<string>('')       // yyyy-mm-dd
  const [to, setTo] = useState<string>('')

  // opções do select de cedentes
  const cedentesOpts = useMemo(() => {
    const map = new Map<string, string>()
    items.forEach((i) => {
      const id = i.cedenteId ?? i.cedenteNome ?? ''
      const nome = i.cedenteNome ?? i.cedenteId ?? ''
      if (id) map.set(id, nome || String(id))
    })
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [items])

  // aplica filtros
  const filtered = useMemo(() => {
    const list = items.slice()
    const fromD = from ? new Date(from + 'T00:00:00') : null
    const toD = to ? new Date(to + 'T23:59:59') : null

    return list.filter((i) => {
      if (cedente) {
        const key = i.cedenteId ?? i.cedenteNome ?? ''
        if (key !== cedente) return false
      }
      const venc = getVencimento(i)
      const d = venc ? new Date(venc) : null
      if (fromD && d && d < fromD) return false
      if (toD && d && d > toD) return false
      return true
    })
  }, [items, cedente, from, to])

  const total = useMemo(() => filtered.reduce((acc, i) => acc + (i.valor || 0), 0), [filtered])

  const headers = ['Descrição', 'Cedente', 'Emissão', 'Vencimento', 'Valor (R$)', 'Status']
  const rows = filtered.map((i) => {
    const emissao = fmtDate(i.data)
    const venc = fmtDate(getVencimento(i) || undefined)

    const badge =
      i.status === 'pago' ? (
        <span className="px-2 py-1 rounded-md text-xs bg-green-50 text-green-700 border border-green-200">pago</span>
      ) : i.status === 'atrasado' ? (
        <span className="px-2 py-1 rounded-md text-xs bg-red-50 text-red-700 border border-red-200">atrasado</span>
      ) : (
        <span className="px-2 py-1 rounded-md text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">pendente</span>
      )

    const statusSelect = (
      <select
        className="ml-2 text-xs border rounded-md bg-white px-1.5 py-1"
        value={i.status}
        onChange={(e) => updateStatus(i.id, e.target.value as Item['status'])}
        title="Atualizar status"
      >
        <option value="pendente">pendente</option>
        <option value="pago">pago</option>
        <option value="atrasado">atrasado</option>
      </select>
    )

    return [
      i.descricao,
      i.cedenteNome || '—',
      emissao,
      venc,
      fmtMoney(i.valor),
      <div key={`status-${i.id}`} className="flex items-center">{badge}{statusSelect}</div>,
    ]
  })

  // --- gera HTML para impressão/PDF ---
  const handleGerarPDF = () => {
    const title = 'Relatório - Contas a Pagar'
    const filtroCedente = cedente
      ? (cedentesOpts.find(o => o.value === cedente)?.label ?? cedente)
      : 'Todos'
    const periodo =
      (from ? fmtDate(from) : '—') + ' a ' + (to ? fmtDate(to) : '—')

    const rowsHtml = filtered.map(i => {
      const emissao = fmtDate(i.data)
      const venc = fmtDate(getVencimento(i) || undefined)
      return `
        <tr>
          <td>${i.descricao || ''}</td>
          <td>${i.cedenteNome || ''}</td>
          <td>${emissao}</td>
          <td>${venc}</td>
          <td style="text-align:right">${fmtMoney(i.valor)}</td>
          <td>${i.status}</td>
        </tr>
      `
    }).join('')

    const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, "Helvetica Neue", Helvetica, sans-serif; padding: 24px; color: #111; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .muted { color: #666; font-size: 12px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; }
  th { background: #f9fafb; text-align: left; }
  tfoot td { font-weight: 600; }
  .right { text-align: right; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div class="no-print" style="text-align:right;margin-bottom:8px">
    <button onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>
  <h1>${title}</h1>
  <div class="muted">Cedente: <strong>${filtroCedente}</strong> • Período (vencimento): <strong>${periodo}</strong></div>
  <table>
    <thead>
      <tr>
        <th>Descrição</th>
        <th>Cedente</th>
        <th>Emissão</th>
        <th>Vencimento</th>
        <th class="right">Valor (R$)</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || `<tr><td colspan="6" style="text-align:center;color:#666">Sem registros</td></tr>`}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" class="right">Total</td>
        <td class="right">${fmtMoney(total)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</body>
</html>
    `.trim()

    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Filtros */}
        <div className="flex flex-wrap items-end gap-3 mb-3">
          {/* Lupa antes dos inputs */}
          <div className="flex items-center justify-center w-9 h-9 rounded-xl border bg-white">
            <SearchIcon className="h-4 w-4 text-gray-600" />
          </div>

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
              placeholder="dd/mm/aaaa"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Data final (vencimento)</label>
            <input
              type="date"
              className="border rounded-lg bg-white px-3 py-2"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="dd/mm/aaaa"
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

          <button
            type="button"
            className="px-3 py-2 rounded-lg border bg-white"
            onClick={handleGerarPDF}
            title="Gerar relatório em PDF"
          >
            Gerar PDF
          </button>
        </div>

        <Table
          headers={headers}
          rows={rows}
          emptyText="Nenhum lançamento encontrado para os filtros aplicados."
        />

        {/* Total geral */}
        <div className="mt-3 text-right text-sm">
          <span className="px-2 py-1 rounded-md bg-gray-100 border border-gray-200">
            Total: <strong>{fmtMoney(total)}</strong>
          </span>
        </div>
      </div>
    </AdminLayout>
  )
}
