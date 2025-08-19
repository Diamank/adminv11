import Link from "next/link"
import AdminLayout from "@/components/AdminLayout"

// ícones inline (iguais ao padrão que usamos)
function IconCedente() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8" cy="8" r="3" />
      <path d="M15 11c2.761 0 5 2.239 5 5v3" />
      <path d="M3 16a5 5 0 0 1 10 0v3" />
      <rect x="14.5" y="4.5" width="6" height="4" rx="1.5" />
    </svg>
  )
}
function IconSacado() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="7" r="3" />
      <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
      <path d="M3 10h5M16 10h5" />
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

export default function Cadastro() {
  const cards = [
    {
      title: "Cedentes",
      desc: "Cadastre e gerencie cedentes, risco e documentos.",
      href: "/cedentes",
      icon: <IconCedente />,
      accent: "text-indigo-600",
    },
    {
      title: "Sacados",
      desc: "Cadastre e gerencie sacados, risco e contatos.",
      href: "/sacados",
      icon: <IconSacado />,
      accent: "text-emerald-600",
    },
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2">Cadastro</h1>
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
