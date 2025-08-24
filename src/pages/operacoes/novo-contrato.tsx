import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabaseClient'

type TipoContrato = 'Materiais' | 'Serviços'

type Cedente = {
  id: string
  razao_social: string
  nome_fantasia?: string
  cnpj: string
}

type Contrato = {
  id: string
  cedente_id: string
  cedente?: Cedente
  tipo: TipoContrato
  limite: number
  criado_em: string
  anexo_url?: string
}

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function NovoContrato() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [cedentes, setCedentes] = useState<Cedente[]>([])
  const [busca, setBusca] = useState('')

  // FORM
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cedenteId, setCedenteId] = useState('')
  const [tipo, setTipo] = useState<TipoContrato>('Materiais')
  const [limite, setLimite] = useState<number | ''>('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // Buscar cedentes
  useEffect(() => {
    const fetchCedentes = async () => {
      const { data, error } = await supabase
        .from('cedentes')
        .select('id, razao_social, nome_fantasia, cnpj')
        .order('razao_social')

      if (!error && data) setCedentes(data)
    }
    fetchCedentes()
  }, [])

  // Buscar contratos
  useEffect(() => {
    const fetchContratos = async () => {
      const { data, error } = await supabase
        .from('contratos')
        .select('id, tipo, limite, criado_em, anexo_url, cedentes(id, razao_social, nome_fantasia, cnpj)')
        .order('criado_em', { ascending: false })

      if (!error && data) {
        setContratos(
          data.map((c: any) => ({
            id: c.id,
            tipo: c.tipo,
            limite: c.limite,
            criado_em: c.criado_em,
            anexo_url: c.anexo_url,
            cedente_id: c.cedentes?.id,
            cedente: c.cedentes,
          }))
        )
      }
    }
    fetchContratos()
  }, [])

  const cedenteSel = useMemo(
    () => cedentes.find((c) => c.id === cedenteId),
    [cedentes, cedenteId]
  )

  const itensFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return contratos
    return contratos.filter((i) =>
      [
        i.cedente?.razao_social || '',
        i.cedente?.cnpj || '',
        i.tipo,
      ].some((v) => v.toLowerCase().includes(q))
    )
  }, [contratos, busca])

  const limparForm = () => {
    setCedenteId('')
    setTipo('Materiais')
    setLimite('')
    setArquivo(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cedenteId || limite === '' || Number(limite) <= 0) return

    setLoading(true)

    let anexoUrl
    if (arquivo) {
      const filePath = `contratos/${Date.now()}-${arquivo.name}`
      const { error: uploadError } = await supabase.storage
        .from('anexos')
        .upload(filePath, arquivo)

      if (!uploadError) {
        const { data } = supabase.storage.from('anexos').getPublicUrl(filePath)
        anexoUrl = data.publicUrl
      }
    }

    const { error } = await supabase.from('contratos').insert([
      {
        cedente_id: cedenteId,
        tipo,
        limite: Number(limite),
        anexo_url: anexoUrl,
      },
    ])

    if (error) {
      alert('❌ Erro ao salvar contrato!')
      console.error(error)
    } else {
      alert('✅ Contrato salvo com sucesso!')
      window.location.reload()
    }

    setLoading(false)
  }

  const remover = async (id: string) => {
    if (!confirm('Excluir contrato?')) return
    const { error } = await supabase.from('contratos').delete().eq('id', id)
    if (error) {
      alert('❌ Erro ao excluir')
    } else {
      setContratos((prev) => prev.filter((i) => i.id !== id))
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Contratos</h1>
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            {mostrarForm ? 'Fechar' : 'Novo contrato'}
          </button>
        </div>

        <div className="flex gap-3">
          <input
            placeholder="Buscar por cedente, CNPJ ou tipo…"
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
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Cedente</th>
                <th className="px-4 py-2">CNPJ</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Limite</th>
                <th className="px-4 py-2">Anexo</th>
                <th className="px-4 py-2">Criado</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    Sem registros.
                  </td>
                </tr>
              )}
              {itensFiltrados.map((i, idx) => (
                <tr key={i.id} className="border-t">
                  <td className="px-4 py-2">{String(idx + 1).padStart(3, '0')}</td>
                  <td className="px-4 py-2">{i.cedente?.razao_social}</td>
                  <td className="px-4 py-2">{i.cedente?.cnpj}</td>
                  <td className="px-4 py-2">
                    {i.tipo === 'Materiais'
                      ? 'Cessão de crédito - Materiais'
                      : 'Cessão de crédito - Serviços'}
                  </td>
                  <td className="px-4 py-2">{money(i.limite)}</td>
                  <td className="px-4 py-2">
                    {i.anexo_url ? (
                      <a
                        className="px-2 py-1 border rounded hover:bg-gray-50"
                        href={i.anexo_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(i.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
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

        {/* FORM */}
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
                  {cedentes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razao_social} — {c.cnpj}
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
                  <option value="Materiais">Cessão de crédito - Materiais</option>
                  <option value="Serviços">Cessão de crédito - Serviços</option>
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

              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Arquivo do contrato (PDF/Imagem)</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                />
                {arquivo && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selecionado: <b>{arquivo.name}</b> — {(arquivo.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    limparForm()
                    setMostrarForm(false)
                  }}
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
