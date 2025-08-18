import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter()
  const links = [
    { href: '/', label: 'Painel' },
    { href: '/operacoes', label: 'Operações' },
    { href: '/cedentes', label: 'Cedentes' },
    { href: '/sacados', label: 'Sacados' },
    { href: '/contas-a-pagar', label: 'Contas a Pagar' },
    { href: '/contas-a-receber', label: 'Contas a Receber' },
  ]
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 p-4 border-r bg-white">
        <div className="font-semibold mb-4">Admin</div>
        <nav className="space-y-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${pathname===l.href?'bg-gray-100 font-medium':''}`}>
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
