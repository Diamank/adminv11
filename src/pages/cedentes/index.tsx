import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import { cedentesMock } from '@/mocks/cedentes'
import Link from 'next/link'
export default function Cedentes(){const headers=['Razão Social','CNPJ','Endereço','Conta bancária','Criado','Ações'];const rows=cedentesMock.map(c=>[c.razao,c.cnpj,c.endereco,c.contaBancaria,c.criadoEm,<Link key={c.id} className="text-blue-600" href={`/cedentes/novo?edit=${c.id}`}>Editar</Link>]);return(<AdminLayout><div className="mb-3"><Link href="/cedentes/novo" className="px-3 py-2 rounded-lg border bg-white">+ Novo cedente</Link></div><Table headers={headers} rows={rows}/></AdminLayout>)}
