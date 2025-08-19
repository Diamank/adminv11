import Link from "next/link"

// Ícones SVG inline (sem dependências)
function IconContrato() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 3h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/>
      <path d="M14 3v4h4"/>
      <path d="M8 11h8M8 15h8M8 7h4"/>
    </svg>
  )
}

function IconNota() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 4h9l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/>
      <path d="M15 4v3h3"/>
      <path d="M8 11h8M8 15h8"/>
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

export default function Operacoes() {
  const cards = [
    {
      title: "Cadastrar Contrato",
      desc: "Crie um contrato e defina o limite do cedente.",
      href: "/operacoes/novo-contrato",
      icon: <IconContrato />,
      accent: "text-indigo-600",
    },
    {
      title: "Cadastrar Nota Fiscal",
      desc: "Vincule a nota ao contrato e ao sacado.",
      href: "/operacoes/nova-nota",
      icon: <IconNota />,
      accent: "text-emerald-600",
    },
  ]

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Operações</h1>
        <p className="text-sm text-gray-500 mb-6">
          Selecione uma ação para começar.
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
  )
}
