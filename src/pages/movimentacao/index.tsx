import Link from "next/link"
import AdminLayout from "@/components/AdminLayout"

// Ícones inline no mesmo estilo
function IconPagar() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </svg>
  )
}
function IconReceber() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 12h8M8 8h8M8 16h5" />
    </svg>
  )
}
function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-0.5">
      <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Movimentacao() {
  const cards = [
    {
      title: "Contas a Pagar",
      desc: "Gerencie pagamentos, filtre e gere PDF.",
      href: "/contas-a-pagar",
      icon: <IconPagar />,
      accent: "text-indigo-600",
    },
    {
      title: "Contas a Receber",
      desc: "Acompanhe recebimentos, filtros e relatório.",
      href: "/contas-a-receber",
      icon: <IconReceber />,
      accent: "text-emerald-600",
    },
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2">Movimentação</h1>
          <p className="text-sm text-gray-500 mb-6">
            Selecione uma área para começar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((c, i) => (
              <Link
                key={i}
                href={c.href}
                className="group rounded-xl border bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-gray-100 text-gray-700 group-hover:bg-gray-200">
                    <span className={c.accent}>{c.icon}</span>
                  </div>

                  <div className="flex-1">
                    <div className="text-base font-medium">{c.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
                  </div>

                  <IconArrow />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
