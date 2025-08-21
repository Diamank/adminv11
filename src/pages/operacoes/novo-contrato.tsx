import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { cedentesMock } from '@/mocks/cedentes' // precisa ter: {id, razao (ou nome), cnpj}

type TipoContrato = 'Cessão de crédito - Materiais' | 'Cessão de crédito - Serviços'

type Contrato = {
  id: string
  cedenteId: string
  cedenteNome: string
  cnpjCedente: string
  tipo: TipoContrato
  limite: number
  criadoEm: string
}

const LS_KEY = 'ops_contratos_v2'

// util
const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function NovoContrato() {
  // -------- LISTA --------
  const [itens, setItens] = useState<Contrato[]>([])
  const [busca, setBusca] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      setItens(raw ? JSON.parse(raw) : [])
    } catch {
      setItens([])
    }
  }, [])

  const persist = (next: Contrato[]) => {
    setItens(next)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next))
    } catch {}
  }

  const remover = (id: string) => {
    if (!confirm('Excluir contrato?')) return
    persist(itens.filter((i) => i.id !== id))
  }

  const itensFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return itens
    return itens.filter((i) =>
      [i.cedenteNome, i.cnpjCedente, i.tipo].some((v) =>
        v.toLowerCase().includes(q)
      )
    )
  }, [itens, busca])

  // -------- FORM (colapsado por padrão) --------
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cedenteId, setCedenteId] = useState('')
  const [tipo, setTipo] = useState<TipoContrato>('Cessão de crédito - Materiais')
  const [limite, setLimite] = useState<number | ''>('')

  const cedentesOpts = useMemo(
    () =>
      cedentesMock.map((c: any) => ({
        value: c.id,
        label: c.razao || c.nome || '—',
        cnpj: c.cnpj,
      })),
    []
  )
  const cedenteSel = useMemo(
    () => cedentesOpts.find((o) => o.value === cedenteId),
    [cedentesOpts, cedenteId]
  )

  const limparForm = () => {
    setCedenteId('')
    setTipo('Cessão de crédito - Materiais')
    setLimite('')
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cedenteId || limite === '' || Number(limite) <= 0) return

    const novo: Contrato = {
      id: 'CT-' + Date.now(),
      cedenteId,
      cedenteNome: cedenteSel?.label || '',
      cnpjCedente: cedenteSel?.cnpj || '',
      tipo,
      limite: Number(limite),
      criadoEm: new Date().toISOString().slice(0, 10),
    }
    persist([novo, ...itens])
    limparForm()
    setMostrarForm(false)
    alert('Contrato salvo!')
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header da LISTA + botão de abrir/fechar formulário */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Contratos</h1>
          <button
            onClick={() => setMostrarForm(v => !v)}
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            {mostrarForm ? 'Fechar' : 'Novo contrato'}
          </button>
        </div>

        {/* Busca rápida */}
        <div className="flex gap-3">
          <input
            placeholder="Buscar por cedente, CNPJ ou tipo…"
            className="w-full border rounded-lg px-3 py-2 bg-white"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* LISTA primeiro */}
        <div className="overflow-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Contrato</th>
                <th className="px-4 py-2">Cedente</th>
                <th className="px-4 py-2">CNPJ</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Limite</th>
                <th className="px-4 py-2">Criado</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    Sem registros.
                  </td>
                </tr>
              )}
              {itensFiltrados.map((i, idx) => (
                <tr key={i.id} className="border-t">
                  <td className="px-4 py-2">{String(idx + 1).padStart(3, '0')}</td>
                  <td className="px-4 py-2">{i.cedenteNome}</td>
                  <td className="px-4 py-2">{i.cnpjCedente}</td>
                  <td className="px-4 py-2">{i.tipo}</td>
                  <td className="px-4 py-2">{money(i.limite)}</td>
                  <td className="px-4 py-2">{i.criadoEm}</td>
                  <td className="px-4 py-2">
                    <button
                      className="px-2 py-1 border rounded text-red-600"
                      onClick={() => remover(i.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FORM: só aparece ao clicar no botão */}
        {mostrarForm && (
          <div className="border rounded-xl p-4 bg-white">
            <h2 className="text-lg font-medium mb-3">Cadastrar contrato</h2>

            <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Cedente</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={cedenteId}
                  onChange={(e) => setCedenteId(e.target.value)}
                  required
                >
                  <option value="">Selecione…</option>
                  {cedentesOpts.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} — {o.cnpj}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">CNPJ do Cedente</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                  value={cedenteSel?.cnpj || ''}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Tipo de contrato</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoContrato)}
                >
                  <option value="Cessão de crédito - Materiais">Cessão de crédito - Materiais</option>
                  <option value="Cessão de crédito - Serviços">Cessão de crédito - Serviços</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Limite (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={limite}
                  onChange={(e) => setLimite(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex gap-3">
                <button className="px-4 py-2 rounded-xl bg-black text-white">Salvar</button>
                <button
                  type="button"
                  onClick={() => { limparForm(); setMostrarForm(false) }}
                  className="px-4 py-2 rounded-xl border"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
