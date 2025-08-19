import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

function isMovimentacaoPath(pathname: string) {
  return (
    pathname.startsWith('/movimentacao') ||
    pathname.startsWith('/contas-a-pagar') ||
    pathname.startsWith('/contas-a-receber')
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 p-4 border-r bg-white">
        <div className="font-semibold mb-4">Admin</div>

        <nav className="space-y-1 text-sm">
          <Link
            href="/"
            className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
              pathname === '/' ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            Painel
          </Link>

          <Link
            href="/operacoes"
            className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
              pathname.startsWith('/operacoes') ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            Operações
          </Link>

          <Link
            href="/cedentes"
            className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
              pathname.startsWith('/cedentes') ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            Cedentes
          </Link>

          <Link
            href="/sacados"
            className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
              pathname.startsWith('/sacados') ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            Sacados
          </Link>

          {/* ÚNICO item: Movimentação (sem submenu) */}
          <Link
            href="/movimentacao"
            className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
              isMovimentacaoPath(pathname) ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            Movimentação
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
