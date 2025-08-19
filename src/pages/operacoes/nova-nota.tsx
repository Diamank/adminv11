import { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

type Nota = {
  id: string
  numero: string
  sacado: string
  contrato?: string
  valor: number
  vencimento: string
  status: 'pendente' | 'pago' | 'atrasado'
  anexos?: { name: string; size: number }[]
}

const LS_KEY = 'ops_notas_v1'
const fmtMoney = (v:number)=> v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})

export default function NovaNota() {
  // ------ formulário ------
  const [numero, setNumero] = useState('')
  const [sacado, setSacado] = useState('')
  const [contrato, setContrato] = useState('')
  const [valor, setValor] = useState<number | ''>('')
  const [vencimento, setVencimento] = useState('')
  const [status, setStatus] = useState<'pendente'|'pago'|'atrasado'>('pendente')

  // ------ storage/histórico ------
  const [items, setItems] = useState<Nota[]>([])
  const [q, setQ] = useState('')        // busca
  const [fs, setFs] = useState('')      // filtro status
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    setItems(raw ? JSON.parse(raw) : [])
  }, [])

  const persist = (next: Nota[]) => {
    setItems(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!numero || !sacado || !valor || !vencimento) return

    const nova: Nota = {
      id: 'NF-' + Date.now(),
      numero,
      sacado,
      contrato: contrato || undefined,
      valor: Number(valor),
      vencimento,
      status,
      anexos: [],
    }
    persist([nova, ...items])

    // limpa
    setNumero(''); setSacado(''); setContrato(''); setValor(''); setVencimento(''); setStatus('pendente')
    alert('Nota salva!')
  }

  const editValor = (id: string) => {
    const it = items.find(i => i.id === id); if (!it) return
    const novo = prompt('Novo valor (R$):', String(it.valor))
    if (novo) persist(items.map(i => i.id === id ? { ...i, valor: Number(novo) } : i))
  }

  const changeStatus = (id: string, s: Nota['status']) =>
    persist(items.map(i => i.id === id ? { ...i, status: s } : i))

  const remove = (id: string) => {
    if (!confirm('Excluir nota?')) return
    persist(items.filter(i => i.id !== id))
  }

  const attach = (id: string) => {
    const el = fileRef.current; if (!el) return
    el.onchange = () => {
      const f = el.files?.[0]
      if (f) {
        const anexos = (items.find(x => x.id === id)?.anexos || []).concat([{ name: f.name, size: f.size }])
        persist(items.map(i => i.id === id ? { ...i, anexos } : i))
      }
      el.value = ''
    }
    el.click()
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return items.filter(i => {
      const okQ = !s || i.numero.toLowerCase().includes(s) || i.sacado.toLowerCase().includes(s)
      const okS = !fs || i.status === fs
      return okQ && okS
    })
  }, [items, q, fs])

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Cadastrar Nota Fiscal</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-sm mb-1">Número</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-white" value={numero} onChange={e=>setNumero(e.target.value)} required/>
          </div>
          <div>
            <label className="block text-sm mb-1">Sacado</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-white" value={sacado} onChange={e=>setSacado(e.target.value)} required/>
          </div>
          <div>
            <label className="block text-sm mb-1">Contrato (opcional)</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-white" value={contrato} onChange={e=>setContrato(e.target.value)}/>
          </div>
          <div>
            <label className="block text-sm mb-1">Valor (R$)</label>
            <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 bg-white"
              value={valor} onChange={e=>setValor(e.target.value===''?'':Number(e.target.value))} required/>
          </div>
          <div>
            <label className="block text-sm mb-1">Vencimento</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 bg-white" value={vencimento} onChange={e=>setVencimento(e.target.value)} required/>
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select className="w-full border rounded-lg px-3 py-2 bg-white" value={status} onChange={e=>setStatus(e.target.value as any)}>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button className="px-4 py-2 rounded-xl bg-black text-white">Salvar</button>
          </div>
        </form>

        {/* Histórico */}
        <input ref={fileRef} type="file" className="hidden" />
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-lg font-medium mr-auto">Histórico de Notas</h2>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar (número ou sacado)"
              className="border rounded-xl px-3 py-2 bg-white w-72"
            />
            <select
              className="border rounded-xl px-3 py-2 bg-white"
              value={fs}
              onChange={(e)=>setFs(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
        </div>

        <div className="overflow-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">NF</th>
                <th className="px-4 py-2">Sacado</th>
                <th className="px-4 py-2">Contrato</th>
                <th className="px-4 py-2">Vencimento</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Anexos</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-500">Sem registros.</td></tr>
              )}
              {filtered.map(i => (
                <tr key={i.id} className="border-t">
                  <td className="px-4 py-2">{i.numero}</td>
                  <td className="px-4 py-2">{i.sacado}</td>
                  <td className="px-4 py-2">{i.contrato || '—'}</td>
                  <td className="px-4 py-2">{i.vencimento}</td>
                  <td className="px-4 py-2">{fmtMoney(i.valor)}</td>
                  <td className="px-4 py-2">
                    <select
                      className="border rounded-md bg-white px-2 py-1 text-xs"
                      value={i.status}
                      onChange={(e)=>changeStatus(i.id, e.target.value as Nota['status'])}
                    >
                      <option value="pendente">pendente</option>
                      <option value="pago">pago</option>
                      <option value="atrasado">atrasado</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">{i.anexos?.map(a => a.name).join(', ') || '—'}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded" onClick={() => editValor(i.id)}>Editar valor</button>
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
