import { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

type Contrato = {
  id: string
  cedente: string
  limite: number
  criadoEm: string
  anexos?: { name: string; size: number }[]
}

const LS_KEY = 'ops_contratos_v1'

export default function NovoContrato() {
  // ------ formulário ------
  const [cedente, setCedente] = useState('')
  const [limite, setLimite] = useState<number | ''>('')

  // ------ storage/histórico ------
  const [items, setItems] = useState<Contrato[]>([])
  const [q, setQ] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      setItems(raw ? JSON.parse(raw) : [])
    } catch {
      setItems([])
    }
  }, [])

  const persist = (next: Contrato[]) => {
    setItems(next)
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cedente || !limite) return

    const novo: Contrato = {
      id: 'CT-' + Date.now(),
      cedente,
      limite: Number(limite),
      criadoEm: new Date().toISOString().slice(0, 10),
      anexos: [],
    }
    persist([novo, ...items])
    setCedente('')
    setLimite('')
    alert('Contrato salvo!')
  }

  const edit = (id: string) => {
    const it = items.find(i => i.id === id)
    if (!it) return
    const novoLimite = prompt('Novo limite (R$):', String(it.limite))
    if (novoLimite) {
      persist(items.map(i => (i.id === id ? { ...i, limite: Number(novoLimite) } : i)))
    }
  }

  const attach = (id: string) => {
    const el = fileRef.current
    if (!el) return
    el.onchange = () => {
      const f = el.files?.[0]
      if (f) {
        const anexos = (items.find(x => x.id === id)?.anexos || []).concat([{ name: f.name, size: f.size }])
        persist(items.map(i => (i.id === id ? { ...i, anexos } : i)))
      }
      el.value = ''
    }
    el.click()
  }

  const remove = (id: string) => {
    if (!confirm('Excluir contrato?')) return
    persist(items.filter(i => i.id !== id))
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter(i =>
      i.id.toLowerCase().includes(s) || i.cedente.toLowerCase().includes(s)
    )
  }, [items, q])

  const fmtMoney = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Cadastrar Contrato</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          <div>
            <label className="block text-sm mb-1">Cedente</label>
            <input
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={cedente}
              onChange={e => setCedente(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Limite (R$)</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={limite}
              onChange={e => setLimite(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <div className="pt-2">
            <button className="px-4 py-2 rounded-xl bg-black text-white">Salvar</button>
          </div>
        </form>

        {/* Histórico */}
        <input ref={fileRef} type="file" className="hidden" />
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Histórico de Contratos</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ID ou Cedente..."
            className="border rounded-xl px-3 py-2 bg-white w-72"
          />
        </div>

        <div className="overflow-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Contrato</th>
                <th className="px-4 py-2">Cedente</th>
                <th className="px-4 py-2">Limite</th>
                <th className="px-4 py-2">Criado</th>
                <th className="px-4 py-2">Anexos</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Sem registros.</td></tr>
              )}
              {filtered.map(i => (
                <tr key={i.id} className="border-t">
                  <td className="px-4 py-2">{i.id}</td>
                  <td className="px-4 py-2">{i.cedente}</td>
                  <td className="px-4 py-2">{fmtMoney(i.limite)}</td>
                  <td className="px-4 py-2">{i.criadoEm}</td>
                  <td className="px-4 py-2">{i.anexos?.map(a => a.name).join(', ') || '—'}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded" onClick={() => edit(i.id)}>Editar</button>
                      <button className="px-2 py-1 border rounded" onClick={() => attach(i.id)}>Anexar</button>
                      <button className="px-2 py-1 border rounded text-red-600" onClick={() => remove(i.id)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
