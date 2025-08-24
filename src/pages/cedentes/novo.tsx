import AdminLayout from '@/components/AdminLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase' // ajuste para supabaseClient se você manteve esse nome

type Risco = 'sem_risco' | 'moderado' | 'risco'

export default function NovoCedente() {
  const router = useRouter()
  const { edit } = router.query

  const [form, setForm] = useState({
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    email: '',
    telefone: '',
    endereco: '',
    conta_bancaria: '',
  })
  const [risco, setRisco] = useState<Risco>('sem_risco')
  const [loading, setLoading] = useState(false)

  // Buscar cedente se estiver editando
  useEffect(() => {
    const fetchCedente = async () => {
      if (!edit) return
      setLoading(true)
      const { data, error } = await supabase.from('cedentes').select('*').eq('id', edit).single()
      if (error) {
        console.error(error)
      } else if (data) {
        setForm({
          cnpj: data.cnpj || '',
          razao_social: data.razao_social || '',
          nome_fantasia: data.nome_fantasia || '',
          email: data.email || '',
          telefone: data.telefone || '',
          endereco: data.endereco || '',
          conta_bancaria: data.conta_bancaria || '',
        })
        setRisco(data.risco as Risco)
      }
      setLoading(false)
    }
    fetchCedente()
  }, [edit])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (edit) {
      // Atualiza
      const { error } = await supabase
        .from('cedentes')
        .update({ ...form, risco })
        .eq('id', edit)

      if (error) {
        alert('❌ Erro ao atualizar cedente!')
        console.error(error)
      } else {
        alert('✅ Cedente atualizado com sucesso!')
        router.push('/cedentes')
      }
    } else {
      // Novo cadastro
      const { error } = await supabase.from('cedentes').insert([{ ...form, risco }])
      if (error) {
        alert('❌ Erro ao salvar cedente!')
        console.error(error)
      } else {
        alert('✅ Cedente salvo com sucesso!')
        router.push('/cedentes')
      }
    }

    setLoading(false)
  }

  return (
    <AdminLayout>
      <form className="max-w-xl space-y-3" onSubmit={onSubmit}>
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
            value={form.razao_social}
            onChange={e => setForm({ ...form, razao_social: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Nome Fantasia</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.nome_fantasia}
            onChange={e => setForm({ ...form, nome_fantasia: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Telefone</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.telefone}
            onChange={e => setForm({ ...form, telefone: e.target.value })}
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
          <label className="block text-sm mb-1">Conta Bancária</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.conta_bancaria}
            onChange={e => setForm({ ...form, conta_bancaria: e.target.value })}
          />
        </div>

        {/* Seleção de risco */}
        <div className="pt-1">
          <label className="block text-sm mb-2">Risco</label>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="risco"
                value="sem_risco"
                checked={risco === 'sem_risco'}
                onChange={() => setRisco('sem_risco')}
                className="h-4 w-4"
              />
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-sm text-gray-700">Sem risco</span>
              </span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="risco"
                value="moderado"
                checked={risco === 'moderado'}
                onChange={() => setRisco('moderado')}
                className="h-4 w-4"
              />
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="text-sm text-gray-700">Risco moderado</span>
              </span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="risco"
                value="risco"
                checked={risco === 'risco'}
                onChange={() => setRisco('risco')}
                className="h-4 w-4"
              />
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-sm text-gray-700">Risco</span>
              </span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
          >
            {edit ? 'Atualizar' : 'Salvar'}
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg border bg-white text-gray-400 cursor-not-allowed"
            disabled
          >
            Anexar documentos (em breve)
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
