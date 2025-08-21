import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { cedentesMock } from '@/mocks/cedentes'
import { sacadosMock } from '@/mocks/sacados'

/* ================== UploadBox (drag&drop + estilizado) ================== */
function UploadBox({
  label,
  accept,
  file,
  onChange,
  helper,
}: {
  label: string
  accept?: string
  file: File | null
  onChange: (f: File | null) => void
  helper?: string
}) {
  const inputId = `up-${label.replace(/\W+/g, '').toLowerCase()}`
  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.files?.[0] ?? null)
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    onChange(f)
  }
  const human = (n: number) =>
    n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / (1024 * 1024)).toFixed(2)} MB`

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm mb-1">{label}</label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="group relative w-full rounded-2xl border-2 border-dashed p-4 bg-white hover:border-gray-400 transition border-gray-300"
      >
        {!file ? (
          <label htmlFor={inputId} className="flex cursor-pointer items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-70">
              <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1 7H8V7h7z"/>
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium">Arraste e solte o arquivo aqui</div>
              <div className="text-xs text-gray-500">
                {helper ?? <>ou clique para escolher (aceita {accept || 'arquivos'})</>}
              </div>
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{file.name}</div>
              <div className="text-xs text-gray-500">{human(file.size)}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor={inputId} className="px-3 py-1.5 text-sm rounded-lg border cursor-pointer hover:bg-gray-50">
                Trocar
              </label>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
              >
                Remover
              </button>
            </div>
          </div>
        )}
        <input id={inputId} type="file" accept={accept} className="hidden" onChange={onSelect} />
      </div>
    </div>
  )
}
/* ======================================================================= */

type AnexoTipo = 'nota_fiscal' | 'boleto' | 'aditivo'
type Anexo = { tipo: AnexoTipo; nome: string; tamanho: number; previewUrl?: string }

type Nota = {
  id: string
  cedenteId: string
  cedenteNome: string
  cnpjCedente: string
  sacadoId: string
  sacadoNome: string
  cnpjSacado: string
  numero: string
  emissao: string // yyyy-mm-dd
  vencimento: string // yyyy-mm-dd
  dias: number
  valor: number
  taxaMes: number // % a.m. (financeira)
  tarifaFixa: number // R$
  taxaAdmPerc: number // % sobre valor
  iofPerc: number // % sobre valor
  desconto: number
  liquidoCedente: number
  valorAReceber: number
  anexos: Anexo[]
  status: 'pendente' | 'pago' | 'cancelado'
}

const LS_KEY = 'ops_notas_v3'
const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const diffDias = (a: string, b: string) => {
  if (!a || !b) return 0
  const d1 = new Date(a + 'T00:00:00')
  const d2 = new Date(b + 'T00:00:00')
  return Math.max(0, Math.round((+d2 - +d1) / (1000 * 60 * 60 * 24)))
}

/* ============================ Helpers UI ============================ */
function InputMoney(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
      <input {...props} className={'w-full border rounded-lg pl-9 pr-3 py-2 bg-white ' + (props.className || '')} />
    </div>
  )
}
function InputPercent(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <input {...props} className={'w-full border rounded-lg pl-3 pr-9 py-2 bg-white ' + (props.className || '')} />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
    </div>
  )
}
/* ==================================================================== */

export default function NovaNota() {
  // LISTA
  const [itens, setItens] = useState<Nota[]>([])
  const [busca, setBusca] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // EDIÇÃO
  const [editingId, setEditingId] = useState<string | null>(null)

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
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
  }

  const remover = (id: string) => {
    if (!confirm('Excluir nota?')) return
    const alvo = itens.find((n) => n.id === id)
    alvo?.anexos?.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl) })
    persist(itens.filter((n) => n.id !== id))
    if (expandedId === id) setExpandedId(null)
    if (editingId === id) cancelarEdicao()
  }

  const itensFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return itens
    return itens.filter((n) =>
      [n.numero, n.cedenteNome, n.sacadoNome, n.cnpjCedente, n.cnpjSacado].some((v) =>
        v.toLowerCase().includes(q)
      )
    )
  }, [itens, busca])

  // FORM (colapsado)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cedenteId, setCedenteId] = useState('')
  const [sacadoId, setSacadoId] = useState('')
  const [numero, setNumero] = useState('')
  const [emissao, setEmissao] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [valor, setValor] = useState<number | ''>('')
  const [taxaMes, setTaxaMes] = useState<number | ''>('')        // financeira % a.m.
  const [tarifaFixa, setTarifaFixa] = useState<number | ''>('')  // R$
  const [taxaAdmPerc, setTaxaAdmPerc] = useState<number | ''>('')// % sobre valor
  const [iofPerc, setIofPerc] = useState<number | ''>('')        // % sobre valor

  const cedente = useMemo(() => cedentesMock.find((c) => c.id === cedenteId), [cedenteId])
  const sacado = useMemo(() => sacadosMock.find((s) => s.id === sacadoId), [sacadoId])

  const dias = useMemo(() => diffDias(emissao, vencimento), [emissao, vencimento])
  const calc = useMemo(() => {
    const v = typeof valor === 'number' ? valor : 0
    const t = typeof taxaMes === 'number' ? taxaMes : 0
    const fix = typeof tarifaFixa === 'number' ? tarifaFixa : 0
    const adm = typeof taxaAdmPerc === 'number' ? taxaAdmPerc : 0
    const iof = typeof iofPerc === 'number' ? iofPerc : 0

    const descontoFinanceiro = v * (t / 100) * (dias / 30)
    const descontoAdm = v * (adm / 100)
    const descontoIof = v * (iof / 100)
    const descontoTotal = descontoFinanceiro + fix + descontoAdm + descontoIof
    const liquido = Math.max(0, v - descontoTotal)
    const receber = v

    return { descontoFinanceiro, fix, descontoAdm, descontoIof, descontoTotal, liquido, receber }
  }, [valor, taxaMes, dias, tarifaFixa, taxaAdmPerc, iofPerc])

  // anexos (novos no form)
  const [nfFile, setNfFile] = useState<File | null>(null)
  const [boletoFile, setBoletoFile] = useState<File | null>(null)
  const [aditivoFile, setAditivoFile] = useState<File | null>(null)

  const limparForm = () => {
    setCedenteId(''); setSacadoId(''); setNumero('')
    setEmissao(''); setVencimento(''); setValor('')
    setTaxaMes(''); setTarifaFixa(''); setTaxaAdmPerc(''); setIofPerc('')
    setNfFile(null); setBoletoFile(null); setAditivoFile(null)
  }

  const iniciarEdicao = (nota: Nota) => {
    setEditingId(nota.id)
    setMostrarForm(true)
    setExpandedId(nota.id)

    setCedenteId(nota.cedenteId)
    setSacadoId(nota.sacadoId)
    setNumero(nota.numero)
    setEmissao(nota.emissao)
    setVencimento(nota.vencimento)
    setValor(nota.valor)
    setTaxaMes(nota.taxaMes)
    setTarifaFixa(nota.tarifaFixa)
    setTaxaAdmPerc(nota.taxaAdmPerc)
    setIofPerc(nota.iofPerc)

    // anexos existentes permanecem até você enviar novos (não populamos File aqui)
    setNfFile(null); setBoletoFile(null); setAditivoFile(null)
  }

  const cancelarEdicao = () => {
    setEditingId(null)
    limparForm()
    setMostrarForm(false)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cedenteId || !sacadoId || !numero || !emissao || !vencimento || valor === '' || taxaMes === '') return

    // monta anexos novos (se enviados)
    const novosAnexos: Anexo[] = []
    if (nfFile) novosAnexos.push({ tipo: 'nota_fiscal', nome: nfFile.name, tamanho: nfFile.size, previewUrl: URL.createObjectURL(nfFile) })
    if (boletoFile) novosAnexos.push({ tipo: 'boleto', nome: boletoFile.name, tamanho: boletoFile.size, previewUrl: URL.createObjectURL(boletoFile) })
    if (aditivoFile) novosAnexos.push({ tipo: 'aditivo', nome: aditivoFile.name, tamanho: aditivoFile.size, previewUrl: URL.createObjectURL(aditivoFile) })

    if (editingId) {
      // ATUALIZAR
      persist(itens.map(n => {
        if (n.id !== editingId) return n
        // se anexos novos foram enviados, substituímos apenas os tipos correspondentes
        let anexosAtualizados = [...n.anexos]
        for (const a of novosAnexos) {
          const idx = anexosAtualizados.findIndex(x => x.tipo === a.tipo)
          if (idx >= 0) {
            if (anexosAtualizados[idx].previewUrl) URL.revokeObjectURL(anexosAtualizados[idx].previewUrl!)
            anexosAtualizados[idx] = a
          } else {
            anexosAtualizados.push(a)
          }
        }
        return {
          ...n,
          cedenteId,
          cedenteNome: (cedentesMock.find(c => c.id === cedenteId) as any)?.razao || (cedentesMock.find(c => c.id === cedenteId) as any)?.nome || '',
          cnpjCedente: (cedentesMock.find(c => c.id === cedenteId) as any)?.cnpj || '',
          sacadoId,
          sacadoNome: (sacadosMock.find(s => s.id === sacadoId) as any)?.razao || (sacadosMock.find(s => s.id === sacadoId) as any)?.nome || '',
          cnpjSacado: (sacadosMock.find(s => s.id === sacadoId) as any)?.cnpj || '',
          numero,
          emissao, vencimento,
          dias,
          valor: Number(valor),
          taxaMes: Number(taxaMes),
          tarifaFixa: Number(tarifaFixa || 0),
          taxaAdmPerc: Number(taxaAdmPerc || 0),
          iofPerc: Number(iofPerc || 0),
          desconto: calc.descontoTotal,
          liquidoCedente: calc.liquido,
          valorAReceber: calc.receber,
          anexos: anexosAtualizados,
        }
      }))
      cancelarEdicao()
      setExpandedId(editingId)
      alert('Nota atualizada!')
      return
    }

    // NOVO
    const novo: Nota = {
      id: 'NF-' + Date.now(),
      cedenteId,
      cedenteNome: (cedentesMock.find(c => c.id === cedenteId) as any)?.razao || (cedentesMock.find(c => c.id === cedenteId) as any)?.nome || '',
      cnpjCedente: (cedentesMock.find(c => c.id === cedenteId) as any)?.cnpj || '',
      sacadoId,
      sacadoNome: (sacadosMock.find(s => s.id === sacadoId) as any)?.razao || (sacadosMock.find(s => s.id === sacadoId) as any)?.nome || '',
      cnpjSacado: (sacadosMock.find(s => s.id === sacadoId) as any)?.cnpj || '',
      numero,
      emissao, vencimento,
      dias,
      valor: Number(valor),
      taxaMes: Number(taxaMes),
      tarifaFixa: Number(tarifaFixa || 0),
      taxaAdmPerc: Number(taxaAdmPerc || 0),
      iofPerc: Number(iofPerc || 0),
      desconto: calc.descontoTotal,
      liquidoCedente: calc.liquido,
      valorAReceber: calc.receber,
      anexos: novosAnexos,
      status: 'pendente',
    }
    persist([novo, ...itens])
    limparForm()
    setMostrarForm(false)
    setExpandedId(novo.id)
    alert('Nota salva!')
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header + botão abrir/fechar formulário */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Notas</h1>
          <button
            onClick={() => { setMostrarForm(v => !v); if (!v) cancelarEdicao() }}
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            {mostrarForm ? 'Fechar' : (editingId ? 'Fechar' : 'Nova nota')}
          </button>
        </div>

        {/* Busca */}
        <div className="flex gap-3">
          <input
            placeholder="Buscar por NF, cedente, sacado, CNPJ…"
            className="w-full border rounded-lg px-3 py-2 bg-white"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* LISTA com expansível */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2 w-10"></th>
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
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-4 py-6 text-center text-gray-500">Sem registros.</td>
                </tr>
              )}

              {itensFiltrados.map((n) => {
                const open = expandedId === n.id
                return (
                  <>
                    <tr
                      key={n.id}
                      className={'border-t cursor-pointer hover:bg-gray-50 ' + (open ? 'bg-gray-50' : '')}
                      onClick={() => setExpandedId(open ? null : n.id)}
                    >
                      <td className="px-4 py-2">
                        <span className={'inline-block transition-transform ' + (open ? 'rotate-90' : '')}>▶</span>
                      </td>
                      <td className="px-4 py-2">{n.numero}</td>
                      <td className="px-4 py-2">{n.cedenteNome}</td>
                      <td className="px-4 py-2">{n.sacadoNome}</td>
                      <td className="px-4 py-2">{n.emissao}</td>
                      <td className="px-4 py-2">{n.vencimento}</td>
                      <td className="px-4 py-2">{n.dias}</td>
                      <td className="px-4 py-2">{money(n.valor)}</td>
                      <td className="px-4 py-2">{n.taxaMes.toFixed(2)}%</td>
                      <td className="px-4 py-2">{money(n.desconto)}</td>
                      <td className="px-4 py-2">{money(n.liquidoCedente)}</td>
                      <td className="px-4 py-2">{money(n.valorAReceber)}</td>
                      <td className="px-4 py-2 capitalize">{n.status}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 border rounded"
                            onClick={(e) => { e.stopPropagation(); iniciarEdicao(n) }}
                          >
                            Editar
                          </button>
                          <button
                            className="px-2 py-1 border rounded text-red-600"
                            onClick={(e) => { e.stopPropagation(); remover(n.id) }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Detalhes expandido */}
                    {open && (
                      <tr className="bg-gray-50 border-t">
                        <td colSpan={14} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-xl border bg-white p-4">
                              <div className="text-xs text-gray-500 mb-2">Cálculo</div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span>Valor da Nota</span><b>{money(n.valor)}</b></div>
                                <div className="flex justify-between"><span>Taxa financeira</span><span>{n.taxaMes.toFixed(2)}% a.m.</span></div>
                                <div className="flex justify-between"><span>Dias</span><span>{n.dias}</span></div>
                                <div className="flex justify-between"><span>Desconto financeiro</span><b>{money(n.valor * (n.taxaMes/100) * (n.dias/30))}</b></div>
                                <div className="flex justify-between"><span>Tarifa fixa</span><b>{money(n.tarifaFixa)}</b></div>
                                <div className="flex justify-between"><span>Taxa adm</span><b>{money(n.valor * (n.taxaAdmPerc/100))}</b></div>
                                <div className="flex justify-between"><span>IOF</span><b>{money(n.valor * (n.iofPerc/100))}</b></div>
                                <div className="flex justify-between border-t pt-2"><span>Desconto total</span><b>{money(n.desconto)}</b></div>
                                <div className="flex justify-between"><span>Líquido ao Cedente</span><b>{money(n.liquidoCedente)}</b></div>
                              </div>
                            </div>

                            <div className="rounded-xl border bg-white p-4">
                              <div className="text-xs text-gray-500 mb-2">Identificação</div>
                              <div className="space-y-1 text-sm">
                                <div><b>Cedente:</b> {n.cedenteNome} — {n.cnpjCedente}</div>
                                <div><b>Sacado:</b> {n.sacadoNome} — {n.cnpjSacado}</div>
                                <div><b>NF:</b> {n.numero}</div>
                                <div><b>Emissão/Venc.:</b> {n.emissao} → {n.vencimento}</div>
                              </div>
                            </div>

                            <div className="rounded-xl border bg-white p-4">
                              <div className="text-xs text-gray-500 mb-2">Anexos</div>
                              {n.anexos.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {n.anexos.map((a, idx) => (
                                    <a
                                      key={idx}
                                      className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                                      href={a.previewUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      title={a.nome}
                                    >
                                      {a.tipo === 'nota_fiscal' ? 'Nota Fiscal' : a.tipo === 'boleto' ? 'Boleto' : 'Aditivo'}
                                    </a>
                                  ))}
                                </div>
                              ) : <div className="text-gray-400 text-sm">Nenhum anexo.</div>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* FORM */}
        {mostrarForm && (
          <div className="border rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">
                {editingId ? 'Editar Nota' : 'Cadastrar Nota (Antecipação)'}
              </h2>
              {editingId && (
                <button type="button" onClick={cancelarEdicao} className="px-3 py-1.5 text-sm rounded-lg border">
                  Cancelar edição
                </button>
              )}
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Cedente</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={cedenteId}
                  onChange={(e) => setCedenteId(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {cedentesMock.map((c) => (
                    <option key={c.id} value={c.id}>
                      {(c as any).razao || (c as any).nome} — {c.cnpj}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">CNPJ do Cedente</label>
                <input className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={cedente?.cnpj || ''} readOnly />
              </div>

              <div>
                <label className="block text-sm mb-1">Sacado</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={sacadoId}
                  onChange={(e) => setSacadoId(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {sacadosMock.map((s) => (
                    <option key={s.id} value={s.id}>
                      {(s as any).razao || (s as any).nome} — {s.cnpj}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">CNPJ do Sacado</label>
                <input className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={sacado?.cnpj || ''} readOnly />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Número da Nota</label>
                <input className="w-full border rounded-lg px-3 py-2 bg-white" value={numero} onChange={(e) => setNumero(e.target.value)} required placeholder="Ex.: 12345" />
              </div>

              <div>
                <label className="block text-sm mb-1">Data de Emissão</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 bg-white" value={emissao} onChange={(e) => setEmissao(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm mb-1">Data de Vencimento</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 bg-white" value={vencimento} onChange={(e) => setVencimento(e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm mb-1">Valor da Nota</label>
                <InputMoney inputMode="decimal" step="0.01" value={String(valor)}
                  onChange={(e) => setValor(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0,00" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Taxa financeira (% a.m.)</label>
                <InputPercent inputMode="decimal" step="0.01" value={String(taxaMes)}
                  onChange={(e) => setTaxaMes(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex.: 3,5" required />
              </div>

              {/* Outras taxas */}
              <div>
                <label className="block text-sm mb-1">Tarifa fixa</label>
                <InputMoney inputMode="decimal" step="0.01" value={String(tarifaFixa)}
                  onChange={(e) => setTarifaFixa(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0,00" />
              </div>
              <div>
                <label className="block text-sm mb-1">Taxa administrativa (% sobre o valor)</label>
                <InputPercent inputMode="decimal" step="0.01" value={String(taxaAdmPerc)}
                  onChange={(e) => setTaxaAdmPerc(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0,00" />
              </div>
              <div>
                <label className="block text-sm mb-1">IOF (% sobre o valor)</label>
                <InputPercent inputMode="decimal" step="0.01" value={String(iofPerc)}
                  onChange={(e) => setIofPerc(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0,00" />
              </div>

              {/* métricas */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Dias</div>
                  <div className="text-lg font-medium">{dias}</div>
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Desconto financeiro</div>
                  <div className="text-lg font-medium">
                    {money((typeof valor==='number'?valor:0) * ((typeof taxaMes==='number'?taxaMes:0)/100) * (dias/30))}
                  </div>
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Outras taxas</div>
                  <div className="text-lg font-medium">
                    {money((typeof tarifaFixa==='number'?tarifaFixa:0) + (typeof valor==='number'?valor:0) * ((typeof taxaAdmPerc==='number'?taxaAdmPerc:0)/100 + (typeof iofPerc==='number'?iofPerc:0)/100))}
                  </div>
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Desconto total</div>
                  <div className="text-lg font-medium">{money(calc.descontoTotal || 0)}</div>
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Líquido ao Cedente</div>
                  <div className="text-lg font-medium">{money(calc.liquido || 0)}</div>
                </div>
              </div>

              {/* anexos (bonitos) */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                <UploadBox label="Anexo — Nota Fiscal" accept=".pdf,image/*" file={nfFile} onChange={setNfFile}
                  helper={editingId ? 'Deixe em branco para manter o arquivo atual' : undefined} />
                <UploadBox label="Anexo — Boleto" accept=".pdf,image/*" file={boletoFile} onChange={setBoletoFile}
                  helper={editingId ? 'Deixe em branco para manter o arquivo atual' : undefined} />
                <UploadBox label="Anexo — Aditivo" accept=".pdf,image/*" file={aditivoFile} onChange={setAditivoFile}
                  helper={editingId ? 'Deixe em branco para manter o arquivo atual' : undefined} />
              </div>

              <div className="md:col-span-2 pt-2 flex gap-3">
                <button className="px-4 py-2 rounded-xl bg-black text-white">
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => { editingId ? cancelarEdicao() : (limparForm(), setMostrarForm(false)) }}
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
