// pages/admin/cedentes/index.tsx
import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Risco = 'sem_risco' | 'moderado' | 'risco'

type Cedente = {
  id: string
  cnpj: string
  razao: string
  endereco?: string
  conta_bancaria?: string
  risco: Risco
  created_at: string
}

export default function CedentesPage() {
  const [cedentes, setCedentes] = useState<Cedente[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)

  const [form, setForm] = useState({
    cnpj: '',
    razao: '',
    endereco: '',
    conta_bancaria: '',
  })
  const [risco, setRisco] = useState<Risco>('sem_risco')

  // 🔹 Buscar cedentes
  const fetchCedentes = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('cedentes').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setCedentes(data as Cedente[])
    setLoading(false)
  }

  useEffect(() => {
    fetchCedentes()
  }, [])

  // 🔹 Salvar ou atualizar
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editing) {
      const { error } = await supabase
        .from('cedentes')
        .update({ ...form, risco })
        .eq('id', editing)
      if (error) {
        alert('Erro ao atualizar cedente')
        console.error(error)
        return
      }
      setEditing(null)
    } else {
      const { error } = await supabase
        .from('cedentes')
        .insert([{ ...form, risco }])
      if (error) {
        alert('Erro ao salvar cedente')
        console.error(error)
        return
      }
    }

    setForm({ cnpj: '', razao: '', endereco: '', conta_bancaria: '' })
    setRisco('sem_risco')
    fetchCedentes()
  }

  // 🔹 Excluir
  const deleteCedente = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este Cedente?')) return
    const { error } = await supabase.from('cedentes').delete().eq('id', id)
    if (error) alert('Erro ao excluir')
    else setCedentes(cedentes.filter(c => c.id !== id))
  }

  // 🔹 Editar
  const editCedente = (c: Cedente) => {
    setForm({
      cnpj: c.cnpj,
      razao: c.razao,
      endereco: c.endereco || '',
      conta_bancaria: c.conta_bancaria || '',
    })
    setRisco(c.risco)
    setEditing(c.id)
  }

  return (
    <AdminLayout>
      <h1 className="text-xl font-semibold mb-4">Gerenciar Cedentes</h1>

      {/* Formulário */}
      <form className="max-w-xl space-y-3 mb-8" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm mb-1">CNPJ</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.cnpj}
            onChange={e => setForm({ ...form, cnpj: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Razão Social</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.razao}
            onChange={e => setForm({ ...form, razao: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Endereço</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.endereco}
            onChange={e => setForm({ ...form, endereco: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Conta bancária</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.conta_bancaria}
            onChange={e => setForm({ ...form, conta_bancaria: e.target.value })}
          />
        </div>

        {/* ⬇️ Seleção de risco */}
        <div className="pt-1">
          <label className="block text-sm mb-2">Risco</label>
          <div className="flex items-center gap-6">
            {[
              { val: 'sem_risco', label: 'Sem risco', color: 'bg-green-500' },
              { val: 'moderado', label: 'Risco moderado', color: 'bg-yellow-400' },
              { val: 'risco', label: 'Risco', color: 'bg-red-500' },
            ].map(r => (
              <label key={r.val} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="risco"
                  value={r.val}
                  checked={risco === r.val}
                  onChange={() => setRisco(r.val as Risco)}
                  className="h-4 w-4"
                />
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                  <span className="text-sm text-gray-700">{r.label}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-black text-white">
            {editing ? 'Atualizar' : 'Salvar'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setForm({ cnpj: '', razao: '', endereco: '', conta_bancaria: '' })
                setRisco('sem_risco')
                setEditing(null)
              }}
              className="px-3 py-2 rounded-lg border bg-white text-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabela */}
      {loading ? (
        <p>Carregando...</p>
      ) : cedentes.length === 0 ? (
        <p>Nenhum cedente cadastrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-sm text-left">
              <tr>
                <th className="px-4 py-2 border-b">Razão Social</th>
                <th className="px-4 py-2 border-b">CNPJ</th>
                <th className="px-4 py-2 border-b">Endereço</th>
                <th className="px-4 py-2 border-b">Conta Bancária</th>
                <th className="px-4 py-2 border-b">Risco</th>
                <th className="px-4 py-2 border-b text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {cedentes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{c.razao}</td>
                  <td className="px-4 py-2 border-b">{c.cnpj}</td>
                  <td className="px-4 py-2 border-b">{c.endereco || '-'}</td>
                  <td className="px-4 py-2 border-b">{c.conta_bancaria || '-'}</td>
                  <td className="px-4 py-2 border-b">
                    {c.risco === 'sem_risco' && <span className="text-green-600">Sem risco</span>}
                    {c.risco === 'moderado' && <span className="text-yellow-600">Moderado</span>}
                    {c.risco === 'risco' && <span className="text-red-600">Risco</span>}
                  </td>
                  <td className="px-4 py-2 border-b text-center space-x-2">
                    <button
                      onClick={() => editCedente(c)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteCedente(c.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded-md"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
