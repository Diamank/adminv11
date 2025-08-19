import { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { cedentesMock } from '@/mocks/cedentes' // {id, razao/nome, cnpj}
import { sacadosMock } from '@/mocks/sacados'   // {id, nome, cnpj}

type Nota = {
  id: string
  cedenteId: string
  cedenteNome: string
  cnpjCedente: string
  sacadoId: string
  sacadoNome: string
  cnpjSacado: string
  numero: string
  emissao: string
  vencimento: string
  dias: number
  valor: number
  taxaMes: number
  desconto: number
  liquidoCedente: number
  valorAReceber: number
  anexos?: { name: string; size: number }[]
  status: 'pendente' | 'pago' | 'atrasado'
}

const LS_KEY = 'ops_notas_v2'

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function difDias(ini?: string, fim?: string) {
  if (!ini || !fim) return 0
  const d1 = new Date(ini + 'T00:00:00')
  const d2 = new Date(fim + 'T00:00:00')
  const ms = d2.getTime() - d1.getTime()
  return Math.max(0, Math.round(ms / 86400000))
}

export default function NovaNota() {
  // selects
  const cedentes = useMemo(
    () => cedentesMock.map((c: any) => ({ id: c.id, nome: c.razao || c.nome, cnpj: c.cnpj })),
    []
  )
  const sacados = useMemo(
    () => sacadosMock.map((s: any) => ({ id: s.id, nome: s.nome, cnpj: s.cnpj })),
    []
  )

  // form
  const [cedenteId, setCedenteId] = useState('')
  const [sacadoId, setSacadoId] = useState('')
  const cedSel = useMemo(() => cedentes.find((c) => c.id === cedenteId), [cedentes, cedenteId])
  const sacSel = useMemo(() => sacados.find((s) => s.id === sacadoId), [sacados, sacadoId])

  const [numero, setNumero] = useState('')
  const [emissao, setEmissao] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [valor, setValor] = useState<number | ''>('')
  const [taxaMes, setTaxaMes] = useState<number | ''>('') // % a.m.
  const dias = useMemo(() => difDias(emissao, vencimento), [emissao, vencimento])

  // cálculos
  const { desconto, liquido, receber } = useMemo(() => {
    const v = Number(valor || 0)
    const t = Number(taxaMes || 0) / 100
    const d = dias
    const desc = v * t * (d / 30) // pró-rata simples por 30 dias
    const liq = Math.max(0, v - desc)
    return { desconto: desc, liquido: liq, receber: v }
  }, [valor, taxaMes, dias])

  // store/histórico
  const [itens, setItens] = useState<Nota[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      setItens(raw ? JSON.parse(raw) : [])
    } catch {
      setItens([])
    }
  }, [])

  const persist = (next: Nota[]) => {
    setItens(next)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next))
    } catch {}
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cedenteId || !sacadoId || !numero || !emissao || !vencimento || !valor || !taxaMes) return
    const novo: Nota = {
      id: 'NF-' + Date.now(),
      cedenteId,
      cedenteNome: cedSel?.nome || '',
      cnpjCedente: cedSel?.cnpj || '',
      sacadoId,
      sacadoNome: sacSel?.nome || '',
      cnpjSacado: sacSel?.cnpj || '',
      numero,
      emissao,
      vencimento,
      dias,
      valor: Number(valor),
      taxaMes: Number(taxaMes),
      desconto,
      liquidoCedente: liquido,
      valorAReceber: receber,
      anexos: [],
      status: 'pendente',
    }
    persist([novo, ...itens])

    // limpa
    setCedenteId(''); setSacadoId('')
    setNumero(''); setEmissao(''); setVencimento('')
    setValor(''); setTaxaMes('')
    alert('Nota salva!')
  }

  const remove = (id: string) => {
    if (!confirm('Excluir nota?')) return
    persist(itens.filter((i) => i.id !== id))
  }

  const changeStatus = (id: string, s: Nota['status']) =>
    persist(itens.map((i) => (i.id === id ? { ...i, status: s } : i)))

  const attach = (id: string) => {
    const el = fileRef.current; if (!el) return
    el.onchange = () => {
      const f = el.files?.[0]
      if (f) {
        const target = itens.find(x => x.id === id)
        const anexos = (target?.anexos || []).concat([{ name: f.name, size: f.size }])
        persist(itens.map(i => i.id === id ? { ...i, anexos } : i))
      }
      el.value = ''
    }
    el.click()
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Cadastrar Nota (Antecipação)</h1>

        {/* Formulário */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-sm mb-1">Cedente</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={cedenteId}
              onChange={(e) => setCedenteId(e.target.value)}
              required
            >
              <option value="">Selecione…</option>
              {cedentes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">CNPJ do Cedente</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={cedSel?.cnpj || ''} readOnly />
          </div>

          <div>
            <label className="block text-sm mb-1">Sacado</label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white"
              value={sacadoId}
              onChange={(e) => setSacadoId(e.target.value)}
              required
            >
              <option value="">Selecione…</option>
              {sacados.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">CNPJ do Sacado</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={sacSel?.cnpj || ''} readOnly />
          </div>

          <div>
            <label className="block text-sm mb-1">Número da Nota</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-white" value={numero} onChange={(e)=>setNumero(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm mb-1">Valor da Nota (R$)</label>
            <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 bg-white" value={valor}
                   onChange={(e)=>setValor(e.target.value===''?'':Number(e.target.value))} required />
          </div>

          <div>
            <label className="block text-sm mb-1">Data de Emissão</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 bg-white" value={emissao} onChange={(e)=>setEmissao(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm mb-1">Data de Vencimento</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 bg-white" value={vencimento} onChange={(e)=>setVencimento(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm mb-1">Taxa (% a.m.)</label>
            <input type="number" step="0.0001" className="w-full border rounded-lg px-3 py-2 bg-white"
                   value={taxaMes} onChange={(e)=>setTaxaMes(e.target.value===''?'':Number(e.target.value))} required />
          </div>

          {/* Resumo do cálculo */}
          <div className="sm:col-span-2 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded-lg border bg-white p-3">
                <div className="text-xs text-gray-500">Dias</div>
                <div className="text-lg font-semibold">{dias}</div>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <div className="text-xs text-gray-500">Desconto</div>
                <div className="text-lg font-semibold">{money(desconto || 0)}</div>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <div className="text-xs text-gray-500">Líquido ao Cedente</div>
                <div className="text-lg font-semibold">{money(liquido || 0)}</div>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <div className="text-xs text-gray-500">Valor a Receber (nominal)</div>
                <div className="text-lg font-semibold">{money(receber || 0)}</div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button className="px-4 py-2 rounded-xl bg-black text-white">Salvar</button>
          </div>
        </form>

        {/* Histórico das Notas salvas */}
        <input ref={fileRef} type="file" className="hidden" />
        <h2 className="text-lg font-medium mb-2">Notas cadastradas</h2>
        <div className="overflow-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">NF</th>
                <th className="px-4 py-2">Cedente</th>
                <th className="px-4 py-2">Sacado</th>
                <th className="px-4 py-2">Emissão</th>
                <th className="px-4 py-2">Venc.</th>
                <th className="px-4 py-2">Dias</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Taxa (% a.m.)</th>
                <th className="px-4 py-2">Desconto</th>
                <th className="px-4 py-2">Líquido</th>
                <th className="px-4 py-2">A Receber</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Anexos</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr><td colSpan={14} className="px-4 py-6 text-center text-gray-500">Sem registros.</td></tr>
              )}
              {itens.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="px-4 py-2">{i.numero}</td>
                  <td className="px-4 py-2">{i.cedenteNome}<div className="text-xs text-gray-500">{i.cnpjCedente}</div></td>
                  <td className="px-4 py-2">{i.sacadoNome}<div className="text-xs text-gray-500">{i.cnpjSacado}</div></td>
                  <td className="px-4 py-2">{i.emissao}</td>
                  <td className="px-4 py-2">{i.vencimento}</td>
                  <td className="px-4 py-2">{i.dias}</td>
                  <td className="px-4 py-2">{money(i.valor)}</td>
                  <td className="px-4 py-2">{i.taxaMes.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-2">{money(i.desconto)}</td>
                  <td className="px-4 py-2">{money(i.liquidoCedente)}</td>
                  <td className="px-4 py-2">{money(i.valorAReceber)}</td>
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
                  <td className="px-4 py-2">{i.anexos?.map(a=>a.name).join(', ') || '—'}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded" onClick={()=>attach(i.id)}>Anexar</button>
                      <button className="px-2 py-1 border rounded text-red-600" onClick={()=>remove(i.id)}>Excluir</button>
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
