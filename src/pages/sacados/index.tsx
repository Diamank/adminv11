import AdminLayout from '@/components/AdminLayout'
import Table from '@/components/Table'
import { sacadosMock } from '@/mocks/sacados'
import Link from 'next/link'
export default function Sacados(){const headers=['Razão Social','CNPJ','Endereço','Criado','Ações'];const rows=sacadosMock.map(s=>[s.razao,s.cnpj,s.endereco,s.criadoEm,<Link key={s.id} className="text-blue-600" href={`/sacados/novo?edit=${s.id}`}>Editar</Link>]);return(<AdminLayout><div className="mb-3"><Link href="/sacados/novo" className="px-3 py-2 rounded-lg border bg-white">+ Novo sacado</Link></div><Table headers={headers} rows={rows}/></AdminLayout>)}
