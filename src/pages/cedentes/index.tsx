import AdminLayout from '@/components/AdminLayout'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Cedente = {
  id: number
  cnpj: string
  razao_social: string
  nome_fantasia: string
  email: string
  telefone: string
  endereco: string
  conta_bancaria: string
  risco: string
}

type Risco = 'sem_risco' | 'moderado' | 'risco'

export default function CedentesPage() {
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
  const [cedentes, setCedentes] = useState<Cedente[]>([])

  useEffect(() => {
    carregarCedentes()
  }, [])

  const carregarCedentes = async () => {
    const { data, error } = await supabase.from('cedentes').select('*').order('id', { ascending: false })
    if (!error) setCedentes(data || [])
  }

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('cedentes').insert([{ ...form, risco }])
    if (!error) {
      setForm({
        cnpj: '',
        razao_social: '',
        nome_fantasia: '',
        email: '',
        telefone: '',
        endereco: '',
        conta_bancaria: '',
      })
      setRisco('sem_risco')
      carregarCedentes()
    } else {
      alert('Erro: ' + error.message)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Gerenciar Cedentes</h1>

      <form className="max-w-xl space-y-3 mb-10" onSubmit={onSubmit}>
        {/* CNPJ */}
        <div>
          <label className="block text-sm mb-1">CNPJ</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.cnpj}
            onChange={e => setForm({ ...form, cnpj: formatCNPJ(e.target.value) })}
            required
          />
        </div>

        {/* Razão Social */}
        <div>
          <label className="block text-sm mb-1">Razão Social</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.razao_social}
            onChange={e => setForm({ ...form, razao_social: e.target.value })}
            required
          />
        </div>

        {/* Nome Fantasia */}
        <div>
          <label className="block text-sm mb-1">Nome Fantasia</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.nome_fantasia}
            onChange={e => setForm({ ...form, nome_fantasia: e.target.value })}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm mb-1">Telefone</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.telefone}
            onChange={e => setForm({ ...form, telefone: formatPhone(e.target.value) })}
          />
        </div>

        {/* Endereço */}
        <div>
          <label className="block text-sm mb-1">Endereço</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.endereco}
            onChange={e => setForm({ ...form, endereco: e.target.value })}
          />
        </div>

        {/* Conta bancária */}
        <div>
          <label className="block text-sm mb-1">Conta bancária</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.conta_bancaria}
            onChange={e => setForm({ ...form, conta_bancaria: e.target.value })}
          />
        </div>

        {/* Risco */}
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
          <button className="px-4 py-2 rounded-xl bg-black text-white">Salvar</button>
        </div>
      </form>

      {/* LISTA */}
      <h2 className="text-xl font-semibold mb-3">Cedentes cadastrados</h2>
      {cedentes.length === 0 ? (
        <p className="text-gray-500">Nenhum cedente cadastrado.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 border">CNPJ</th>
              <th className="px-3 py-2 border">Razão Social</th>
              <th className="px-3 py-2 border">Nome Fantasia</th>
              <th className="px-3 py-2 border">Email</th>
              <th className="px-3 py-2 border">Telefone</th>
              <th className="px-3 py-2 border">Endereço</th>
              <th className="px-3 py-2 border">Conta</th>
              <th className="px-3 py-2 border">Risco</th>
            </tr>
          </thead>
          <tbody>
            {cedentes.map(c => (
              <tr key={c.id}>
                <td className="px-3 py-2 border">{c.cnpj}</td>
                <td className="px-3 py-2 border">{c.razao_social}</td>
                <td className="px-3 py-2 border">{c.nome_fantasia}</td>
                <td className="px-3 py-2 border">{c.email}</td>
                <td className="px-3 py-2 border">{c.telefone}</td>
                <td className="px-3 py-2 border">{c.endereco}</td>
                <td className="px-3 py-2 border">{c.conta_bancaria}</td>
                <td className="px-3 py-2 border">{c.risco}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  )
}
