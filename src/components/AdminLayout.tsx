// src/components/AdminLayout.tsx
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

function isActive(pathname: string, href: string) {
  // ativo se o path é exatamente href OU começa com href + '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 p-4 border-r bg-white">
        <div className="font-semibold mb-4">Admin</div>

        <nav className="space-y-1 text-sm">
          {/* Itens de topo */}
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
              isActive(pathname, '/operacoes') ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            Operações
          </Link>

          <Link
            href="/cedentes"
            className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
              isActive(pathname, '/cedentes') ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            Cedentes
          </Link>

          <Link
            href="/sacados"
            className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
              isActive(pathname, '/sacados') ? 'bg-gray-100 font-medium' : ''
            }`}
          >
            Sacados
          </Link>

          {/* Grupo: Movimentação */}
          <div className="mt-4">
            <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-500">
              Movimentação
            </div>

            <Link
              href="/movimentacao"
              className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
                pathname === '/movimentacao' ? 'bg-gray-100 font-medium' : ''
              }`}
            >
              Resumo
            </Link>

            <Link
              href="/contas-a-pagar"
              className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
                isActive(pathname, '/contas-a-pagar') ? 'bg-gray-100 font-medium' : ''
              }`}
            >
              Contas a Pagar
            </Link>

            <Link
              href="/contas-a-receber"
              className={`block rounded-xl px-3 py-2 hover:bg-gray-100 ${
                isActive(pathname, '/contas-a-receber') ? 'bg-gray-100 font-medium' : ''
              }`}
            >
              Contas a Receber
            </Link>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
