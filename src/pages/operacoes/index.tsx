import AdminLayout from '@/components/AdminLayout'
import Link from 'next/link'
export default function Operacoes(){return(<AdminLayout><div className="grid sm:grid-cols-2 gap-4"><Link href="/operacoes/novo-contrato" className="p-5 border rounded-2xl bg-white hover:bg-gray-50">Cadastrar Contrato</Link><Link href="/operacoes/nova-nota" className="p-5 border rounded-2xl bg-white hover:bg-gray-50">Cadastrar Nota Fiscal</Link></div></AdminLayout>)}
