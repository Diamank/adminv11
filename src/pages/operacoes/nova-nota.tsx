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
}: {
  label: string
  accept?: string
  file: File | null
  onChange: (f: File | null) => void
}) {
  const inputId = `up-${label.replace(/\W+/g, '').toLowerCase()}`

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.files?.[0] ?? null)

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    if (accept?.includes('.pdf') && !f.name.toLowerCase().endsWith('.pdf') && !accept?.includes('image/*')) {
      alert('Apenas PDF permitido aqui.')
      return
    }
    if (accept?.includes('image/*') && !f.type.startsWith('image/') && !f.name.toLowerCase().match(/\.(png|jpe?g|webp|gif)$/)) {
      alert('Envie uma imagem válida.')
      return
    }
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
        className={[
          "group relative w-full rounded-2xl border-2 border-dashed p-4",
          "bg-white hover:border-gray-400 transition",
          file ? "border-gray-300" : "border-gray-300",
        ].join(" ")}
      >
        {!file ? (
          <label htmlFor={inputId} className="flex cursor-pointer items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-70">
              <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1 7H8V7h7z"/>
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium">Arraste e solte o arquivo aqui</div>
              <div className="text-xs text-gray-500">ou clique para escolher (aceita {accept || 'arquivos'})</div>
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
  taxaMes: number // % a.m.
  desconto: number
  liquidoCedente: number
  valorAReceber: number
  anexos: Anexo[]
  status: 'pendente' | 'pago' | 'cancelado'
}

const LS_KEY = 'ops_notas_v2'
const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const diffDias = (a: string, b: string) => {
  if (!a || !b) return 0
  const d1 = new Date(a + 'T00:00:00')
  const d2 = new Date(b + 'T00:00:00')
  return Math.max(0, Math.round((+d2 - +d1) / (1000 * 60 * 60 * 24)))
}

export default function NovaNota() {
  // LISTA
  const [itens, setItens] = useState<Nota[]>([])
  const [busca, setBusca] = useState('')

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
  const [taxaMes, setTaxaMes] = useState<number | ''>('')

  // anexos
  const [nfFile, setNfFile] = useState<File | null>(null)
  const [boletoFile, setBoletoFile] = useState<File | null>(null)
  const [aditivoFile, setAditivoFile] = useState<File | null>(null)

  const cedente = useMemo(() => cedentesMock.find((c) => c.id === cedenteId), [cedenteId])
  const sacado = useMemo(() => sacadosMock.find((s) => s.id === sacadoId), [sacadoId])

  const dias = useMemo(() => diffDias(emissao, vencimento), [emissao, vencimento])
  const calc = useMemo(() => {
    const v = typeof valor === 'number' ? valor : 0
    const t = typeof taxaMes === 'number' ? taxaMes : 0
    const desconto = v * (t / 100) * (dias / 30)
    const liquido = Math.max(0, v - desconto)
    const receber = v // nominal
    return { desconto, liquido, receber }
  }, [valor, taxaMes, dias])

  const limparForm = () => {
    setCedenteId(''); setSacadoId(''); setNumero('')
    setEmissao(''); setVencimento(''); setValor(''); setTaxaMes('')
    setNfFile(null); setBoletoFile(null); setAditivoFile(null)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cedenteId || !sacadoId || !numero || !emissao || !vencimento || valor === '' || taxaMes === '') return

    const anexos: Anexo[] = []
    if (nfFile) anexos.push({ tipo: 'nota_fiscal', nome: nfFile.name, tamanho: nfFile.size, previewUrl: URL.createObjectURL(nfFile) })
    if (boletoFile) anexos.push({ tipo: 'boleto', nome: boletoFile.name, tamanho: boletoFile.size, previewUrl: URL.createObjectURL(boletoFile) })
    if (aditivoFile) anexos.push({ tipo: 'aditivo', nome: aditivoFile.name, tamanho: aditivoFile.size, previewUrl: URL.createObjectURL(aditivoFile) })

    const novo: Nota = {
      id: 'NF-' + Date.now(),
      cedenteId,
      cedenteNome: (cedente as any)?.razao || (cedente as any)?.nome || '',
      cnpjCedente: cedente?.cnpj || '',
      sacadoId,
      sacadoNome: (sacado as any)?.razao || (sacado as any)?.nome || '',
      cnpjSacado: sacado?.cnpj || '',
      numero,
      emissao, vencimento,
      dias,
      valor: Number(valor),
      taxaMes: Number(taxaMes),
      desconto: calc.desconto,
      liquidoCedente: calc.liquido,
      valorAReceber: calc.receber,
      anexos,
      status: 'pendente',
    }
    persist([novo, ...itens])
    limparForm()
    setMostrarForm(false)
    alert('Nota salva!')
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header + botão abrir/fechar formulário */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Notas</h1>
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            {mostrarForm ? 'Fechar' : 'Nova nota'}
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

        {/* LISTA */}
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
              {itensFiltrados.length === 0 && (
                <tr><td colSpan={14} className="px-4 py-6 text-center text-gray-500">Sem registros.</td></tr>
              )}
              {itensFiltrados.map((n) => (
                <tr key={n.id} className="border-t">
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
                    {n.anexos.length ? (
                      <div className="flex flex-wrap gap-2">
                        {n.anexos.map((a, idx) => (
                          <a
                            key={idx}
                            className="px-2 py-1 border rounded hover:bg-gray-50"
                            href={a.previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={a.nome}
                          >
                            {a.tipo === 'nota_fiscal' ? 'Nota Fiscal' : a.tipo === 'boleto' ? 'Boleto' : 'Aditivo'}
                          </a>
                        ))}
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-2">
                    <button className="px-2 py-1 border rounded text-red-600" onClick={() => remover(n.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FORM */}
        {mostrarForm && (
          <div className="border rounded-xl p-4 bg-white">
            <h2 className="text-lg font-medium mb-3">Cadastrar Nota (Antecipação)</h2>

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
                <input className="w-full border rounded-lg px-3 py-2 bg-white" value={numero} onChange={(e) => setNumero(e.target.value)} required />
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
                <label className="block text-sm mb-1">Valor da Nota (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={valor}
                  onChange={(e) => setValor(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Taxa (% a.m.)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={taxaMes}
                  onChange={(e) => setTaxaMes(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>

              {/* métricas */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Dias</div>
                  <div className="text-lg font-medium">{dias}</div>
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Desconto</div>
                  <div className="text-lg font-medium">{money(calc.desconto || 0)}</div>
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Líquido ao Cedente</div>
                  <div className="text-lg font-medium">{money(calc.liquido || 0)}</div>
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500">Valor a Receber (nominal)</div>
                  <div className="text-lg font-medium">{money(calc.receber || 0)}</div>
                </div>
              </div>

              {/* anexos (bonitos) */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                <UploadBox label="Anexo — Nota Fiscal" accept=".pdf,image/*" file={nfFile} onChange={setNfFile} />
                <UploadBox label="Anexo — Boleto" accept=".pdf,image/*" file={boletoFile} onChange={setBoletoFile} />
                <UploadBox label="Anexo — Aditivo" accept=".pdf,image/*" file={aditivoFile} onChange={setAditivoFile} />
              </div>

              <div className="md:col-span-2 pt-2 flex gap-3">
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
