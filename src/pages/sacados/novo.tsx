import AdminLayout from '@/components/AdminLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

type Risco = 'sem_risco' | 'moderado' | 'risco'

function formatCNPJ(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

export default function NovoSacado() {
  const router = useRouter()
  const { edit } = router.query

  const [form, setForm] = useState({
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    email: '',
    telefone: '',
    endereco: '',
    contato: '',
  })
  const [risco, setRisco] = useState<Risco>('sem_risco')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSacado = async () => {
      if (!edit) return
      setLoading(true)
      const { data, error } = await supabase.from('sacados').select('*').eq('id', edit).single()
      if (error) {
        console.error(error)
      } else if (data) {
        setForm({
          cnpj: formatCNPJ(data.cnpj || ''),
          razao_social: data.razao_social || '',
          nome_fantasia: data.nome_fantasia || '',
          email: data.email || '',
          telefone: data.telefone || '',
          endereco: data.endereco || '',
          contato: data.contato || '',
        })
        setRisco(data.risco as Risco)
      }
      setLoading(false)
    }
    fetchSacado()
  }, [edit])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cleanCNPJ = form.cnpj.replace(/\D/g, '')

    if (edit) {
      const { error } = await supabase
        .from('sacados')
        .update({ ...form, cnpj: cleanCNPJ, risco })
        .eq('id', edit)

      if (error) {
        alert('❌ Erro ao atualizar sacado!')
        console.error(error)
      } else {
        alert('✅ Sacado atualizado com sucesso!')
        router.push('/sacados')
      }
    } else {
      const { error } = await supabase.from('sacados').insert([{ ...form, cnpj: cleanCNPJ, risco }])
      if (error) {
        alert('❌ Erro ao salvar sacado!')
        console.error(error)
      } else {
        alert('✅ Sacado salvo com sucesso!')
        router.push('/sacados')
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
            onChange={e => setForm({ ...form, cnpj: formatCNPJ(e.target.value) })}
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
          <label className="block text-sm mb-1">Contato</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.contato}
            onChange={e => setForm({ ...form, contato: e.target.value })}
          />
        </div>

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
