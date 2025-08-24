import { useEffect, useMemo, useState, Fragment } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabaseClient'

type Cedente = {
  id: string
  razao_social: string
  cnpj: string
}

type Sacado = {
  id: string
  razao_social: string
  cnpj: string
}

type Contrato = {
  id: string
  cedente_id: string
  tipo: string
  limite: number
}

type Nota = {
  id: string
  numero: string
  emissao: string
  vencimento: string
  valor: number
  taxa_mes: number
  tarifa_fixa: number
  taxa_adm_perc: number
  iof_perc: number
  desconto: number
  liquido_cedente: number
  valor_a_receber: number
  created_at: string
  cedentes?: Cedente
  sacados?: Sacado
  contratos?: Contrato
}

const money = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function NovaNota() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [cedentes, setCedentes] = useState<Cedente[]>([])
  const [sacados, setSacados] = useState<Sacado[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])

  // busca
  const [busca, setBusca] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // form
  const [mostrarForm, setMostrarForm] = useState(false)
  const [contratoId, setContratoId] = useState('')
  const [cedenteId, setCedenteId] = useState('')
  const [sacadoId, setSacadoId] = useState('')
  const [numero, setNumero] = useState('')
  const [emissao, setEmissao] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [valor, setValor] = useState<number | ''>('')
  const [taxaMes, setTaxaMes] = useState<number | ''>('')
  const [tarifaFixa, setTarifaFixa] = useState<number | ''>('')
  const [taxaAdmPerc, setTaxaAdmPerc] = useState<number | ''>('')
  const [iofPerc, setIofPerc] = useState<number | ''>('')

  const [limiteContrato, setLimiteContrato] = useState<number>(0)
  const [usadoContrato, setUsadoContrato] = useState<number>(0)

  // fetch inicial
  useEffect(() => {
    const fetchAll = async () => {
      const { data: ced } = await supabase.from('cedentes').select('id, razao_social, cnpj')
      if (ced) setCedentes(ced)

      const { data: sac } = await supabase.from('sacados').select('id, razao_social, cnpj')
      if (sac) setSacados(sac)

      const { data: ct } = await supabase.from('contratos').select('id, cedente_id, tipo, limite')
      if (ct) setContratos(ct)

      const { data: nt } = await supabase
        .from('notas')
        .select('*, cedentes(id, razao_social, cnpj), sacados(id, razao_social, cnpj), contratos(id, limite)')
        .order('created_at', { ascending: false })

      if (nt) setNotas(nt as any)
    }
    fetchAll()
  }, [])

  // quando seleciona contrato, calcula saldo
  useEffect(() => {
    const contrato = contratos.find(c => c.id === contratoId)
    if (!contrato) {
      setLimiteContrato(0)
      setUsadoContrato(0)
      return
    }
    setLimiteContrato(contrato.limite)

    const soma = notas
      .filter(n => n.contratos?.id === contrato.id)
      .reduce((acc, n) => acc + (n.valor || 0), 0)

    setUsadoContrato(soma)
  }, [contratoId, notas, contratos])

  const disponivel = limiteContrato - usadoContrato

  // salvar
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contratoId || !cedenteId || !sacadoId || !numero || !emissao || !vencimento || valor === '' || taxaMes === '') {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    if (Number(valor) > disponivel) {
      alert('❌ Valor da nota ultrapassa o limite disponível do contrato!')
      return
    }

    const v = Number(valor)
    const t = Number(taxaMes)
    const fix = Number(tarifaFixa || 0)
    const adm = Number(taxaAdmPerc || 0)
    const iof = Number(iofPerc || 0)

    const dias = Math.max(
      0,
      Math.round((+new Date(vencimento) - +new Date(emissao)) / (1000 * 60 * 60 * 24))
    )
    const descontoFinanceiro = v * (t / 100) * (dias / 30)
    const descontoAdm = v * (adm / 100)
    const descontoIof = v * (iof / 100)
    const descontoTotal = descontoFinanceiro + fix + descontoAdm + descontoIof
    const liquido = Math.max(0, v - descontoTotal)

    const { error } = await supabase.from('notas').insert([
      {
        contrato_id: contratoId,
        cedente_id: cedenteId,
        sacado_id: sacadoId,
        numero,
        emissao,
        vencimento,
        valor: v,
        taxa_mes: t,
        tarifa_fixa: fix,
        taxa_adm_perc: adm,
        iof_perc: iof,
        desconto: descontoTotal,
        liquido_cedente: liquido,
        valor_a_receber: v,
      },
    ])

    if (error) {
      alert('Erro ao salvar nota!')
      console.error(error)
    } else {
      alert('✅ Nota salva com sucesso!')
      window.location.reload()
    }
  }

  const itensFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return notas
    return notas.filter((n) =>
      [n.numero, n.cedentes?.razao_social, n.sacados?.razao_social, n.cedentes?.cnpj, n.sacados?.cnpj]
        .some(v => (v || '').toLowerCase().includes(q))
    )
  }, [notas, busca])

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Notas</h1>
          <button
            onClick={() => setMostrarForm(v => !v)}
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            {mostrarForm ? 'Fechar' : 'Nova nota'}
          </button>
        </div>

        {/* Busca */}
        <div className="flex gap-3">
          <input
            placeholder="Buscar por NF, cedente, sacado ou CNPJ…"
            className="w-full border rounded-lg px-3 py-2 bg-white"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* LISTA */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">NF</th>
                <th className="px-4 py-2">Cedente</th>
                <th className="px-4 py-2">Sacado</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Líquido</th>
                <th className="px-4 py-2">Criada em</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Sem registros.</td>
                </tr>
              )}
              {itensFiltrados.map(n => (
                <Fragment key={n.id}>
                  <tr
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                  >
                    <td className="px-4 py-2">{n.numero}</td>
                    <td className="px-4 py-2">{n.cedentes?.razao_social}</td>
                    <td className="px-4 py-2">{n.sacados?.razao_social}</td>
                    <td className="px-4 py-2">{money(n.valor)}</td>
                    <td className="px-4 py-2">{money(n.liquido_cedente)}</td>
                    <td className="px-4 py-2">
                      {new Date(n.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                  {expandedId === n.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div><b>Cedente:</b> {n.cedentes?.razao_social} — {n.cedentes?.cnpj}</div>
                        <div><b>Sacado:</b> {n.sacados?.razao_social} — {n.sacados?.cnpj}</div>
                        <div><b>Contrato:</b> {n.contratos?.id} (Limite {money(n.contratos?.limite)})</div>
                        <div><b>Taxa:</b> {n.taxa_mes}% a.m.</div>
                        <div><b>Desconto:</b> {money(n.desconto)}</div>
                        <div><b>Valor a Receber:</b> {money(n.valor_a_receber)}</div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* FORM */}
        {mostrarForm && (
          <div className="border rounded-xl p-4 bg-white">
            <h2 className="text-lg font-medium mb-3">Cadastrar Nota</h2>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Cedente */}
              <div>
                <label className="block text-sm mb-1">Cedente</label>
                <select
                  value={cedenteId}
                  onChange={(e) => setCedenteId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                >
                  <option value="">Selecione...</option>
                  {cedentes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.razao_social} — {c.cnpj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sacado */}
              <div>
                <label className="block text-sm mb-1">Sacado</label>
                <select
                  value={sacadoId}
                  onChange={(e) => setSacadoId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                >
                  <option value="">Selecione...</option>
                  {sacados.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.razao_social} — {s.cnpj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contrato */}
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Contrato</label>
                <select
                  value={contratoId}
                  onChange={(e) => setContratoId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                >
                  <option value="">Selecione...</option>
                  {contratos
                    .filter(c => c.cedente_id === cedenteId)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.tipo} — Limite {money(c.limite)}
                      </option>
                    ))}
                </select>
                {contratoId && (
                  <div className="text-xs text-gray-500 mt-1">
                    Limite: {money(limiteContrato)} — Usado: {money(usadoContrato)} — Disponível: <b>{money(disponivel)}</b>
                  </div>
                )}
              </div>

              {/* Dados nota */}
              <div>
                <label className="block text-sm mb-1">Número da Nota</label>
                <input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Emissão</label>
                <input
                  type="date"
                  value={emissao}
                  onChange={(e) => setEmissao(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Vencimento</label>
                <input
                  type="date"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                />
              </div>

              {/* Taxas */}
              <div>
                <label className="block text-sm mb-1">Taxa financeira (% a.m.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={taxaMes}
                  onChange={(e) => setTaxaMes(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tarifa fixa (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tarifaFixa}
                  onChange={(e) => setTarifaFixa(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Taxa Adm (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={taxaAdmPerc}
                  onChange={(e) => setTaxaAdmPerc(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">IOF (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={iofPerc}
                  onChange={(e) => setIofPerc(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                />
              </div>

              <div className="md:col-span-2 pt-2 flex gap-3">
                <button type="submit" className="px-4 py-2 rounded-xl bg-black text-white">
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
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
